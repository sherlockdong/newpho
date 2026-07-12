import { FieldValue } from "firebase-admin/firestore";

import {
  buildProgressUpdates,
  checkNodeAccessible,
  qualifiesForMastery,
} from "../../../lib/quizUtils";
import {
  getAdminFirestore,
  verifyFirebaseToken,
} from "../../../middleware/auth";

type ProgressRequestBody = {
  progressCollection?: string;
  nodeId?: string;
  correctCount?: number;
  totalQuestions?: number;
  unlocksMap?: Record<string, string[]>;
  prerequisitesMap?: Record<string, string[]>;
};

const ALLOWED_PROGRESS_COLLECTIONS = new Set([
  "mechanics",
  "electricity",
  "F=ma",
  "Physics Bowl",
  "USAPhO",
]);

function validateBody(
  value: unknown,
):
  | { body: Required<ProgressRequestBody>; response?: never }
  | { body?: never; response: Response } {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {
      response: Response.json(
        { error: "Request body must be a JSON object" },
        { status: 400 },
      ),
    };
  }

  const body = value as ProgressRequestBody;

  if (
    typeof body.progressCollection !== "string" ||
    !ALLOWED_PROGRESS_COLLECTIONS.has(body.progressCollection)
  ) {
    return {
      response: Response.json(
        { error: "Invalid progress collection" },
        { status: 400 },
      ),
    };
  }

  if (typeof body.nodeId !== "string" || !body.nodeId.trim()) {
    return {
      response: Response.json({ error: "Invalid node ID" }, { status: 400 }),
    };
  }

  if (
    typeof body.correctCount !== "number" ||
    !Number.isFinite(body.correctCount) ||
    typeof body.totalQuestions !== "number" ||
    !Number.isFinite(body.totalQuestions) ||
    body.totalQuestions <= 0 ||
    body.correctCount < 0 ||
    body.correctCount > body.totalQuestions
  ) {
    return {
      response: Response.json(
        { error: "Invalid score or total question count" },
        { status: 400 },
      ),
    };
  }

  if (
    typeof body.unlocksMap !== "object" ||
    body.unlocksMap === null ||
    Array.isArray(body.unlocksMap) ||
    typeof body.prerequisitesMap !== "object" ||
    body.prerequisitesMap === null ||
    Array.isArray(body.prerequisitesMap)
  ) {
    return {
      response: Response.json(
        { error: "Invalid unlock or prerequisite maps" },
        { status: 400 },
      ),
    };
  }

  return {
    body: {
      progressCollection: body.progressCollection,
      nodeId: body.nodeId,
      correctCount: body.correctCount,
      totalQuestions: body.totalQuestions,
      unlocksMap: body.unlocksMap,
      prerequisitesMap: body.prerequisitesMap,
    },
  };
}

export async function POST(request: Request): Promise<Response> {
  try {
    const authResult = await verifyFirebaseToken(request);

    if (authResult.response) {
      return authResult.response;
    }

    const rawBody: unknown = await request.json();
    const validation = validateBody(rawBody);

    if (validation.response) {
      return validation.response;
    }

    const {
      progressCollection,
      nodeId,
      correctCount,
      totalQuestions,
      unlocksMap,
      prerequisitesMap,
    } = validation.body;

    const database = getAdminFirestore();
    const progressRef = database
      .collection("users")
      .doc(authResult.user.uid)
      .collection("progress")
      .doc(progressCollection);

    const result = await database.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(progressRef);
      const current = (
        snapshot.exists ? snapshot.data() : {}
      ) as Record<string, string>;

      if (!checkNodeAccessible(nodeId, prerequisitesMap, current)) {
        return {
          ok: false as const,
          status: 403,
          error: "Prerequisites for this node are not met.",
        };
      }

      const updates = buildProgressUpdates(
        nodeId,
        unlocksMap,
        prerequisitesMap,
        current,
        correctCount,
        totalQuestions,
      );

      transaction.set(
        progressRef,
        {
          ...updates,
          lastUpdated: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      return {
        ok: true as const,
        mastered: qualifiesForMastery(correctCount, totalQuestions),
      };
    });

    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status });
    }

    return Response.json({
      mastered: result.mastered,
      message: result.mastered
        ? "Node mastered and eligible unlocks applied."
        : "Quiz completed. Mastery threshold not reached.",
    });
  } catch (error: unknown) {
    console.error("POST /api/progress failed:", error);

    return Response.json(
      { error: "Failed to update progress" },
      { status: 500 },
    );
  }
}
