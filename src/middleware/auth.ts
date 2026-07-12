import {
  cert,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import {
  getAuth,
  type DecodedIdToken,
} from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

type ServiceAccountJson = {
  project_id: string;
  client_email: string;
  private_key: string;
};

type VerifyTokenResult =
  | {
    user: DecodedIdToken;
    response?: never;
  }
  | {
    user?: never;
    response: Response;
  };

class FirebaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FirebaseConfigurationError";
  }
}

let cachedAdminApp: App | null = null;

function parseServiceAccount(): ServiceAccount {
  const rawCredentials = process.env.FIREBASE_CREDENTIALS;

  if (!rawCredentials) {
    throw new FirebaseConfigurationError(
      "FIREBASE_CREDENTIALS is not configured",
    );
  }

  let credentials: unknown;

  try {
    credentials = JSON.parse(rawCredentials);
  } catch {
    throw new FirebaseConfigurationError(
      "FIREBASE_CREDENTIALS does not contain valid JSON",
    );
  }

  if (
    typeof credentials !== "object" ||
    credentials === null ||
    !("project_id" in credentials) ||
    !("client_email" in credentials) ||
    !("private_key" in credentials)
  ) {
    throw new FirebaseConfigurationError(
      "FIREBASE_CREDENTIALS is missing required service-account fields",
    );
  }

  const parsed = credentials as Partial<ServiceAccountJson>;

  if (
    typeof parsed.project_id !== "string" ||
    typeof parsed.client_email !== "string" ||
    typeof parsed.private_key !== "string"
  ) {
    throw new FirebaseConfigurationError(
      "project_id, client_email, and private_key must be strings",
    );
  }

  return {
    projectId: parsed.project_id,
    clientEmail: parsed.client_email,
    // Supports both normal JSON newlines and double-escaped newlines.
    privateKey: parsed.private_key.replace(/\\n/g, "\n"),
  };
}

export function getFirebaseAdminApp(): App {
  if (cachedAdminApp) {
    return cachedAdminApp;
  }

  const existingApp = getApps()[0];

  if (existingApp) {
    cachedAdminApp = existingApp;
    return cachedAdminApp;
  }

  try {
    cachedAdminApp = initializeApp({
      credential: cert(parseServiceAccount()),
    });

    return cachedAdminApp;
  } catch (error: unknown) {
    if (error instanceof FirebaseConfigurationError) {
      throw error;
    }

    console.error("Firebase Admin initialization failed:", error);

    throw new FirebaseConfigurationError(
      "Firebase Admin credentials are invalid",
    );
  }
}

export function getAdminFirestore() {
  return getFirestore(getFirebaseAdminApp());
}

export async function verifyFirebaseToken(
  request: Request,
): Promise<VerifyTokenResult> {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return {
      response: Response.json(
        { error: "No valid Bearer token was provided" },
        { status: 401 },
      ),
    };
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    return {
      response: Response.json(
        { error: "No authentication token was provided" },
        { status: 401 },
      ),
    };
  }

  try {
    const user = await getAuth(getFirebaseAdminApp()).verifyIdToken(token);

    return { user };
  } catch (error: unknown) {
    if (error instanceof FirebaseConfigurationError) {
      console.error(error.message);

      return {
        response: Response.json(
          { error: "Server authentication is not configured" },
          { status: 500 },
        ),
      };
    }

    console.error("Firebase token verification failed:", error);

    return {
      response: Response.json(
        { error: "Invalid or expired authentication token" },
        { status: 401 },
      ),
    };
  }
}

