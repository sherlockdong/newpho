"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  Timestamp 
} from "firebase/firestore";
import { app } from "../../../firebase";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";

// Static import of difficulty examples (adjust path as needed)
import difficultyExamples from '../../../data/difficultyExamples.json';

const PHYSICS_FACTS = [
  "Displacement can be negative, but distance is always non-negative.",
  "Velocity is the derivative of position with respect to time; acceleration is the derivative of velocity.",
  "In uniformly accelerated motion, the average velocity equals the mean of initial and final velocities.",
  "Projectile motion can be treated as two independent 1D motions: horizontal (constant velocity) and vertical (accelerated).",
  "In non-inertial frames, fictitious forces like the Coriolis force appear due to acceleration of the frame.",
  "Jerk is the rate of change of acceleration, and it's relevant in systems involving smooth motion control (e.g. robotics).",
  "Maximum height in projectile motion is reached when vertical velocity becomes zero—not when acceleration becomes zero.",
  "Time of flight in projectile motion depends only on the vertical component of motion, not horizontal distance.",
  "Free-fall acceleration is the same for all objects regardless of mass (ignoring air resistance), per Galileo's principle.",
  "In circular motion, tangential velocity changes direction, not magnitude, unless there's tangential acceleration.",
];

export default function NewtonsQuizPage() {
  const auth = getAuth(app);
  const TOPIC = "newton";

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
  const [hasActiveQuiz, setHasActiveQuiz] = useState(false);

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
        if (data.tags?.length > 0) {
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
        if (data.difficulties?.length > 0) {
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
    setHasActiveQuiz(false);

    try {
      const response = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: TOPIC,
          tag: selectedSubtopic,
          difficulty: selectedDifficulty,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Content fetch failed: ${errorText}`);
      }

      const { content } = await response.json();
      const baseContent = content?.trim() || "";

      // Get difficulty guidelines from imported JSON
      const difficultyGuidelines = difficultyExamples[selectedDifficulty?.toLowerCase()?.trim()] || "";

      const prompt = `
You are an expert physics educator specializing in Newton's laws.

Base content (use this as strict reference material, do NOT copy verbatim):
${baseContent}

Difficulty guidelines for ${selectedDifficulty}:
${difficultyGuidelines}

Generate ${questionCount} multiple-choice quiz questions in this exact format:
### Question [number]
[Question text]
a) [Option 1]
b) [Option 2]
c) [Option 3]
d) [Option 4]
**Correct Answer:** [Correct option letter]
---

Base all questions strictly on the provided base content.
Adjust complexity and style according to the difficulty guidelines.
Do not use external knowledge beyond the given content.
`.trim();

      const apiKey = process.env.NEXT_PUBLIC_XAI_API_KEY;

      const quizResponse = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!quizResponse.ok) {
        const errorText = await quizResponse.text();
        throw new Error(errorText);
      }

      const data = await quizResponse.json();
      const quizContent = data.choices?.[0]?.message?.content || "";
      if (!quizContent) throw new Error("Quiz is empty or invalid");

      setQuiz(quizContent);
      setHasActiveQuiz(true);
    } catch (err) {
      console.error("Quiz generation error:", err);
      setError(err.message || "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  }

  const parseQuizQuestions = (quizString) => {
    if (!quizString || typeof quizString !== "string") return [];
    const questions = [];

    // Split on ### Question markers
    const rawSections = quizString.split(/### Question \d+/i).filter(Boolean);

    for (let i = 1; i < rawSections.length; i++) {
      const section = rawSections[i].trim();
      if (!section) continue;

      const lines = section.split("\n").map(l => l.trim()).filter(Boolean);
      let question = { text: "", options: [], correctAnswer: "" };

      lines.forEach((line) => {
        if (/^[a-d]\)/i.test(line)) {
          question.options.push(line);
        } else if (line.startsWith("**Correct Answer:**")) {
          question.correctAnswer = line.replace("**Correct Answer:**", "").trim();
        } else if (!question.options.length) {
          question.text += (question.text ? " " : "") + line;
        }
      });

      if (question.text && question.options.length >= 2) {
        questions.push(question);
      }
    }

    // Fallback for single-question or malformed output
    if (questions.length === 0 && quizString.includes("**Correct Answer:**")) {
      const lines = quizString.split("\n").map(l => l.trim()).filter(Boolean);
      let question = { text: "", options: [], correctAnswer: "" };

      lines.forEach((line) => {
        if (/^[a-d]\)/i.test(line)) {
          question.options.push(line);
        } else if (line.startsWith("**Correct Answer:**")) {
          question.correctAnswer = line.replace("**Correct Answer:**", "").trim();
        } else if (!question.options.length) {
          question.text += (question.text ? " " : "") + line;
        }
      });

      if (question.text && question.options.length >= 2) {
        questions.push(question);
      }
    }

    return questions;
  };

  const handleAnswerChange = (index, value) => {
    setAnswers(prev => ({
      ...prev,
      [index]: { ...prev[index], answer: value },
    }));
  };

  const handleReasoningChange = (index, value) => {
    setAnswers(prev => ({
      ...prev,
      [index]: { ...prev[index], reasoning: value },
    }));
  };

  const handleConfidenceChange = (index, value) => {
    setAnswers(prev => ({
      ...prev,
      [index]: { ...prev[index], confidence: Number(value) || 0 },
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

      const apiKey = process.env.NEXT_PUBLIC_XAI_API_KEY;

      const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4",
          messages: [{
            role: "user",
            content: `Analyze the following student progress data and provide detailed feedback:
