"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAuth,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

import { app } from "../../../../firebase";
import {
  getFirestore,
  collection,
  addDoc,
  Timestamp,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";
import { motion } from "framer-motion";
import { parseQuizQuestions } from "../../../../lib/quizParser";
import styles from "../../hsdirectory.module.css";

const STUDY_RESOURCES = [
  {
    id: "REF_01",
    title: "The Physics Classroom: Electric Circuits",
    desc: "One chapter broken into 4 lessons. The flow of charge through electric circuits is discussed in detail. The variables which cause and hinder the rate of charge flow are explained and the mathematical application of electrical principles to series, parallel and combination circuits is presented.",
    url: "https://www.physicsclassroom.com/tutorial/electric-circuits",
    type: "Articles",
  },
  {
    id: "REF_02",
    title: "The Physics Classroom: Interactive Electric Circuits",
    desc: "Build a circuit!",
    url: "https://www.physicsclassroom.com/Interactive/Electric-Circuits",
    type: "Interactive",
  },
  {
    id: "REF_03",
    title: "Flipping Physics: Electric Circuits",
    desc: "Complete, detailed, professional lecture videoes",
    url: "http://www.flippingphysics.com/ap-physics-2.html#unit11",
    type: "Lectures",
  },
  {
    id: "REF_04",
    title: "Organic Chemistry Tutor",
    desc: "Electric Current and Circuits explained, Ohm's Law, Charge, Power, Physics Problems and Basic Electricity.",
    url: "https://www.youtube.com/watch?v=r-SCyD7f_zI&pp=ygUpb3JnYW5pYyBjaGVtaXN0cnkgdHV0b3IgZWxlY3RyaWMgY2lyY3VpdHPSBwkJPwsBhyohjO8%3D",
    type: "Video",
  },
];

const PHYSICS_FACTS = [
  "If the net voltage (potential difference) across a component is zero, its electric current must be constant at zero.",
  "Resistance is not a force; it is an intrinsic property of a material directly related to its resistivity and geometry.",
  "A circuit loop maintaining a constant current of 100 Amperes through a superconducting wire has a net electromotive force of zero dropping across that segment.",
  "A lightbulb brightens the instant you flip a switch because the electric field propagates through the circuit near the speed of light, forcing the already-present electrons into motion."
];

// 2. ADDED CONSTANTS FOR PROGRESS TRACKING
// Map each quiz page to its node ID
const NODE_ID = 'ENM-02';
const UNLOCKS_MAP: Record<string, string[]> = {
  'ENM-01': ['ENM-02'],
  'ENM-02': ['ENM-03'],
  'ENM-03': ['ENM-04'],
  'ENM-04': [],
};

const PREREQUISITES_MAP: Record<string, string[]> = {
  'ENM-02': ['ENM-01'],
  'ENM-03': ['ENM-02'],
  'ENM-04': ['ENM-03'],
};

export default function CurrentCircuitsPage() {
  const auth = getAuth(app);

  async function authenticatedFetch(
    url: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("You must be signed in to continue.");
    }

    const idToken = await currentUser.getIdToken();

    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
        ...options.headers,
      },
    });
  }

  const TOPIC_NAME = "Electricity and Magnetism";
  const SUBTOPIC_NAME = "Current Circuits";

  const [overrideText, setOverrideText] = useState("");
  const [questionCount, setQuestionCount] = useState(3);
  const [quiz, setQuiz] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<any>({});
  const [startTime, setStartTime] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [currentFact, setCurrentFact] = useState("");
  const [showAnswers, setShowAnswers] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [questionExplanations, setQuestionExplanations] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });

    return unsubscribe;
  }, []);


  useEffect(() => {
    let interval: any;
    if (isGenerating || isEvaluating) {
      setCurrentFact(PHYSICS_FACTS[Math.floor(Math.random() * PHYSICS_FACTS.length)]);
      interval = setInterval(() => {
        setCurrentFact(PHYSICS_FACTS[Math.floor(Math.random() * PHYSICS_FACTS.length)]);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isGenerating, isEvaluating]);

  async function handleGenerateQuiz() {
    setIsGenerating(true);
    setError(null);
    setQuiz(null);
    setAnswers({});
    setStartTime(Date.now());
    setShowAnswers(false);
    setFinalScore(null);
    setAiFeedback(null);
    setQuestionExplanations([]);

    try {
      const prompt = `You are an expert physics professor generating a diagnostic quiz on: "${SUBTOPIC_NAME}".
${overrideText ? `\nCRITICAL USER OVERRIDE INSTRUCTIONS: "${overrideText}"\n` : "\nVary the conceptual difficulty appropriately to test core knowledge of current circuits.\n"}

CRITICAL INSTRUCTIONS:
1. Generate EXACTLY ${questionCount} multiple-choice question${questionCount === 1 ? "" : "s"} — no more, no fewer.
2. You MUST use standard LaTeX formatting for all variables, formulas, and math. Enclose inline math with single $ signs and block math with double $$ signs.
3. Output ONLY the quiz. Do not include any introductory text.
4. You may use standard physics constants.

Strictly follow this exact format for every question:
### Question [number]
[Question text]
a) [Option 1]
b) [Option 2]
c) [Option 3]
d) [Option 4]
**Correct Answer:** [Correct option letter]
---`;

      const quizResponse = await authenticatedFetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });



      if (!quizResponse.ok) throw new Error(`API Error: ${await quizResponse.text()}`);

      const data = await quizResponse.json();
      const quizContent = data.content || "";

      const parsedQuestions = parseQuizQuestions(quizContent);
      if (!quizContent || parsedQuestions.length === 0) {
        throw new Error("Quiz parsing failed: The AI returned invalid formatting.");
      }

      setQuiz(quizContent);
      setTimeout(() => document.getElementById("quiz-anchor")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  }



  const handleAnswerChange = (index: number, value: string) => {
    setAnswers((prev: any) => ({ ...prev, [index]: { ...prev[index], answer: value } }));
  };

  const questions = parseQuizQuestions(quiz || "");
  async function updateProgress(correctCount: number) {
    if (!user?.uid) return;
    const db = getFirestore(app);
    const progressRef = doc(db, 'users', user.uid, 'progress', 'electricity');

    // Read current progress
    const snap = await getDoc(progressRef);
    const current = (snap.exists() ? snap.data() : {}) as Record<string, string>;

    const updates: Record<string, string> = { ...current };

    // Mark this node mastered if score >= 5
    if (correctCount >= 5) {
      updates[NODE_ID] = 'mastered';

      // Check each node this unlock might affect
      const candidates = UNLOCKS_MAP[NODE_ID] ?? [];
      for (const candidateId of candidates) {
        const prereqs = PREREQUISITES_MAP[candidateId] ?? [];
        const allMet = prereqs.every(p => updates[p] === 'mastered');
        // Only promote locked → unlocked, never downgrade mastered
        if (allMet && updates[candidateId] !== 'mastered') {
          updates[candidateId] = 'unlocked';
        }
      }
    }

    await setDoc(progressRef, updates, { merge: true });
  }
  function normalizeAnswer(value: unknown): string {
    if (typeof value !== "string") return "";

    return value
      .trim()
      .toLowerCase()
      .replace(/[).:\s]/g, "")
      .charAt(0);
  }
  async function handleSubmitAnswers() {
    setIsEvaluating(true);
    setError(null);

    try {
      const timeTaken = (Date.now() - (startTime || Date.now())) / 1000;
      let correctCount = 0;
      const gradedResults = questions.map((question, index) => {
        const userAnswer = normalizeAnswer(
          answers[index]?.answer,
        );

        const correctAnswer = normalizeAnswer(
          question.correctAnswer,
        );

        const isCorrect =
          userAnswer === correctAnswer;

        if (isCorrect) {
          correctCount++;
        }

        return {
          question: question.text,
          userAnswer: userAnswer || "none",
          correctAnswer,
          isCorrect,
        };
      });


      setFinalScore(correctCount);
      setShowAnswers(true);

      const response = await authenticatedFetch("/api/evaluate", {
        method: "POST",
        body: JSON.stringify({
          score: correctCount,
          total: questions.length,
          gradedResults,
          difficultyLevel: "High School Physics",
        }),
      });


      if (!response.ok) throw new Error("Evaluate failed.");
      const data = await response.json();
      setAiFeedback(data.analysis?.feedbackSummary || "Diagnostic complete.");
      setQuestionExplanations(data.analysis?.questionExplanations || []);

      // 4. UPDATED FIRESTORE LOGIC TO INCLUDE updateProgress()
      const db = getFirestore(app);
      await addDoc(collection(db, "quizLogs"), {
        score: correctCount,
        totalQuestions: questions.length,
        topic: `${TOPIC_NAME} - ${SUBTOPIC_NAME}`,
        timeTaken: `${timeTaken}s`,
        analysis: data.analysis?.feedbackSummary,
        timestamp: Timestamp.fromDate(new Date()),
        userId: user?.uid,
      });

      await updateProgress(correctCount); // Trigger roadmap progress logic

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsEvaluating(false);
    }
  }

  const renderMathText = (text: string) => {
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
    <main className={`page-wrapper ${styles.pageWrapper}`}>
      <div className={styles.inner}>

        {/* Breadcrumb */}
        <Link href="/highschoolquiz/electricity" className={styles.breadcrumb}>
          <svg
            className={styles.breadcrumbIcon}
            fill="none"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Return to Electricity and Magnetism Directory
        </Link>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.badge}>SYS_// ENM_02</div>
          <h1 className={styles.title}>{SUBTOPIC_NAME}</h1>
          <p className={styles.subtitle}>
            Review the study protocols below to calibrate your theoretical knowledge, then initialize the diagnostic terminal to test your mastery.
          </p>
        </div>

        {/* Study Protocols */}
        <div className={styles.protocolsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Before taking the quiz...</h2>
            <hr className={styles.sectionRule} />
          </div>

          <div className={styles.protocolsGrid}>
            {STUDY_RESOURCES.map((resource) => (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                key={resource.id}
                className={styles.protocolCard}
              >
                <div>
                  <div className={styles.protocolCardTop}>
                    <span className={styles.protocolId}>{resource.id}</span>
                    <span className={styles.protocolType}>{resource.type}</span>
                  </div>
                  <h3 className={styles.protocolTitle}>{resource.title}</h3>
                  <p className={styles.protocolDesc}>{resource.desc}</p>
                </div>
                <div className={styles.protocolFooter}>
                  Access resource
                  <svg
                    className={styles.protocolArrow}
                    fill="none"
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Diagnostic Terminal */}
        <div id="diagnostic-terminal" className={styles.terminalSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Diagnostic Terminal</h2>
            <hr className={styles.sectionRule} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.terminal}
          >
            {/* Left panel */}
            <div className={styles.terminalLeft}>
              <div>
                <div className={styles.terminalStatusRow}>
                  <div className={styles.terminalDot} />
                  <span className={styles.terminalStatusLabel}>Target Locked</span>
                </div>
                <h3 className={styles.terminalId}>ENM-02</h3>
                <p className={styles.terminalSubtitle}>Current Circuits</p>
                <div className={styles.terminalStat}>
                  <span className={styles.terminalStatLabel}>Questions</span>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    style={{
                      background: '#0f0f20',
                      color: '#4f8ef7',
                      border: '1px solid #333',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      outline: 'none',
                      fontFamily: 'monospace'
                    }}
                  >
                    <option value={3}>3 Questions</option>
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div className={styles.terminalRight}>
              <div>
                <label className={styles.terminalLabel}>
                  Manual Command Override (Optional)
                </label>
                <textarea
                  value={overrideText}
                  onChange={(e) => setOverrideText(e.target.value)}
                  className={styles.terminalTextarea}
                  rows={3}
                  placeholder='> e.g., "Make the questions strictly conceptual with no math calculations required..."'
                />
              </div>
              <div className={styles.terminalFooter}>
                <button
                  onClick={handleGenerateQuiz}
                  disabled={isGenerating}
                  className="tg-btn"
                  style={{ opacity: isGenerating ? 0.5 : 1, cursor: isGenerating ? "not-allowed" : "pointer" }}
                >
                  {isGenerating ? "Compiling Matrix..." : "Initialize Diagnostic"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Loading */}
        {(isGenerating || isEvaluating) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.loadingBox}>
            <div className={styles.spinner} />
            <p className={styles.loadingLabel}>
              {isGenerating ? "Generating GPT 5.4 Parameters..." : "AI Evaluating Telemetry..."}
            </p>
            <p className={styles.loadingFact}>"{currentFact}"</p>
          </motion.div>
        )}

        {/* Error */}
        {error && <div className={styles.errorBox}>System Error: {error}</div>}

        {/* Results */}
        <div id="quiz-anchor" />
        {showAnswers && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={styles.resultsBlock}
          >
            <p className={styles.resultsLabel}>Diagnostic Score</p>
            <div className={styles.resultsScore}>
              {finalScore}
              <span className={styles.resultsScoreDenom}> / {questions.length}</span>
            </div>
            <hr className={styles.resultsDivider} />
            <h3 className={styles.resultsFeedbackTitle}>AI Feedback Analysis</h3>
            <p className={styles.resultsFeedbackText}>{aiFeedback}</p>
            {questions.length > 0 && (
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {questions.map((q, idx) => {
                  const correctOption = q.options.find(
                    (opt: string) => opt.charAt(0).toLowerCase() === q.correctAnswer
                  );
                  const explanation = questionExplanations.find((e: any) => e.index === idx)?.explanation;

                  return (
                    <div
                      key={idx}
                      style={{
                        background: '#0f0f20',
                        border: '1px solid #333',
                        borderRadius: '6px',
                        padding: '10px 14px',
                      }}
                    >
                      <p style={{ color: '#4f8ef7', fontFamily: 'monospace', fontSize: '13px', margin: 0 }}>
                        Q_0{idx + 1} — Correct: {renderMathText(correctOption || "")}
                      </p>
                      {explanation && (
                        <p style={{ color: '#aaa', fontSize: '13px', margin: '6px 0 0 0' }}>
                          {explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Quiz */}
        {quiz && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.quizSection}
          >
            {questions.length > 0 && (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmitAnswers(); }}>
                <div className={styles.questionList}>
                  {questions.map((question, index) => {
                    const userAnswer = answers[index]?.answer?.toLowerCase();
                    const isCorrect = userAnswer === question.correctAnswer;

                    return (
                      <div
                        key={index}
                        className={[
                          styles.questionCard,
                          showAnswers ? (isCorrect ? styles.correct : styles.incorrect) : "",
                        ].join(" ")}
                      >
                        <div className={styles.questionNumber}>Q_0{index + 1}</div>
                        <h3 className={styles.questionText}>{renderMathText(question.text)}</h3>

                        <div className={styles.optionsList}>
                          {question.options.map((option: string, optIdx: number) => {
                            const optionLetter = option.charAt(0).toLowerCase();
                            const isSelected = userAnswer === optionLetter;
                            const isActuallyCorrect = optionLetter === question.correctAnswer;

                            let optionClass = styles.optionLabel;
                            if (showAnswers) {
                              if (isActuallyCorrect) optionClass = `${styles.optionLabel} ${styles.isCorrect}`;
                              else if (isSelected && !isActuallyCorrect) optionClass = `${styles.optionLabel} ${styles.isWrong}`;
                              else optionClass = `${styles.optionLabel} ${styles.dimmed}`;
                            } else if (isSelected) {
                              optionClass = `${styles.optionLabel} ${styles.selected}`;
                            }

                            return (
                              <label key={optIdx} className={optionClass}>
                                <input
                                  type="radio"
                                  name={`question-${index}`}
                                  value={optionLetter}
                                  checked={isSelected}
                                  onChange={(e) => !showAnswers && handleAnswerChange(index, e.target.value)}
                                  disabled={showAnswers}
                                  className={styles.optionRadio}
                                />
                                <span className={styles.optionText}>{renderMathText(option)}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {!showAnswers && (
                  <div className={styles.submitRow}>
                    <button
                      type="submit"
                      disabled={isEvaluating}
                      className="tg-btn"
                      style={{ opacity: isEvaluating ? 0.5 : 1 }}
                    >
                      Transmit Telemetry
                    </button>
                  </div>
                )}
              </form>
            )}
          </motion.div>
        )}

      </div>
    </main>
  );
}