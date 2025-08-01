"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../../../firebase";
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

const auth = getAuth(app);

const PHYSICS_FACTS = ["Electricity is the flow of electrons through a conductor",

"The unit of electric current is the ampere (A)",

"Ohm's Law states that voltage equals current times resistance (V = IR)",

"A circuit is a closed path that allows electric current to flow",

"Electric power is calculated by multiplying voltage and current (P = VI)",

"The electrical potential difference between two points is measured in volts (V)",

"Resistors are used in electrical circuits to limit the flow of current",

"Conductors, like copper, allow electricity to flow easily",

"Insulators, like rubber, resist the flow of electric current",

"The speed of electric current in a conductor is close to the speed of light",
];

export default function ElectricityQuizPage() {
  const TOPIC = "electricity";
  const [selectedSubtopic, setSelectedSubtopic] = useState("");
  const [availableSubtopics, setAvailableSubtopics] = useState([]);
  const [subtopicsLoading, setSubtopicsLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [questionCount, setQuestionCount] = useState(3);
  const [availableDifficulties, setAvailableDifficulties] = useState([]);
  const [difficultiesLoading, setDifficultiesLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [user, setUser] = useState(null);
  const [quizLogs, setQuizLogs] = useState([]);
  const [currentFact, setCurrentFact] = useState("");
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      const storedLogs = localStorage.getItem(`quizLogs_${currentUser?.uid || "guest"}`);
      setQuizLogs(storedLogs ? JSON.parse(storedLogs) : []);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchSubtopics() {
      setSubtopicsLoading(true);
      try {
        const response = await fetch("/api/tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: TOPIC }),
        });
        if (!response.ok) throw new Error(`Failed to fetch subtopics: ${response.statusText}`);
        const data = await response.json();
        setAvailableSubtopics(data.tags || []);
        if (data.tags && data.tags.length > 0) {
          setSelectedSubtopic(data.tags[0].value);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setSubtopicsLoading(false);
      }
    }
    fetchSubtopics();
  }, []);

  useEffect(() => {
    if (!selectedSubtopic) return;

    async function fetchDifficultiesForTag() {
      setDifficultiesLoading(true);
      setSelectedDifficulty("");
      try {
        const response = await fetch("/api/difficulties-by-tag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: TOPIC, tag: selectedSubtopic }),
        });
        if (!response.ok) throw new Error(`Failed to fetch difficulties: ${response.statusText}`);
        const data = await response.json();
        setAvailableDifficulties(data.difficulties || []);
        if (data.difficulties && data.difficulties.length > 0) {
          setSelectedDifficulty(data.difficulties[0].value);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setDifficultiesLoading(false);
      }
    }
    fetchDifficultiesForTag();
  }, [selectedSubtopic]);

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
    setShowAnswers(false);

    try {
      const contentResponse = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: TOPIC, tag: selectedSubtopic, difficulty: selectedDifficulty }),
      });
      if (!contentResponse.ok) throw new Error(await contentResponse.text());
      const { content } = await contentResponse.json();
      if (!content || content.includes("No content available")) {
        throw new Error(`No valid ${selectedDifficulty} content retrieved for tag: ${selectedSubtopic}`);
      }
      console.log("Content from /api/content for", selectedSubtopic, ":", content);

      const prompt = `Based strictly on the following ${selectedDifficulty} content about "${selectedSubtopic}", generate ${questionCount} quiz questions in this format:
      ### Question [number]: [Title]
      [Question text]
      a) [Option 1]
      b) [Option 2]
      c) [Option 3]
      d) [Option 4]
      **Correct Answer:** [Correct option letter]
      ---
      Do not use external knowledge beyond this content:\n\n${content}`;
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
    const questions = [];
    const sections = quizString.split("---").map(section => section.trim()).filter(Boolean);

    sections.forEach(section => {
      const lines = section.split("\n").map(line => line.trim()).filter(Boolean);
      let question = { text: "", options: [], correctAnswer: "" };

      lines.forEach((line, idx) => {
        if (line.match(/^### Question \d+:/)) {
          question.text = line.replace(/^### Question \d+:\s*/, "").trim();
        } else if (line.match(/^[a-d]\)/)) {
          question.options.push(line.trim());
        } else if (line.startsWith("**Correct Answer:**")) {
          question.correctAnswer = line.replace("**Correct Answer:**", "").trim();
        } else if (idx > 0 && !question.options.length) {
          question.text += " " + line;
        }
      });

      if (question.text && question.options.length) {
        questions.push(question);
      }
    });

    console.log("Parsed questions:", questions);
    return questions;
  };

  const handleAnswerChange = (index, value) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: { answer: value, reasoning: prev[index]?.reasoning || "", confidence: prev[index]?.confidence || 0 },
    }));
  };

  const handleReasoningChange = (index, value) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: { answer: prev[index]?.answer || "", reasoning: value, confidence: prev[index]?.confidence || 0 },
    }));
  };

  const handleConfidenceChange = (index, value) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: { answer: prev[index]?.answer || "", reasoning: prev[index]?.reasoning || "", confidence: value },
    }));
  };

  async function handleSubmitAnswers() {
    setLoading(true);
    try {
      const timeTaken = (Date.now() - startTime) / 1000;
         const payload = {
     quizScores: calculateScore(answers),
     incorrectTopics: selectedSubtopic,
      studyLogs: `Time taken: ${timeTaken}s`,
   };
   // 2) Point at your Render server’s analyze endpoint:
   const response = await fetch(
   "https://deepseek-backend-u2i2.onrender.com/api/analyze",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
   if (!response.ok) {
  const text = await response.text();
  console.error("Evaluate error:", response.status, text);
  throw new Error(`Evaluate failed: ${response.status} ${text}`);
}
      const data = await response.json();

      const newLog = {
        quizScores: calculateScore(answers),
        incorrectTopics: selectedSubtopic,
        studyLogs: `Time taken: ${timeTaken}s`,
        analysis: data.analysis,
        timestamp: new Date().toISOString(),
        quiz: questions,
        answers,
        difficulty: selectedDifficulty,
      };
      const updatedLogs = [newLog, ...quizLogs].slice(0, 10);
      setQuizLogs(updatedLogs);
      localStorage.setItem(`quizLogs_${user?.uid || "guest"}`, JSON.stringify(updatedLogs));

      setShowAnswers(true);
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

  const renderMathText = (text) => {
    const parts = text.split(/(\$.*?\$)/);
    return parts.map((part, idx) => (
      part.startsWith("$") && part.endsWith("$") ? (
        <InlineMath key={idx} math={part.slice(1, -1)} />
      ) : (
        <span key={idx}>{part}</span>
      )
    ));
  };

  return (
    <div className="quiz-container">
      <h1 className="quiz-title">Electricity Quiz</h1>
      <div className="quiz-controls">
        <label htmlFor="subtopic-select">Select Subtopic:</label>
        <select
          id="subtopic-select"
          value={selectedSubtopic}
          onChange={(e) => setSelectedSubtopic(e.target.value)}
          disabled={loading || subtopicsLoading || availableSubtopics.length === 0}
          className="quiz-select"
        >
          {subtopicsLoading ? (
            <option value="">Loading subtopics...</option>
          ) : availableSubtopics.length > 0 ? (
            availableSubtopics.map((subtopic) => (
              <option key={subtopic.value} value={subtopic.value}>
                {subtopic.label}
              </option>
            ))
          ) : (
            <option value="">No subtopics available</option>
          )}
        </select>

        <label htmlFor="difficulty-select">Select Difficulty:</label>
        <select
          id="difficulty-select"
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          disabled={loading || difficultiesLoading || availableDifficulties.length === 0}
          className="quiz-select"
        >
          {difficultiesLoading ? (
            <option value="">Loading difficulties...</option>
          ) : availableDifficulties.length > 0 ? (
            availableDifficulties.map((diff) => (
              <option key={diff.value} value={diff.value}>
                {diff.label}
              </option>
            ))
          ) : (
            <option value="">No difficulties available</option>
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
          disabled={loading || subtopicsLoading || difficultiesLoading || !selectedSubtopic || !selectedDifficulty}
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
          <h2 className="quiz-subtitle">
            Your {availableSubtopics.find(sub => sub.value === selectedSubtopic)?.label || selectedSubtopic} Quiz (
            {availableDifficulties.find(diff => diff.value === selectedDifficulty)?.label || selectedDifficulty})
          </h2>
          <div className="quiz-questions">
            {questions.length > 0 ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmitAnswers(); }}>
                <ol>
                  {questions.map((question, index) => (
                    <li key={index} className="quiz-question">
                      <h3>{renderMathText(question.text)}</h3>
                      <ul className="quiz-options">
                        {question.options.map((option, optIdx) => (
                          <li key={optIdx}>
                            <label>
                              <input
                                type="radio"
                                name={`question-${index}`}
                                value={option.charAt(0)}
                                checked={answers[index]?.answer === option.charAt(0)}
                                onChange={(e) => handleAnswerChange(index, e.target.value)}
                              />
                              {renderMathText(option)}
                            </label>
                          </li>
                        ))}
                      </ul>
                      {showAnswers && (
                        <p className="correct-answer">
                          Correct Answer: {renderMathText(question.correctAnswer)}
                        </p>
                      )}
                      <div>
                        <label>Reasoning (optional):</label>
                        <textarea
                          value={answers[index]?.reasoning || ""}
                          onChange={(e) => handleReasoningChange(index, e.target.value)}
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
                          onChange={(e) => handleConfidenceChange(index, parseInt(e.target.value) || 0)}
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