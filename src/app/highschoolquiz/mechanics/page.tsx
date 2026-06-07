"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../../../firebase";
import { 
  getFirestore,         
  collection,            
  addDoc,                
  Timestamp              
} from "firebase/firestore";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";
import { motion } from "framer-motion";

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

export default function MechanicsQuizPage() {
  const auth = getAuth(app);
  const TOPIC = "mechanics";
  const [selectedSubtopic, setSelectedSubtopic] = useState("");
  const [availableSubtopics, setAvailableSubtopics] = useState<any[]>([]);
  const [subtopicsLoading, setSubtopicsLoading] = useState(true);
  const [quiz, setQuiz] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [questionCount, setQuestionCount] = useState(3);
  const [availableDifficulties, setAvailableDifficulties] = useState<any[]>([]);
  const [difficultiesLoading, setDifficultiesLoading] = useState(false);
  const [answers, setAnswers] = useState<any>({});
  const [startTime, setStartTime] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [quizLogs, setQuizLogs] = useState<any[]>([]);
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
  }, [auth]);

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
      } catch (err: any) {
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
      } catch (err: any) {
        setError(err.message);
      } finally {
        setDifficultiesLoading(false);
      }
    }
    fetchDifficultiesForTag();
  }, [selectedSubtopic]);

  useEffect(() => {
    let interval: any;
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
      if (!contentResponse.ok) {
        const errorText = await contentResponse.text();
        throw new Error(errorText);
      }
      const { content } = await contentResponse.json();
      if (!content || content.includes("No content available")) {
        throw new Error(`No valid ${selectedDifficulty} content retrieved for tag: ${selectedSubtopic}`);
      }

const prompt = `You are an expert physics professor generating a diagnostic quiz. 
Based on the following ${selectedDifficulty} content about "${selectedSubtopic}", generate exactly ${questionCount} multiple-choice questions.

CRITICAL INSTRUCTIONS:
1. You MUST use standard LaTeX formatting for all variables, formulas, and math. Enclose inline math with single $ signs (e.g., $v = d/t$) and block math with double $$ signs.
2. Output ONLY the quiz. Do not include any introductory or concluding text.
3. You may use standard physics constants (e.g., g = 9.8 m/s^2) even if they are not explicitly in the provided text.

Strictly follow this exact format for every question:
### Question [number]
[Question text]
a) [Option 1]
b) [Option 2]
c) [Option 3]
d) [Option 4]
**Correct Answer:** [Correct option letter]
---

Provided Content:
${content}`;
      const apiKey = process.env.OPENAI_API_KEY;
      const quizResponse = await fetch("/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt }),
});
      if (!quizResponse.ok) {
        const errorText = await quizResponse.text();
        throw new Error(`API Error Status ${quizResponse.status}: ${errorText}`);
      }
      
      const data = await quizResponse.json();
      const quizContent = data.content || "";
      
      // ADD THIS LINE TO DEBUG:
      console.log("--- RAW GPT-4O RESPONSE ---", quizContent);

      // Check if it's completely empty OR if your parser fails to find any questions
      const parsedQuestions = parseQuizQuestions(quizContent);
      if (!quizContent || parsedQuestions.length === 0) {
        throw new Error(
          !quizContent 
            ? "Quiz is empty or invalid: The AI returned an empty string." 
            : `Quiz parsing failed: The AI returned text, but it didn't match your format. Raw text sample: ${quizContent.substring(0, 100)}...`
        );
      }
      
      setQuiz(quizContent);
      setHasActiveQuiz(true);
      
    } 
    catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const parseQuizQuestions = (quizString: string) => {
    if (!quizString || typeof quizString !== "string") return [];
    const questions: any[] = [];
    const sections = quizString.split("---").map(section => section.trim()).filter(Boolean);

    sections.forEach(section => {
      const lines = section.split("\n").map(line => line.trim()).filter(Boolean);
      let question: any = { text: "", options: [], correctAnswer: "" };

      lines.forEach((line, idx) => {
        if (line.match(/^### Question \d+/)) {
          question.text = line.replace(/^### Question \d+\s*/, "").trim();
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

    return questions;
  };

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers((prev: any) => ({
      ...prev,
      [index]: { answer: value, reasoning: prev[index]?.reasoning || "", confidence: prev[index]?.confidence || 0 },
    }));
  };

  const handleReasoningChange = (index: number, value: string) => {
    setAnswers((prev: any) => ({
      ...prev,
      [index]: { answer: prev[index]?.answer || "", reasoning: value, confidence: prev[index]?.confidence || 0 },
    }));
  };

  async function handleSubmitAnswers() {
    setLoading(true);
    try {
      const timeTaken = (Date.now() - (startTime || Date.now())) / 1000;
      const payload = {
        quizScores: calculateScore(answers),
        incorrectTopics: selectedSubtopic,
        studyLogs: `Time taken: ${timeTaken}s`,
      };
      const apiKey = process.env.OPENAI_API_KEY;

      const response = await fetch("/api/evaluate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ quiz, answers, timeTaken, userId: user?.uid }),
});

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Evaluate failed: ${response.status} ${text}`);
      }
      const data = await response.json();

      const newLog = {
        quizScores: calculateScore(answers),
        incorrectTopics: selectedSubtopic,
        studyLogs: `Time taken: ${timeTaken}s`,
        analysis: data.choices?.[0]?.message?.content ? JSON.parse(data.choices[0].message.content).analysis : "No analysis available",
        timestamp: new Date().toISOString(),
        quiz: questions,
        answers,
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
        console.log("Log uploaded to Firestore!"); 
      } catch (firestoreErr) {
        console.error("Firestore upload failed:", firestoreErr);
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const calculateScore = (answers: any) => {
    const scores = Object.values(answers).map((a: any) => a.confidence || 0);
    return scores.length ? (scores.reduce((a: any, b: any) => a + b, 0) / scores.length).toString() : "0";
  };

  const questions = parseQuizQuestions(quiz || "");

  const renderMathText = (text: string) => {
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
    <main className="page-wrapper">
      <div className="max-w-[1000px] mx-auto px-6">
        
        {/* Header Section */}
        <div className="mb-12 text-center md:text-left">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-mono text-[#4f8ef7] bg-[#4f8ef7]/10 border border-[#4f8ef7]/20 rounded-full">
            SYS_// MECHANICS_MODULE
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white font-heading tracking-tight mb-4">
            Mechanics <span className="text-[#4f8ef7]">Diagnostic</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
            Configure your parameters below to generate a specialized mechanics problem set using the ChatGPT-4o engine.
          </p>
        </div>

        {/* Configuration Matrix */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-[#0A0A18] border border-zinc-800 p-8 rounded-3xl shadow-2xl mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Subtopic */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Target Subtopic</label>
              <select
                value={selectedSubtopic}
                onChange={(e) => setSelectedSubtopic(e.target.value)}
                disabled={loading || subtopicsLoading || availableSubtopics.length === 0}
                className="w-full bg-[#0f0f20] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-[#4f8ef7]/60 transition-colors"
              >
                {subtopicsLoading ? (
                  <option value="">Querying database...</option>
                ) : availableSubtopics.length > 0 ? (
                  availableSubtopics.map((subtopic) => (
                    <option key={subtopic.value} value={subtopic.value}>{subtopic.label}</option>
                  ))
                ) : (
                  <option value="">No targets available</option>
                )}
              </select>
            </div>

            {/* Difficulty */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Difficulty Level</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                disabled={loading || difficultiesLoading || availableDifficulties.length === 0}
                className="w-full bg-[#0f0f20] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-[#4f8ef7]/60 transition-colors"
              >
                {difficultiesLoading ? (
                  <option value="">Querying matrix...</option>
                ) : availableDifficulties.length > 0 ? (
                  availableDifficulties.map((diff) => (
                    <option key={diff.value} value={diff.value}>{diff.label}</option>
                  ))
                ) : (
                  <option value="">No parameters available</option>
                )}
              </select>
            </div>

            {/* Question Count */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Dataset Size</label>
              <input
                type="number"
                min="1"
                max="10"
                value={questionCount}
                onChange={(e) => setQuestionCount(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={loading}
                className="w-full bg-[#0f0f20] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-[#4f8ef7]/60 transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={hasActiveQuiz ? () => {} : handleGenerateQuiz}
              disabled={loading || subtopicsLoading || difficultiesLoading || !selectedSubtopic || !selectedDifficulty || hasActiveQuiz}
              className="tg-btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading 
                ? "Compiling Matrix..." 
                : hasActiveQuiz 
                  ? "Diagnostic Active ↓" 
                  : "Initialize Diagnostic"}
            </button>
          </div>
        </motion.div>

        {/* Loading State & Facts */}
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center p-10 bg-[#0A0A18] border border-zinc-800 rounded-3xl text-center mb-12"
          >
            <div className="w-10 h-10 border-4 border-[#4f8ef7] border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-zinc-500 text-sm font-mono mb-2">GENERATING CHATGPT 4o PARAMETERS...</p>
            <p className="text-[#a78bfa] max-w-lg text-lg italic">"{currentFact}"</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/10 border border-red-900/50 p-6 rounded-2xl text-red-400 text-sm mb-8">
            System Error: {error}
          </div>
        )}

        {/* Quiz Output Display */}
        {quiz && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-zinc-800 flex-1"></div>
              <h2 className="text-xl font-bold text-white font-heading tracking-tight">
                Active Diagnostic Matrix
              </h2>
              <div className="h-px bg-zinc-800 flex-1"></div>
            </div>

            {questions.length > 0 ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmitAnswers(); }}>
                <div className="space-y-6">
                  {questions.map((question, index) => (
                    <div key={index} className="bg-[#0A0A18] border border-zinc-800 rounded-2xl p-6 md:p-8 relative overflow-hidden group">
                      {/* Subtle question number label */}
                      <div className="absolute top-0 right-0 bg-zinc-900 text-zinc-500 font-mono text-xs px-3 py-1 rounded-bl-lg">
                        Q_0{index + 1}
                      </div>

                      <h3 className="text-lg text-zinc-200 mb-6 pr-8 leading-relaxed font-medium">
                        {renderMathText(question.text)}
                      </h3>
                      
                      <div className="space-y-3 mb-6">
                        {question.options.map((option: string, optIdx: number) => (
                          <label key={optIdx} className="flex items-start gap-4 p-4 rounded-xl border border-zinc-800/50 hover:border-[#4f8ef7]/40 hover:bg-[#0f0f20] cursor-pointer transition-all">
                            <input
                              type="radio"
                              name={`question-${index}`}
                              value={option.charAt(0)}
                              checked={answers[index]?.answer === option.charAt(0)}
                              onChange={(e) => handleAnswerChange(index, e.target.value)}
                              className="mt-1 w-4 h-4 text-[#4f8ef7] bg-zinc-900 border-zinc-700 focus:ring-[#4f8ef7] focus:ring-offset-zinc-900 accent-[#4f8ef7]"
                            />
                            <span className="text-zinc-400 text-sm">{renderMathText(option)}</span>
                          </label>
                        ))}
                      </div>

                      {showAnswers && (
                        <div className="mb-6 p-4 rounded-xl bg-emerald-900/10 border border-emerald-900/30 text-emerald-400 text-sm font-medium">
                          Correct Answer: {renderMathText(question.correctAnswer)}
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                          Reasoning Log (Optional)
                        </label>
                        <textarea
                          value={answers[index]?.reasoning || ""}
                          onChange={(e) => handleReasoningChange(index, e.target.value)}
                          className="w-full bg-[#0f0f20] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-[#4f8ef7]/60 transition-colors resize-none"
                          placeholder="Log your theoretical approach here..."
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 flex justify-center">
                  <button type="submit" disabled={loading} className="tg-btn disabled:opacity-50">
                    {loading ? "Transmitting Telemetry..." : "Submit Diagnostic Data"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-8 border border-red-900/50 bg-red-900/10 rounded-2xl text-red-400 text-center">
                <p>Compile Error: No valid questions generated.</p>
                <p className="text-xs mt-2 opacity-70">Raw Content dump: {quiz}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </main>
  );
}