import { createHash } from "node:crypto";
import { getAdminFirestore, verifyFirebaseToken } from "../../../middleware/auth";
import { readQuizHistory } from "../../../lib/server/quizHistory";
import { buildStudyPlan, DEFAULT_PREFERENCES, localDate, validatePreferences, type StudyPlan } from "../../../lib/studyPlan";

export const runtime = "nodejs";
export async function GET(request: Request) { return handle(request, false); }
export async function POST(request: Request) { return handle(request, true); }
async function handle(request: Request, mutate: boolean): Promise<Response> {
  const auth = await verifyFirebaseToken(request);
  if (auth.response) return auth.response;
  try {
    const body = mutate ? await request.json() : {};
    if (!body || typeof body !== "object" || Array.isArray(body)) return Response.json({ error: "Invalid request" }, { status: 400 });
    if (body.preferences !== undefined && !validatePreferences(body.preferences)) {
      return Response.json({ error: "Choose a goal, 15–120 minutes, study days, and a valid timezone." }, { status: 400 });
    }
    const logs = await readQuizHistory(auth.user.uid);
    const ref = getAdminFirestore().collection("users").doc(auth.user.uid).collection("studyPlans").doc("current");
    const plan = await getAdminFirestore().runTransaction(async transaction => {
      const snapshot = await transaction.get(ref);
      const previous = snapshot.exists ? snapshot.data() as StudyPlan : null;
      const preferences = body.preferences ?? previous?.preferences ?? DEFAULT_PREFERENCES;
      const version = createHash("sha256").update(JSON.stringify({
        revision: 1, preferences, date: localDate(new Date(), preferences.timezone),
        logs,
      })).digest("hex");
      const next = previous?.version === version ? previous : buildStudyPlan(logs, preferences, version, previous);
      if (body.sessionId !== undefined) {
        const session = next.sessions.find(s => s.id === body.sessionId);
        if (!session || typeof body.completed !== "boolean") throw new Error("Invalid session update");
        session.completed = body.completed;
      }
      transaction.set(ref, next);
      return next;
    });
    return Response.json(plan, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Study plan failed", error);
    return Response.json({ error: "Unable to load or save your plan. Please retry." }, { status: 500 });
  }
}
