// src/app/highschoolquiz/relativity/page.tsx
"use client";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app, db } from "../../../firebase";
import { collection, query, orderBy, limit, doc, setDoc, getDocs } from "firebase/firestore"; // Added getDocs
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";
import ReactMarkdown from "react-markdown";

const auth = getAuth(app);

const PHYSICS_FACTS = [
  "Albert Einstein developed the theory of relativity in the early 20th century",
  "Special relativity states that the laws of physics are the same for all observers in uniform motion relative to one another",
  "The speed of light in a vacuum is constant and always travels at approximately 299,792 kilometers per second",
  "Time dilation occurs when an object approaches the speed of light, causing time to slow down for the object relative to a stationary observer",
  "Mass and energy are interchangeable, as described by the famous equation E = mc²",
  "General relativity describes how gravity is a curvature of spacetime caused by mass and energy",
  "Black holes are regions of spacetime where gravity is so strong that not even light can escape",
  "Gravitational time dilation means time runs slower near massive objects, like planets or stars",
  "Relativity has been confirmed by experiments such as GPS satellite measurements, which account for time dilation effects",
  "The theory of relativity revolutionized our understanding of space, time, and the universe",
];

export default function RelativityQuizPage() {
  const TOPIC = "relativity";
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
  const [latestAnalysis, setLatestAnalysis] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const q = query(
            collection(db, `users/${currentUser.uid}/analysisLogs`),
            orderBy("timestamp", "desc"),
            limit(10)
          );
          const snapshot = await getDocs(q);
          const logs = snapshot.docs.map(doc => doc.data());
          setQuizLogs(logs);
          console.log("Fetched quiz logs:", logs);
        } catch (err) {
          console.error("Error fetching quiz logs:", err);
          setError("Failed to load quiz history. Please try again.");
          setQuizLogs([]);
        }
      } else {
        setQuizLogs([]);
      }
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
        console.log("Fetching difficulties for:", { topic: TOPIC, tag: selectedSubtopic });
        const response = await fetch("/api/difficulties-by-tag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: TOPIC, tag: selectedSubtopic }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch difficulties: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        console.log("Difficulties response:", data);
        setAvailableDifficulties(data.difficulties || []);
        if (data.difficulties && data.difficulties.length > 0) {
          setSelectedDifficulty(data.difficulties[0].value);
        } else {
          setError("No difficulties available for this subtopic.");
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching difficulties:", err);
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
    setLatestAnalysis(null);

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
    const sections = quizString.split("---").map((section) => section.trim()).filter(Boolean);

    sections.forEach((section) => {
      const lines = section.split("\n").map((line) => line.trim()).filter(Boolean);
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
    if (!user?.uid) {
      setError("You must be signed in to submit answers.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const timeTaken = (Date.now() - startTime) / 1000;
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz: questions,
          answers,
          timeTaken,
          tag: selectedSubtopic,
          userId: user.uid,
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to evaluate answers: ${response.status} - ${errorText}`);
      }
      const data = await response.json();

      const newLog = {
        title: selectedSubtopic || "Quiz Evaluation",
        score: calculateScore(answers),
        analysis: data.analysis,
        timeTaken,
        timestamp: new Date(),
        quiz: questions,
        answers,
        difficulty: selectedDifficulty,
      };

      const logId = Date.now().toString();
      console.log("Saving log to Firestore:", newLog);
      await setDoc(doc(db, `users/${user.uid}/analysisLogs`, logId), newLog);

      const q = query(
        collection(db, `users/${user.uid}/analysisLogs`),
        orderBy("timestamp", "desc"),
        limit(10)
      );
      const snapshot = await getDocs(q);
      const updatedLogs = snapshot.docs.map(doc => doc.data());
      setQuizLogs(updatedLogs);
      console.log("Refetched quiz logs:", updatedLogs);

      setLatestAnalysis(data.analysis);
      setShowAnswers(true);
      setError(null);
      alert("Answers submitted and analyzed successfully!");
    } catch (err) {
      setError(err.message);
      console.error("Error submitting answers:", err);
    } finally {
      setLoading(false);
    }
  }

  const calculateScore = (answers) => {
    const scores = Object.values(answers).map((a: any) => a.confidence || 0);
    return scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : "0";
  };

  const questions = parseQuizQuestions(quiz);

  const renderMathText = (text) => {
    const parts = text.split(/(\$.*?\$)/);
    return parts.map((part, idx) =>
      part.startsWith("$") && part.endsWith("$") ? (
        <InlineMath key={idx} math={part.slice(1, -1)} />
      ) : (
        <span key={idx}>{part}</span>
      )
    );
  };

  return (
    <div className="quiz-container">
      <h1 className="quiz-title">Relativity Quiz</h1>
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
            Your {availableSubtopics.find((sub) => sub.value === selectedSubtopic)?.label || selectedSubtopic} Quiz (
            {availableDifficulties.find((diff) => diff.value === selectedDifficulty)?.label || selectedDifficulty})
          </h2>
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
                <button type="submit" disabled={loading || !user} className="quiz-button">
                  {loading ? "Submitting..." : "Submit Answers"}
                </button>
              </form>
            ) : (
              <p>No valid questions generated. Raw content: {quiz}</p>
            )}
          </div>
          {showAnswers && latestAnalysis && (
            <div className="quiz-analysis">
              <h2 className="quiz-subtitle">Evaluation Analysis</h2>
              <ReactMarkdown>{latestAnalysis}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}