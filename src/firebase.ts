import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  collection,
  deleteField,
  doc,
  getDoc,
  getFirestore,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCo8ShVpTbmTXWEtCmMfDH3pS69Db5NL0U",
  authDomain: "phoguide.firebaseapp.com",
  projectId: "phoguide",
  storageBucket: "phoguide.firebasestorage.app",
  messagingSenderId: "550817502522",
  appId: "1:550817502522:web:30a1bfcf8b96eb1cee6c03",
  measurementId: "G-TF3TR8PXK2",
};

// Avoid duplicate Firebase apps during Next.js hot reloads.
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

// Analytics is initialized once through gtag in app/layout.tsx.
// Keep this shared module limited to Auth and Firestore: initializing Firebase
// Analytics here also starts background Installations token requests.

type LegacyLog = Record<string, unknown>;

/**
 * Moves old logs stored in users/{uid}.analysisLogs into:
 * users/{uid}/analysisLogs/{generatedLogId}
 */
async function migrateLogs(uid: string): Promise<number> {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return 0;
  }

  const rawLogs: unknown = snapshot.data().analysisLogs;

  if (!Array.isArray(rawLogs) || rawLogs.length === 0) {
    return 0;
  }

  const logs: LegacyLog[] = rawLogs.filter(
    (log): log is LegacyLog =>
      typeof log === "object" && log !== null && !Array.isArray(log),
  );

  // Firestore batches have a write limit, so use smaller chunks.
  const chunkSize = 400;

  for (let start = 0; start < logs.length; start += chunkSize) {
    const batch = writeBatch(db);
    const chunk = logs.slice(start, start + chunkSize);

    for (const log of chunk) {
      const logRef = doc(collection(db, "users", uid, "analysisLogs"));

      batch.set(logRef, {
        ...log,
        userId: uid,
        timestamp: log.timestamp ?? new Date().toISOString(),
      });
    }

    await batch.commit();
  }

  await updateDoc(userRef, {
    analysisLogs: deleteField(),
  });

  return logs.length;
}

export { app, auth, db, migrateLogs };
