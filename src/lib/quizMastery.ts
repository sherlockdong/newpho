import type { AnswerLetter, QuizQuestion } from "./quizTypes";
import { isValidAnswerLetter, normalizeAnswer } from "./quizAnswer";

export const MASTERY_THRESHOLD = 0.8;
export const MINIMUM_MASTERY_QUESTIONS = 5;

export function qualifiesForMastery(
  correctCount: number,
  totalQuestions: number,
): boolean {
  if (totalQuestions < MINIMUM_MASTERY_QUESTIONS) {
    return false;
  }

  const percentage =
    totalQuestions > 0 ? correctCount / totalQuestions : 0;

  return percentage >= MASTERY_THRESHOLD;
}

export function validateQuizQuestions(
  questions: QuizQuestion[],
  expectedCount: number,
): void {
  if (questions.length !== expectedCount) {
    throw new Error(
      `Expected ${expectedCount} questions, but received ${questions.length}.`,
    );
  }

  for (let index = 0; index < questions.length; index++) {
    const question = questions[index];

    if (!question.text?.trim()) {
      throw new Error(`Question ${index + 1} is missing question text.`);
    }

    if (question.options.length !== 4) {
      throw new Error(
        `Question ${index + 1} must have exactly 4 answer options.`,
      );
    }

    const normalizedCorrect = normalizeAnswer(question.correctAnswer);
    if (!normalizedCorrect) {
      throw new Error(`Question ${index + 1} has an invalid correct answer.`);
    }

    const optionLetters = question.options.map((option) =>
      normalizeAnswer(option),
    );

    if (!optionLetters.every((letter) => isValidAnswerLetter(letter))) {
      throw new Error(`Question ${index + 1} has invalid answer options.`);
    }

    if (!optionLetters.includes(normalizedCorrect)) {
      throw new Error(
        `Question ${index + 1} correct answer does not match any provided option.`,
      );
    }
  }
}

export function checkNodeAccessible(
  nodeId: string,
  prerequisitesMap: Record<string, string[]>,
  progress: Record<string, string>,
): boolean {
  const prereqs = prerequisitesMap[nodeId] ?? [];
  if (prereqs.length === 0) {
    return true;
  }

  return prereqs.every((p) => progress[p] === "mastered");
}

export function buildProgressUpdates(
  nodeId: string,
  unlocksMap: Record<string, string[]>,
  prerequisitesMap: Record<string, string[]>,
  current: Record<string, string>,
  correctCount: number,
  totalQuestions: number,
): Record<string, string> {
  const updates: Record<string, string> = { ...current };

  if (!qualifiesForMastery(correctCount, totalQuestions)) {
    return updates;
  }

  updates[nodeId] = "mastered";

  const candidates = unlocksMap[nodeId] ?? [];
  for (const candidateId of candidates) {
    const prereqs = prerequisitesMap[candidateId] ?? [];
    const allMet = prereqs.every((p) => updates[p] === "mastered");
    if (allMet && updates[candidateId] !== "mastered") {
      updates[candidateId] = "unlocked";
    }
  }

  return updates;
}
