import { parseQuizQuestions } from "./quizParser";
import { getOptionTextByLetter, normalizeAnswer } from "./quizAnswer";
import { validateQuizQuestions } from "./quizMastery";
import type { AnswerState, GradedResult, QuizQuestion } from "./quizTypes";

export function toQuizQuestions(
  parsed: ReturnType<typeof parseQuizQuestions>,
): QuizQuestion[] {
  return parsed.map((question) => ({
    text: question.text,
    options: question.options,
    correctAnswer: normalizeAnswer(question.correctAnswer),
  }));
}

export function parseAndValidateQuiz(
  quizContent: string,
  questionCount: number,
): QuizQuestion[] {
  if (!quizContent?.trim()) {
    throw new Error(
      "Quiz parsing failed: The AI returned invalid formatting.",
    );
  }

  const parsedQuestions = toQuizQuestions(parseQuizQuestions(quizContent));

  if (parsedQuestions.length === 0) {
    throw new Error(
      "Quiz parsing failed: The AI returned invalid formatting.",
    );
  }

  validateQuizQuestions(parsedQuestions, questionCount);
  return parsedQuestions;
}

export function buildGradedResults(
  questions: QuizQuestion[],
  answers: AnswerState,
): { gradedResults: GradedResult[]; correctCount: number } {
  let correctCount = 0;

  const gradedResults = questions.map((question, index) => {
    const userAnswer = normalizeAnswer(answers[index]?.answer);
    const correctAnswer = normalizeAnswer(question.correctAnswer);
    const isCorrect = userAnswer !== "" && userAnswer === correctAnswer;

    if (isCorrect) {
      correctCount++;
    }

    return {
      index,
      question: question.text,
      options: question.options,
      userAnswer,
      userAnswerText: getOptionTextByLetter(question, userAnswer),
      correctAnswer,
      correctAnswerText: getOptionTextByLetter(question, correctAnswer),
      isCorrect,
    };
  });

  return { gradedResults, correctCount };
}

export function findUnansweredQuestions(
  questionCount: number,
  answers: AnswerState,
): number[] {
  const unanswered: number[] = [];

  for (let index = 0; index < questionCount; index++) {
    if (!normalizeAnswer(answers[index]?.answer)) {
      unanswered.push(index);
    }
  }

  return unanswered;
}