- Quiz Scores: ${payload.quizScores}
- Incorrect Topics: ${payload.incorrectTopics}
- Study Logs: ${payload.studyLogs}
Return the output as a JSON object with an "analysis" field containing the feedback.`
          }],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Evaluation failed: ${response.status} ${text}`);
      }

      const data = await response.json();

      const analysisContent = data.choices?.[0]?.message?.content || "";
      let analysisText = "No analysis available";

      try {
        const cleaned = analysisContent.replace(/```json\s*|\s*```/g, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          analysisText = parsed.analysis || analysisText;
        } else {
          analysisText = cleaned;
        }
      } catch (e) {
        console.warn("Failed to parse analysis JSON:", e);
        analysisText = analysisContent;
      }

      const newLog = {
        quizScores: calculateScore(answers),
        incorrectTopics: selectedSubtopic,
        studyLogs: `Time taken: ${timeTaken}s`,
        analysis: analysisText,
        timestamp: new Date().toISOString(),
        difficulty: selectedDifficulty,
      };

      try {
        const db = getFirestore(app);
        const logWithUser = {
          ...newLog,
          userId: user?.uid,
          timestamp: Timestamp.fromDate(new Date()),
        };
        await addDoc(collection(db, "quizLogs"), logWithUser);
        console.log("Quiz log saved to Firestore");
      } catch (firestoreErr) {
        console.error("Firestore save failed:", firestoreErr);
      }

      const updatedLogs = [newLog, ...quizLogs].slice(0, 10);
      setQuizLogs(updatedLogs);
      localStorage.setItem(`quizLogs_${user?.uid || "guest"}`, JSON.stringify(updatedLogs));

      setShowAnswers(true);
      setError(null);
      alert("Answers submitted and analyzed successfully!");

      setHasActiveQuiz(false);
      setQuiz(null);
      setAnswers({});
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message || "Failed to submit answers");
    } finally {
      setLoading(false);
    }
  }

  const calculateScore = (answers) => {
    const scores = Object.values(answers).map(a => a.confidence || 0);
    return scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "0.0";
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
      <h1 className="quiz-title">Newton's Laws Quiz</h1>

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
            <option>Loading subtopics...</option>
          ) : availableSubtopics.length > 0 ? (
            availableSubtopics.map((sub) => (
              <option key={sub.value} value={sub.value}>
                {sub.label}
              </option>
            ))
          ) : (
            <option>No subtopics available</option>
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
            <option>Loading difficulties...</option>
          ) : availableDifficulties.length > 0 ? (
            availableDifficulties.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))
          ) : (
            <option>No difficulties available</option>
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
          {loading
            ? "Generating Quiz..."
            : hasActiveQuiz
              ? "Generate New Quiz"
              : "Generate Quiz"}
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
            Your {availableSubtopics.find(s => s.value === selectedSubtopic)?.label || selectedSubtopic} Quiz (
            {availableDifficulties.find(d => d.value === selectedDifficulty)?.label || selectedDifficulty})
          </h2>

          <div className="quiz-questions">
            {questions.length > 0 ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmitAnswers(); }}>
                <ol>
                  {questions.map((q, idx) => (
                    <li key={idx} className="quiz-question">
                      <h3>{renderMathText(q.text)}</h3>
                      <ul className="quiz-options">
                        {q.options.map((opt, i) => (
                          <li key={i}>
                            <label>
                              <input
                                type="radio"
                                name={`question-${idx}`}
                                value={opt.charAt(0)}
                                checked={answers[idx]?.answer === opt.charAt(0)}
                                onChange={(e) => handleAnswerChange(idx, e.target.value)}
                              />
                              {renderMathText(opt)}
                            </label>
                          </li>
                        ))}
                      </ul>

                      {showAnswers && (
                        <p className="correct-answer">
                          Correct Answer: {renderMathText(q.correctAnswer)}
                        </p>
                      )}

                      <div>
                        <label>Reasoning (optional):</label>
                        <textarea
                          value={answers[idx]?.reasoning || ""}
                          onChange={(e) => handleReasoningChange(idx, e.target.value)}
                          className="quiz-input"
                          placeholder="Explain your reasoning..."
                        />
                      </div>

                      <div>
                        <label>Confidence (0–10):</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={answers[idx]?.confidence ?? ""}
                          onChange={(e) => handleConfidenceChange(idx, e.target.value)}
                          className="quiz-input"
                          style={{ width: "80px" }}
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
              <p>No valid questions generated. Raw output: {quiz}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}