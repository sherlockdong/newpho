import type { AnswerLetter, QuizQuestion } from "./quizTypes";

const ANSWER_LETTERS = new Set<AnswerLetter>(["a", "b", "c", "d", ""]);

export function normalizeAnswer(value: unknown): AnswerLetter {
  if (typeof value !== "string") return "";

  const cleaned = value
    .toLowerCase()
    .replace(/\*\*/g, "")
    .trim();

  const directMatch = cleaned.match(
    /(?:^|correct\s*answer\s*[:\-]?\s*)([a-d])(?:$|[\s).:\-])/i,
  );
  if (directMatch?.[1]) {
    return directMatch[1].toLowerCase() as AnswerLetter;
  }

  const optionMatch = cleaned.match(/^(?:\(?)([a-d])(?:\)?)(?:$|[\s).:\-])/);
  if (optionMatch?.[1]) {
    return optionMatch[1].toLowerCase() as AnswerLetter;
  }

  const fallbackMatch = cleaned.match(/(?:^|[\s(])([a-d])(?:$|[\s).:\-])/);
  return (fallbackMatch?.[1] as AnswerLetter) ?? "";
}

export function getOptionTextByLetter(
  question: QuizQuestion,
  letter: AnswerLetter,
): string | null {
  if (!letter) return null;

  const option = question.options.find(
    (opt) => normalizeAnswer(opt) === letter,
  );

  return option ?? null;
}

export function isValidAnswerLetter(value: AnswerLetter): boolean {
  return ANSWER_LETTERS.has(value) && value !== "";
}

export { ANSWER_LETTERS };
