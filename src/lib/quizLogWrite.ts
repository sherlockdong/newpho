/** An attempt is immutable once saved; subsequent submissions can only enrich feedback. */
export function quizLogWrite(existing: boolean, body: Record<string, unknown>) {
  if (!existing) return body;
  if (body.evaluationStatus !== "complete") return null;
  return {
    analysis: typeof body.analysis === "string" ? body.analysis : "",
    questionExplanations: Array.isArray(body.questionExplanations) ? body.questionExplanations : [],
    evaluationStatus: "complete",
  };
}
