import { it } from "node:test";
import assert from "node:assert/strict";
import { quizLogWrite } from "../src/lib/quizLogWrite";
it("saves scored attempts even while AI feedback is pending", () => {
  const attempt = { attemptId: "same-id", score: 2, totalQuestions: 5, evaluationStatus: "pending" };
  assert.deepEqual(quizLogWrite(false, attempt), attempt);
});
it("does not rewrite an existing attempt when retrying pending feedback", () => {
  assert.equal(quizLogWrite(true, { score: 5, evaluationStatus: "pending" }), null);
});
it("feedback enrichment cannot overwrite scores, timestamps, or answers", () => {
  assert.deepEqual(quizLogWrite(true, { score: 5, timestamp: "changed", gradedResults: [], analysis: "Feedback", questionExplanations: [], evaluationStatus: "complete" }), {
    analysis: "Feedback", questionExplanations: [], evaluationStatus: "complete",
  });
});
