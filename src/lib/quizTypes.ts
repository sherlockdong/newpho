export type AnswerLetter = "a" | "b" | "c" | "d" | "";

export interface QuizQuestion {
  text: string;
  options: string[];
  correctAnswer: AnswerLetter;
}

export interface AnswerState {
  [questionIndex: number]: {
    answer: AnswerLetter;
  };
}

export interface GradedResult {
  index: number;
  question: string;
  options: string[];
  userAnswer: AnswerLetter;
  userAnswerText: string | null;
  correctAnswer: AnswerLetter;
  correctAnswerText: string | null;
  isCorrect: boolean;
}

export interface EvaluationAnalysis {
  feedbackSummary: string;
  questionExplanations: Array<{
    index: number;
    explanation: string;
  }>;
}
