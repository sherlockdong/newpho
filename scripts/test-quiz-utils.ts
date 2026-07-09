import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { normalizeAnswer, getOptionTextByLetter } from "../src/lib/quizAnswer";
import {
  qualifiesForMastery,
  validateQuizQuestions,
} from "../src/lib/quizMastery";
import {
  buildGradedResults,
  findUnansweredQuestions,
  parseAndValidateQuiz,
} from "../src/lib/quizValidate";

const sampleQuiz = `### Question 1
What is energy?
a) Option A
b) Option B
c) Option C
d) Option D
**Correct Answer:** b
---
### Question 2
More energy?
a) A
b) B
c) C
d) D
**Correct Answer:** **C**
---`;

describe("normalizeAnswer", () => {
  it("normalizes uppercase and punctuation", () => {
    assert.equal(normalizeAnswer("A"), "a");
    assert.equal(normalizeAnswer("a)"), "a");
    assert.equal(normalizeAnswer("a."), "a");
    assert.equal(normalizeAnswer("  B  "), "b");
    assert.equal(normalizeAnswer("**C**"), "c");
    assert.equal(normalizeAnswer("Correct Answer: D"), "d");
  });

  it("returns empty for invalid answers", () => {
    assert.equal(normalizeAnswer(""), "");
    assert.equal(normalizeAnswer("hello"), "");
    assert.equal(normalizeAnswer(42), "");
  });
});

describe("parseAndValidateQuiz", () => {
  it("accepts exact question counts", () => {
    const questions = parseAndValidateQuiz(sampleQuiz, 2);
    assert.equal(questions.length, 2);
    assert.equal(questions[0].correctAnswer, "b");
    assert.equal(questions[1].correctAnswer, "c");
  });

  it("rejects wrong question counts", () => {
    assert.throws(
      () => parseAndValidateQuiz(sampleQuiz, 3),
      /Expected 3 questions, but received 2/,
    );
  });
});

describe("validateQuizQuestions", () => {
  it("rejects malformed option counts", () => {
    const malformed = [
      {
        text: "Broken",
        options: ["a) one", "b) two", "c) three"],
        correctAnswer: "a" as const,
      },
    ];

    assert.throws(
      () => validateQuizQuestions(malformed, 1),
      /exactly 4 answer options/,
    );
  });
});

describe("qualifiesForMastery", () => {
  it("grants mastery for 5/5 and 8/10", () => {
    assert.equal(qualifiesForMastery(5, 5), true);
    assert.equal(qualifiesForMastery(8, 10), true);
  });

  it("grants mastery for 4/5", () => {
    assert.equal(qualifiesForMastery(4, 5), true);
  });

  it("denies mastery for 3/3 and 7/10", () => {
    assert.equal(qualifiesForMastery(3, 3), false);
    assert.equal(qualifiesForMastery(7, 10), false);
  });
});

describe("buildGradedResults", () => {
  const questions = [
    {
      text: "Q1",
      options: ["a) one", "b) two", "c) three", "d) four"],
      correctAnswer: "b" as const,
    },
  ];

  it("includes option text in graded results", () => {
    const { gradedResults, correctCount } = buildGradedResults(questions, {
      0: { answer: "b" },
    });

    assert.equal(correctCount, 1);
    assert.equal(gradedResults[0].userAnswerText, "b) two");
    assert.equal(gradedResults[0].correctAnswerText, "b) two");
  });

  it("detects unanswered questions", () => {
    assert.deepEqual(findUnansweredQuestions(2, { 0: { answer: "a" } }), [1]);
  });
});

describe("getOptionTextByLetter", () => {
  it("looks up option text by normalized letter", () => {
    const question = {
      text: "Q",
      options: ["a) Alpha", "b) Beta", "c) Gamma", "d) Delta"],
      correctAnswer: "c" as const,
    };

    assert.equal(getOptionTextByLetter(question, "c"), "c) Gamma");
  });
});
