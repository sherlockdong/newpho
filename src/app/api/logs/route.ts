import {
  FieldValue,
  Timestamp,
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

    const snapshot = await getAdminFirestore()
      .collection("users")
      .doc(authResult.user.uid)
      .collection("analysisLogs")
      .orderBy("timestamp", "desc")
      .get();

    const logs = snapshot.docs.map((document) => {
      const data = document.data();

      return {
        ...data,
        logId: document.id,
        timestamp:
          data.timestamp instanceof Timestamp
            ? data.timestamp.toDate().toISOString()
            : data.timestamp ?? null,
      };
    });

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

    const document = await getAdminFirestore()
      .collection("users")
      .doc(authResult.user.uid)
      .collection("analysisLogs")
      .add({
        ...body,
        userId: authResult.user.uid,
        timestamp: FieldValue.serverTimestamp(),
      });

    return Response.json(
      { logId: document.id },
      { status: 201 },
    );
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

    const snapshot = await logsReference.get();
    const chunkSize = 400;

    for (
      let start = 0;
      start < snapshot.docs.length;
      start += chunkSize
    ) {
      const batch = database.batch();
      const chunk = snapshot.docs.slice(start, start + chunkSize);

      for (const document of chunk) {
        batch.delete(document.ref);
      }

      await batch.commit();
    }

    return Response.json({
      message: "Logs deleted",
      deletedCount: snapshot.size,
    });
  } catch (error: unknown) {
    console.error("DELETE /api/logs failed:", error);

    return Response.json(
      { error: "Failed to delete logs" },
      { status: 500 },
    );
  }
}