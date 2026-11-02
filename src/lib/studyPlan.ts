import curriculum from "../data/curriculum.json";

export const GOALS = ["High school", "F=ma", "Physics Bowl", "USAPhO"] as const;
export type StudyGoal = typeof GOALS[number];
export interface StudyPreferences {
  goal: StudyGoal;
  minutes: number;
  days: number[];
  timezone: string;
}
export const DEFAULT_PREFERENCES: StudyPreferences = {
  goal: "High school", minutes: 30, days: [1, 3, 5], timezone: "America/New_York",
};
export type HistoryRecord = Record<string, unknown>;
export interface StudySession {
  id: string; date: string; lessonId: string; title: string;
  kind: "diagnostic" | "practice" | "review";
  reason: string; evidence: string[]; questionCount: number; accuracy: number | null;
  blocks: { minutes: number; activity: string }[];
  checkpoint: string; resource: { title: string; url: string } | null;
  completed: boolean;
}
export interface StudyPlan {
  preferences: StudyPreferences; sessions: StudySession[];
  generatedAt: string; historyCount: number; matchedCount: number;
  provisional: boolean; version: string;
}
export function validatePreferences(value: unknown): value is StudyPreferences {
  if (!value || typeof value !== "object") return false;
  const p = value as StudyPreferences;
  if (!GOALS.includes(p.goal) || !Number.isInteger(p.minutes) || p.minutes < 15 || p.minutes > 120 ||
    !Array.isArray(p.days) || !p.days.length || p.days.length > 7 ||
    new Set(p.days).size !== p.days.length || p.days.some(d => !Number.isInteger(d) || d < 0 || d > 6) ||
    typeof p.timezone !== "string") return false;
  try { new Intl.DateTimeFormat("en", { timeZone: p.timezone }); return true; } catch { return false; }
}
export function localDate(now: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  return ["year", "month", "day"].map(t => parts.find(p => p.type === t)!.value).join("-");
}
const normalize = (v: unknown) => typeof v === "string" ? v.toLowerCase().replace(/[^a-z0-9]/g, "") : "";
export function matchLesson(log: HistoryRecord) {
  if (typeof log.lessonId === "string") return curriculum.find(l => l.id === log.lessonId);
  const candidates = curriculum.filter(l =>
    (!log.progressCollection || l.track === log.progressCollection) &&
    (normalize(l.title) === normalize(log.subtopicName) ||
      normalize(`${l.topic} - ${l.title}`) === normalize(log.topic ?? log.quizTopic)));
  return candidates.length === 1 ? candidates[0] : undefined;
}
export function buildStudyPlan(
  logs: HistoryRecord[], preferences: StudyPreferences, version: string,
  previous?: StudyPlan | null, now = new Date(),
): StudyPlan {
  const today = localDate(now, preferences.timezone);
  const lessons = curriculum.filter(l => preferences.goal === "High school"
    ? ["mechanics", "electricity"].includes(l.track) : l.track === preferences.goal);
  const profiles = lessons.map(lesson => {
    const attempts = logs.filter(log => matchLesson(log)?.id === lesson.id &&
      typeof log.score === "number" && Number.isInteger(log.score) &&
      typeof log.totalQuestions === "number" && Number.isInteger(log.totalQuestions) &&
      log.totalQuestions > 0 && log.score >= 0 && log.score <= log.totalQuestions)
      .sort((a, b) => (Date.parse(String(b.timestamp)) || 0) - (Date.parse(String(a.timestamp)) || 0));
    const recent = attempts.slice(0, 3);
    const total = recent.reduce((n, l) => n + Number(l.totalQuestions), 0);
    const correct = recent.reduce((n, l) => n + Number(l.score), 0);
    const accuracy = total ? correct / total : null;
    const latest = Date.parse(String(recent[0]?.timestamp)) || now.getTime();
    const overdue = attempts.length > 0 && now.getTime() - latest >= 7 * 86400000;
    return { lesson, attempts, total, accuracy, overdue };
  });
  const eligible = profiles.filter(p => p.lesson.prerequisites.every(node =>
    profiles.filter(pr => pr.lesson.track === p.lesson.track && pr.lesson.nodeId === node).length === 1 &&
    profiles.some(pr => pr.lesson.track === p.lesson.track && pr.lesson.nodeId === node &&
      pr.attempts.some(a => Number(a.totalQuestions) >= 5 && Number(a.score) / Number(a.totalQuestions) >= .8))));
  const ranked = eligible.sort((a, b) => priority(b) - priority(a) || a.lesson.id.localeCompare(b.lesson.id));
  function priority(p: typeof profiles[number]) {
    if (p.accuracy !== null && p.accuracy < .8) return 100 + (1 - p.accuracy) * 20;
    if (p.overdue) return 90;
    if (p.accuracy === null) return 80;
    return 10;
  }
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(`${today}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + i);
    return { date: d.toISOString().slice(0, 10), weekday: d.getUTCDay() };
  }).filter(d => preferences.days.includes(d.weekday)).map(d => d.date);
  // Completion is a durable record. Keep it even when preferences or evidence change.
  const sessions = (previous?.sessions ?? []).filter(s => s.completed);
  let index = 0;
  for (const date of dates) {
    if (sessions.some(s => s.date === date)) continue;
    const p = ranked[index++ % ranked.length];
    if (!p) continue;
    const { lesson, attempts, total, accuracy } = p;
    const kind = !attempts.length ? "diagnostic" : accuracy! < .8 ? "practice" : "review";
    const recall = Math.max(3, Math.round(preferences.minutes * .15));
    const review = Math.round(preferences.minutes * .25);
    const check = Math.max(5, Math.round(preferences.minutes * .2));
    const practice = preferences.minutes - recall - review - check;
    const missed = attempts.flatMap(a => Array.isArray(a.gradedResults) ? a.gradedResults : [])
      .filter((r): r is { question: string; isCorrect: boolean } => !!r && typeof r.question === "string" && r.isCorrect === false)
      .slice(0, 2).map(r => r.question.slice(0, 350));
    sessions.push({
      id: `${date}:${lesson.id}`, date, lessonId: lesson.id, title: lesson.title, kind,
      reason: !attempts.length ? "This topic is untested. Start with a diagnostic to find an appropriate focus."
        : `${attempts.length} recorded attempt(s); ${Math.round(accuracy! * 100)}% across the latest ${total} questions. ${total < 5 ? "Limited evidence: use a longer check before judging mastery." : accuracy! < .8 ? "Review errors and check the same ideas with new questions." : "Revisit the topic with fresh questions to check retention."}`,
      evidence: attempts.slice(0, 3).map(a => String(a.logId ?? a.id)),
      questionCount: total, accuracy, completed: false,
      resource: lesson.resources[0] ?? null,
      blocks: [
        { minutes: recall, activity: `Recall the key principles of ${lesson.title} without notes. Write down assumptions and units.` },
        { minutes: review, activity: `Review the lesson resources and work through one example. ${missed.length ? "Return to these previously missed questions: " + missed.join("; ") : "Identify which relationships apply and explain why."}` },
        { minutes: practice, activity: `Solve fresh ${lesson.title} problems. Explain your setup before calculating, and check dimensions and limiting cases.` },
        { minutes: check, activity: "Take a short focused quiz without notes. Record what still feels uncertain; use a five-question check when you are ready to demonstrate mastery." },
      ],
      checkpoint: "Explain each missed answer in your own words. A score of at least 4/5 on a fresh five-question quiz meets the current mastery rule; a short check still helps update your plan.",
    });
  }
  return { preferences, sessions: sessions.sort((a,b) => a.date.localeCompare(b.date)),
    generatedAt: now.toISOString(), historyCount: logs.length,
    matchedCount: profiles.reduce((n,p) => n + p.attempts.length, 0),
    provisional: profiles.reduce((n,p) => n + p.attempts.length, 0) < 2, version };
}
