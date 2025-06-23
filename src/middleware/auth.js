// src/middleware/auth.js
import admin from "firebase-admin";

function initializeFirebaseAdmin() {
  if (admin.apps.length) {
    console.log("Firebase Admin already initialized, app name:", admin.apps[0].name); // Debug
    return true;
  }

  try {
    if (!process.env.FIREBASE_CREDENTIALS) {
      console.error("FIREBASE_CREDENTIALS is not set in .env.local");
      throw new Error("Missing FIREBASE_CREDENTIALS environment variable");
    }

    let credentials;
    try {
      credentials = JSON.parse(process.env.FIREBASE_CREDENTIALS);
      console.log("Firebase credentials parsed, project_id:", credentials.project_id); // Debug
    } catch (err) {
      console.error("Failed to parse FIREBASE_CREDENTIALS:", err.message, err.stack);
      throw new Error("Invalid FIREBASE_CREDENTIALS format: " + err.message);
    }

    if (!credentials.project_id || !credentials.private_key || !credentials.client_email) {
      console.error("FIREBASE_CREDENTIALS missing required fields:", Object.keys(credentials));
      throw new Error("FIREBASE_CREDENTIALS missing required fields");
    }

    admin.initializeApp({
      credential: admin.credential.cert(credentials),
    });
    console.log("Firebase Admin initialized successfully with app name:", admin.app().name); // Debug
    return true;
  } catch (err) {
    console.error("Firebase Admin initialization failed:", err.message, err.stack);
    return false;
  }
}

// Initialize Firebase Admin and store initialization status
const isFirebaseInitialized = initializeFirebaseAdmin();

export async function verifyFirebaseToken(req) {
  try {
    if (!isFirebaseInitialized) {
      console.error("Firebase Admin not initialized, cannot verify token");
      return new Response(JSON.stringify({ error: "Server configuration error: Firebase not initialized" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = req.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) {
      console.log("No Authorization token provided in request"); // Debug
      return new Response(JSON.stringify({ error: "No token provided" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Verifying token:", token.slice(0, 10) + "..."); // Debug
    const decoded = await admin.auth().verifyIdToken(token);
    console.log("Token verified for user:", decoded.uid); // Debug
    req.user = decoded;
    return null;
  } catch (err) {
    console.error("Token verification error:", err.message, err.stack);
    return new Response(JSON.stringify({ error: "Invalid token: " + err.message }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}