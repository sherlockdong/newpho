import { quizLogWrite } from "../../../lib/quizLogWrite";
import { readQuizHistory } from "../../../lib/server/quizHistory";
import {
  FieldValue,
} from "firebase-admin/firestore";

import {
  getAdminFirestore,
  verifyFirebaseToken,
} from "../../../middleware/auth";

type RequestBody = Record<string, unknown>;

function validateRequestedUserId(
  requestedUserId: string | null,
  authenticatedUserId: string,
): Response | null {
  if (requestedUserId && requestedUserId !== authenticatedUserId) {
    return Response.json(
      { error: "You cannot access another user's logs" },
      { status: 403 },
    );
  }

  return null;
}

export async function GET(request: Request): Promise<Response> {
  try {
    const authResult = await verifyFirebaseToken(request);

    if (authResult.response) {
      return authResult.response;
    }

    const url = new URL(request.url);
    const requestedUserId = url.searchParams.get("userId");

    const authorizationError = validateRequestedUserId(
      requestedUserId,
      authResult.user.uid,
    );

    if (authorizationError) {
      return authorizationError;
    }

    const logs = await readQuizHistory(authResult.user.uid);

    return Response.json(logs);
  } catch (error: unknown) {
    console.error("GET /api/logs failed:", error);

    return Response.json(
      { error: "Failed to retrieve logs" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const authResult = await verifyFirebaseToken(request);

    if (authResult.response) {
      return authResult.response;
    }

    const rawBody: unknown = await request.json();

    if (
      typeof rawBody !== "object" ||
      rawBody === null ||
      Array.isArray(rawBody)
    ) {
      return Response.json(
        { error: "Request body must be a JSON object" },
        { status: 400 },
      );
    }

    const body: RequestBody = { ...rawBody };

    const requestedUserId =
      typeof body.userId === "string" ? body.userId : null;

    const authorizationError = validateRequestedUserId(
      requestedUserId,
      authResult.user.uid,
    );

    if (authorizationError) {
      return authorizationError;
    }

    // Do not let the client choose protected server-controlled values.
    delete body.userId;
    delete body.logId;
    delete body.timestamp;

    const attemptId = body.attemptId;
    if (attemptId !== undefined && (typeof attemptId !== "string" || !/^[a-zA-Z0-9-]{1,80}$/.test(attemptId))) {
      return Response.json({ error: "Invalid attempt ID" }, { status: 400 });
    }
    if (!Number.isInteger(body.score) || !Number.isInteger(body.totalQuestions) ||
        Number(body.totalQuestions) < 1 || Number(body.totalQuestions) > 100 ||
        Number(body.score) < 0 || Number(body.score) > Number(body.totalQuestions) ||
        typeof body.topic !== "string" || body.topic.length > 300 ||
        Buffer.byteLength(JSON.stringify(body)) > 300_000) {
      return Response.json({ error: "Invalid quiz result" }, { status: 400 });
    }
    const collection = getAdminFirestore().collection("users").doc(authResult.user.uid).collection("analysisLogs");
    const document = typeof attemptId === "string" ? collection.doc(attemptId) : collection.doc();
    await getAdminFirestore().runTransaction(async (transaction) => {
      const existing = await transaction.get(document);
      const write = quizLogWrite(existing.exists, body);
      if (existing.exists) {
        if (write) transaction.update(document, write);
      } else {
        transaction.create(document, {
          ...write, userId: authResult.user.uid, timestamp: FieldValue.serverTimestamp(),
        });
      }
    });
    return Response.json({ logId: document.id }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/logs failed:", error);

    return Response.json(
      { error: "Failed to save log" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request): Promise<Response> {
  try {
    const authResult = await verifyFirebaseToken(request);

    if (authResult.response) {
      return authResult.response;
    }

    const url = new URL(request.url);
    const requestedUserId = url.searchParams.get("userId");

    const authorizationError = validateRequestedUserId(
      requestedUserId,
      authResult.user.uid,
    );

    if (authorizationError) {
      return authorizationError;
    }

    const database = getAdminFirestore();
    const logsReference = database
      .collection("users")
      .doc(authResult.user.uid)
      .collection("analysisLogs");

    const [snapshot, legacy, user] = await Promise.all([
      logsReference.get(), database.collection("quizLogs").where("userId", "==", authResult.user.uid).get(),
      database.collection("users").doc(authResult.user.uid).get(),
    ]);
    const documents = [...snapshot.docs, ...legacy.docs];
    const chunkSize = 400;

    for (
      let start = 0;
      start < documents.length;
      start += chunkSize
    ) {
      const batch = database.batch();
      const chunk = documents.slice(start, start + chunkSize);

      for (const document of chunk) {
        batch.delete(document.ref);
      }

      await batch.commit();
    }

    if (user.exists) await user.ref.update({ analysisLogs: FieldValue.delete() });
    await database.collection("users").doc(authResult.user.uid).collection("studyPlans").doc("current").delete();
    return Response.json({
      message: "Logs deleted",
      deletedCount: documents.length + (Array.isArray(user.data()?.analysisLogs) ? user.data().analysisLogs.length : 0),
    });
  } catch (error: unknown) {
    console.error("DELETE /api/logs failed:", error);

    return Response.json(
      { error: "Failed to delete logs" },
      { status: 500 },
    );
  }
}