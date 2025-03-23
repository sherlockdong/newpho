"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../../../firebase";

const auth = getAuth(app);

const PHYSICS_FACTS = [
  "The speed of light in a vacuum is approximately 299,792 kilometers per second.",
  "A day on Venus is longer than its year.",
  "Neutrons have no electric charge, unlike protons and electrons.",
  "Black holes can bend light due to their immense gravitational pull.",
  "The shortest war in history lasted 38 minutes.",
];

export default function QuizPage() {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTag, setSelectedTag] = useState("");
  const [questionCount, setQuestionCount] = useState(3);
  const [availableTags, setAvailableTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [user, setUser] = useState(null);
  const [quizLogs, setQuizLogs] = useState([]);
  const [currentFact, setCurrentFact] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      const storedLogs = localStorage.getItem(`quizLogs_${currentUser?.uid || "guest"}`);
      setQuizLogs(storedLogs ? JSON.parse(storedLogs) : []);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchTags() {
      try {
        const response = await fetch("/api/tags");
        if (!response.ok) throw new Error(`Failed to fetch tags: ${response.statusText}`);
        const data = await response.json();
        setAvailableTags(data.tags || []);
        if (data.tags && data.tags.length > 0) setSelectedTag(data.tags[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setTagsLoading(false);
      }
    }
    fetchTags();
  }, []);

  useEffect(() => {
    let interval;
    if (loading) {
      setCurrentFact(PHYSICS_FACTS[Math.floor(Math.random() * PHYSICS_FACTS.length)]);
      interval = setInterval(() => {
        setCurrentFact(PHYSICS_FACTS[Math.floor(Math.random() * PHYSICS_FACTS.length)]);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  async function handleGenerateQuiz() {
    setLoading(true);
    setError(null);
    setQuiz(null);
    setAnswers({});
    setStartTime(Date.now());

    try {
      const contentResponse = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag: selectedTag, quizLogs }),
      });
      if (!contentResponse.ok) throw new Error(await contentResponse.text());
      const { content } = await contentResponse.json();
      if (!content || content.includes("No content available")) {
        throw new Error("No valid content retrieved for tag: " + selectedTag);
      }
      console.log("Content from /api/content:", content);

      const prompt = `Based strictly on this content, generate ${questionCount} quiz questions for ${selectedTag}. Do not use external knowledge:\n\n${content}`;
      console.log("Prompt sent to Render:", prompt);

      const quizResponse = await fetch("https://deepseek-backend-u2i2.onrender.com/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!quizResponse.ok) throw new Error(await quizResponse.text());
      const data = await quizResponse.json();
      const quizContent = data.choices?.[0]?.message?.content || "";
      console.log("Raw quiz content:", quizContent);
      if (!quizContent) throw new Error("Quiz is empty or invalid");
      setQuiz(quizContent);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const parseQuizQuestions = (quizString) => {
    if (!quizString || typeof quizString !== "string") return [];
    const lines = quizString.split("\n").map((line) => line.trim());
    const questions = [];
    let currentQuestion = "";

    for (const line of lines) {
      if (line.match(/^\d+\.\s*\*\*Question:\*\*/)) {
        if (currentQuestion) questions.push(currentQuestion);
        currentQuestion = line.replace(/^\d+\.\s*\*\*Question:\*\*\s*/, "");
      } else if (!line.includes("**Answer:**") && line) {
        currentQuestion += " " + line;
      }
    }
    if (currentQuestion) questions.push(currentQuestion.trim());
    console.log("Parsed questions:", questions);
    return questions;
  };

  const handleAnswerChange = (index, field, value) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: { ...prev[index], [field]: value },
    }));
  };

  async function handleSubmitAnswers() {
    setLoading(true);
    try {
      const timeTaken = (Date.now() - startTime) / 1000;
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz: parseQuizQuestions(quiz),
          answers,
          timeTaken,
          tag: selectedTag,
          userId: user?.uid || "guest",
        }),
      });
      if (!response.ok) throw new Error("Failed to evaluate answers");
      const data = await response.json();

      const newLog = {
        quizScores: calculateScore(answers),
        incorrectTopics: selectedTag,
        studyLogs: `Time taken: ${timeTaken}s`,
        analysis: data.analysis,
        timestamp: new Date().toISOString(),
        quiz: parseQuizQuestions(quiz),
        answers,
      };
      const updatedLogs = [newLog, ...quizLogs].slice(0, 10);
      setQuizLogs(updatedLogs);
      localStorage.setItem(`quizLogs_${user?.uid || "guest"}`, JSON.stringify(updatedLogs));

      setError(null);
      alert("Answers submitted and analyzed successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const calculateScore = (answers) => {
    const scores = Object.values(answers).map((a) => a.confidence || 0);
    return scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toString() : "0";
  };

  const questions = parseQuizQuestions(quiz);

  return (
    <div className="quiz-container">
      <h1 className="quiz-title">AI Quiz Generator</h1>
      <div className="quiz-controls">
        <label htmlFor="tag-select">Select Topic:</label>
        <select
          id="tag-select"
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          disabled={loading || tagsLoading || availableTags.length === 0}
          className="quiz-select"
        >
          {tagsLoading ? (
            <option value="">Loading tags...</option>
          ) : availableTags.length > 0 ? (
            availableTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </option>
            ))
          ) : (
            <option value="">No topics available</option>
          )}
        </select>

        <label htmlFor="question-count">Number of Questions:</label>
        <input
          id="question-count"
          type="number"
          min="1"
          max="10"
          value={questionCount}
          onChange={(e) => setQuestionCount(Math.max(1, parseInt(e.target.value) || 1))}
          disabled={loading}
          className="quiz-input"
        />

        <button
          onClick={handleGenerateQuiz}
          disabled={loading || tagsLoading || !selectedTag}
          className="quiz-button"
        >
          {loading ? "Generating Quiz..." : "Generate Quiz"}
        </button>
      </div>

      {loading && (
        <div className="loading-facts">
          <p>Loading... Here’s a physics fact:</p>
          <p className="fact-text">{currentFact}</p>
        </div>
      )}

      {error && <p className="quiz-error">Error: {error}</p>}
      {quiz && !loading && (
        <div className="quiz-content">
          <h2 className="quiz-subtitle">Your Quiz</h2>
          <div className="quiz-questions">
            {questions.length > 0 ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmitAnswers(); }}>
                <ol>
                  {questions.map((question, index) => (
                    <li key={index} className="quiz-question">
                      <span>{question}</span>
                      <div>
                        <label>Answer:</label>
                        <textarea
                          value={answers[index]?.answer || ""}
                          onChange={(e) => handleAnswerChange(index, "answer", e.target.value)}
                          className="quiz-input"
                          placeholder="Type your answer..."
                        />
                      </div>
                      <div>
                        <label>Reasoning (optional):</label>
                        <textarea
                          value={answers[index]?.reasoning || ""}
                          onChange={(e) => handleAnswerChange(index, "reasoning", e.target.value)}
                          className="quiz-input"
                          placeholder="Explain your reasoning..."
                        />
                      </div>
                      <div>
                        <label>Confidence (0-100):</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={answers[index]?.confidence || ""}
                          onChange={(e) =>
                            handleAnswerChange(index, "confidence", parseInt(e.target.value) || 0)
                          }
                          className="quiz-input"
                        />
                      </div>
                    </li>
                  ))}
                </ol>
                <button type="submit" disabled={loading} className="quiz-button">
                  {loading ? "Submitting..." : "Submit Answers"}
                </button>
              </form>
            ) : (
              <p>No valid questions generated. Raw content: {quiz}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}