import { Timestamp } from "firebase-admin/firestore";
import { getAdminFirestore } from "../../middleware/auth";

// Read both historical locations without moving or deleting student data.
// Canonical attempts take precedence over legacy records with the same ID.
export async function readQuizHistory(uid: string) {
  const db = getAdminFirestore();
  const [canonical, legacy, user] = await Promise.all([
    db.collection("users").doc(uid).collection("analysisLogs")
      .orderBy("timestamp", "desc").limit(200).get(),
    db.collection("quizLogs").where("userId", "==", uid).limit(200).get(),
    db.collection("users").doc(uid).get(),
  ]);
  const logs = new Map<string, Record<string, unknown>>();
  const oldArray = user.data()?.analysisLogs;
  if (Array.isArray(oldArray)) oldArray.slice(-200).forEach((data, index) => {
    if (data && typeof data === "object" && !Array.isArray(data)) {
      logs.set(`legacy-array-${oldArray.length - Math.min(oldArray.length, 200) + index}`, { ...data, logId: `legacy-array-${oldArray.length - Math.min(oldArray.length, 200) + index}`, id: `legacy-array-${oldArray.length - Math.min(oldArray.length, 200) + index}`, timestamp: serializeTimestamp(data.timestamp) });
    }
  });
  for (const document of [...legacy.docs, ...canonical.docs]) {
    const data = document.data();
    const timestamp = serializeTimestamp(data.timestamp);
    logs.set(document.id, { ...data, logId: document.id, id: document.id, timestamp });
  }
  return [...logs.values()].sort((a, b) =>
    (Date.parse(String(b.timestamp)) || 0) - (Date.parse(String(a.timestamp)) || 0));
}

function serializeTimestamp(value: unknown): string | null {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value.toISOString() : null;
  if (typeof value === "number") {
    const date = new Date(value > 1e10 ? value : value * 1000);
    return Number.isFinite(date.getTime()) ? date.toISOString() : null;
  }
  if (typeof value === "string") return Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : null;
  return null;
}
