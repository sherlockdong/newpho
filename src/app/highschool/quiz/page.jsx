"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../../../firebase";

const auth = getAuth(app);

// Sample physics facts (replace with fetch from file later)
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
  const [currentFact, setCurrentFact] = useState(""); // Current random fact

  // Sync auth state and load logs
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      const storedLogs = localStorage.getItem(`quizLogs_${currentUser?.uid || "guest"}`);
      setQuizLogs(storedLogs ? JSON.parse(storedLogs) : []);
    });
    return () => unsubscribe();
  }, []);

  // Fetch tags
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

  // Rotate facts while loading
  useEffect(() => {
    let interval;
    if (loading) {
      // Set initial fact immediately
      setCurrentFact(PHYSICS_FACTS[Math.floor(Math.random() * PHYSICS_FACTS.length)]);
      interval = setInterval(() => {
        setCurrentFact(PHYSICS_FACTS[Math.floor(Math.random() * PHYSICS_FACTS.length)]);
      }, 4000);
    }
    return () => clearInterval(interval); // Cleanup on unmount or loading change
  }, [loading]);

  async function handleGenerateQuiz() {
    setLoading(true);
    setError(null);
    setQuiz(null);
    setAnswers({});
    setStartTime(Date.now());

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tag: selectedTag,
          numQuestions: questionCount,
          userId: user?.uid || "guest",
          quizLogs,
        }),
      });
      if (!response.ok) throw new Error(`Failed to generate quiz: ${response.statusText}`);
      const data = await response.json();
      const quizContent = typeof data.quiz === "string" ? data.quiz : data.quiz?.call || "";
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
    return quizString
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.match(/^\d+\.\s*(?:\[.*\]|.*)$/))
      .map((line) => line.replace(/^\d+\.\s*(\[)?(.*?)(\])?$/, "$2"));
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
      const timeTaken = (Date.now() - startTime) / 1000; // seconds
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitAnswers();
                }}
              >
                <ol>
                  {questions.map((question, index) => (
                    <li key={index} className="quiz-question">
                      {question}
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
              <p>No valid questions generated.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}