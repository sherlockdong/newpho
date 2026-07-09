export {
  MASTERY_THRESHOLD,
  MINIMUM_MASTERY_QUESTIONS,
  buildProgressUpdates,
  checkNodeAccessible,
  qualifiesForMastery,
  validateQuizQuestions,
} from "./quizMastery";
export {
  getOptionTextByLetter,
  normalizeAnswer,
} from "./quizAnswer";
export {
  buildGradedResults,
  findUnansweredQuestions,
  parseAndValidateQuiz,
  toQuizQuestions,
} from "./quizValidate";
export type { AnswerLetter } from "./quizTypes";

export async function parseApiError<T = Record<string, unknown>>(
  response: Response,
): Promise<T> {
  const text = await response.text();

  let data: T & { error?: string };
  try {
    data = JSON.parse(text) as T & { error?: string };
  } catch {
    if (!response.ok) {
      throw new Error(text || `Request failed with status ${response.status}`);
    }

    throw new Error("Invalid server response.");
  }

  if (!response.ok) {
    throw new Error(
      data.error || `Request failed with status ${response.status}`,
    );
  }

  return data;
}
