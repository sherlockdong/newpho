import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import curriculum from "../src/data/curriculum.json";
import { buildStudyPlan, DEFAULT_PREFERENCES, localDate, matchLesson, validatePreferences } from "../src/lib/studyPlan";
const now = new Date("2026-11-02T02:00:00Z"); // Still Nov 1 in New York, after DST ends.
const pref = { ...DEFAULT_PREFERENCES, days: [0,1,2,3,4,5,6] };
const motion = "/highschoolquiz/mechanics/linear-motion";
const attempt = (id: string, score = 1, totalQuestions = 5) => ({
  logId: id, lessonId: motion, score, totalQuestions, timestamp: "2026-10-31T12:00:00Z",
  gradedResults: [{ question: "Find the acceleration", isCorrect: false }],
});
describe("study plans", () => {
  it("keeps untested topics unknown and creates a goal-appropriate diagnostic", () => {
    const plan = buildStudyPlan([], pref, "v1", null, now);
    assert.equal(plan.provisional, true);
    assert.ok(plan.sessions.length > 0);
    assert.ok(plan.sessions.every(s => s.kind === "diagnostic" && s.accuracy === null && s.lessonId.startsWith("/highschoolquiz/")));
  });
  it("prioritizes observed weakness and includes actual question evidence", () => {
    const plan = buildStudyPlan([attempt("a"), attempt("b")], pref, "v1", null, now);
    assert.equal(plan.sessions[0].lessonId, motion);
    assert.equal(plan.sessions[0].kind, "practice");
    assert.deepEqual(plan.sessions[0].evidence, ["a", "b"]);
    assert.match(plan.sessions[0].blocks[1].activity, /Find the acceleration/);
  });
  it("does not turn a small perfect quiz into mastery", () => {
    const plan = buildStudyPlan([attempt("a", 3, 3)], pref, "v1", null, now);
    assert.ok(!plan.sessions.some(s => s.lessonId.endsWith("projectile-and-satellite-motion")));
  });
  it("unlocks eligible follow-up lessons after sufficient prerequisite evidence", () => {
    const plan = buildStudyPlan([attempt("a", 5)], pref, "v1", null, now);
    assert.ok(plan.sessions.some(s => s.lessonId.endsWith("projectile-and-satellite-motion")));
  });
  it("rejects incomplete or impossible scores as planning evidence", () => {
    const plan = buildStudyPlan([attempt("a", 10, 5), { topic: "Mechanics - Linear Motion", score: 1 }], pref, "v1", null, now);
    assert.equal(plan.matchedCount, 0);
  });
  it("separates competition evidence from high-school evidence", () => {
    const plan = buildStudyPlan([attempt("a")], { ...pref, goal: "USAPhO" }, "v1", null, now);
    assert.equal(plan.matchedCount, 0);
    assert.ok(plan.sessions.every(s => s.lessonId.startsWith("/usapho/")));
  });
  it("matches supported legacy topic names without guessing from node IDs", () => {
    assert.equal(matchLesson({ quizTopic: "Mechanics - Linear Motion" })?.id, motion);
    assert.equal(matchLesson({ nodeId: "USA-22" }), undefined);
  });
  it("respects session budgets and local study days around DST", () => {
    assert.equal(localDate(now, pref.timezone), "2026-11-01");
    for (const minutes of [15, 30, 120]) {
      const plan = buildStudyPlan([], { ...pref, minutes, days: [0,3] }, "v1", null, now);
      assert.deepEqual(plan.sessions.map(s => s.date), ["2026-11-01", "2026-11-04"]);
      for (const session of plan.sessions) {
        assert.equal(session.blocks.reduce((n,b) => n+b.minutes,0), minutes);
        assert.ok(session.blocks.every(b => b.minutes > 0));
      }
    }
  });
  it("preserves completed sessions and avoids double-booking their dates", () => {
    const old = buildStudyPlan([], pref, "v1", null, now);
    old.sessions[0].completed = true;
    const next = buildStudyPlan([attempt("a")], pref, "v2", old, now);
    assert.deepEqual(next.sessions[0], old.sessions[0]);
    assert.equal(new Set(next.sessions.map(s => s.date)).size, next.sessions.length);
  });
  it("validates preferences before scheduling", () => {
    assert.equal(validatePreferences(pref), true);
    for (const change of [{ minutes: 0 }, { minutes: 15.5 }, { days: [] }, { days: [1,1] }, { days: [8] }, { timezone: "nowhere" }, { goal: "unknown" }]) {
      assert.equal(validatePreferences({ ...pref, ...change }), false);
    }
  });
  it("links only to real lessons and safe existing resources", () => {
    assert.equal(new Set(curriculum.map(l => l.id)).size, curriculum.length);
    for (const lesson of curriculum) {
      assert.ok(existsSync(`src/app${lesson.id}/page.tsx`), lesson.id);
      for (const resource of lesson.resources) assert.ok(["https:", "http:"].includes(new URL(resource.url).protocol));
    }
  });
});
