export interface ParsedQuestion {
  text: string;
  options: string[];
  correctAnswer: string;
}

export function parseQuizQuestions(quizString: string): ParsedQuestion[] {
  if (!quizString) return [];
  const questions: ParsedQuestion[] = [];
  const lines = quizString.split("\n").map((l) => l.trim()).filter(Boolean);
  let currentQuestion: ParsedQuestion | null = null;

  lines.forEach((line) => {
    // Check for question header (e.g., "### Question 1", "Question 1:", "**Question 1**")
    const questionMatch = line.match(/^[\s*#]*Question\s+\d+\s*[:.-]?\s*(.*)/i);
    if (questionMatch) {
      if (currentQuestion && currentQuestion.text && currentQuestion.options.length) {
        questions.push(currentQuestion);
      }
      let text = questionMatch[1] ? questionMatch[1].trim() : "";
      text = text.replace(/^\*\*|:\*\*|\*\*:/g, "").trim(); // Clean up bold wrapper remnants
      
      currentQuestion = {
        text,
        options: [],
        correctAnswer: "",
      };
      return;
    }

    if (!currentQuestion) return;

    // Check for options (e.g., "a) Option", "a. Option", "- a) Option", "**a)** Option")
    const optionMatch = line.match(/^[-*\s]*\**([a-e])\**\s*[\)|.]\s*(.*)/i);
    if (optionMatch) {
      const letter = optionMatch[1].toLowerCase();
      const content = optionMatch[2].trim();
      currentQuestion.options.push(`${letter}) ${content}`);
      return;
    }

    // Check for correct answer (e.g., "**Correct Answer:** b", "Correct Answer: B")
    if (line.toLowerCase().includes("correct answer")) {
      const ansMatch = line.match(/correct\s*answer\s*[:.-]?\s*\**([a-e])\**/i);
      if (ansMatch) {
        currentQuestion.correctAnswer = ansMatch[1].toLowerCase();
      }
      return;
    }

    // Ignore horizontal dividers and markdown code block wrappers
    if (line === "---" || line.startsWith("```")) {
      return;
    }

    // Accumulate question text before options start
    if (currentQuestion.options.length === 0) {
      currentQuestion.text = (currentQuestion.text + " " + line).trim();
    }
  });

  if (currentQuestion && currentQuestion.text && currentQuestion.options.length) {
    questions.push(currentQuestion);
  }

  return questions;
}
