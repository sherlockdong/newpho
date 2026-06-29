"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAuth, onAuthStateChanged } from "firebase/auth";
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
    title: "The Physics Classroom: Newtos Laws Lesson One",
    desc: "A highly readable conceptual breakdown of mass, inertia, and state of motion.",
    url: "https://www.physicsclassroom.com/class/newtlaws/Lesson-1/Newton-s-First-Law",
    type: "Article",
  },
  {
    id: "REF_02",
    title: "Khan Academy: Unit One",
    desc: "Step-by-step video lecture explaining balanced forces and reference frames.",
    url: "https://www.khanacademy.org/science/highschool-physics/x6679aa2c65c01e53:motion-and-forces/x6679aa2c65c01e53:newtons-first-and-second-laws/v/newtons_first_law",
    type: "Video",
  },
  {
    id: "REF_03",
    title: "Flipping Physics: First Law Demos",
    desc: "Real-world visual demonstrations of objects resisting changes in motion.",
    url: "https://www.flippingphysics.com/first-law.html",
    type: "Demonstration",
  },  {
    id: "REF_04",
    title: "Organic Chemistry Tutor",
    desc: "Real-world visual demonstrations of objects resisting changes in motion.",
    url: "https://www.youtube.com/watch?v=Fr5EMXZaujc&pp=ygUQbmV3dG9uIGZpcnN0IGxhdw%3D%3D",
    type: "Video",
  },
];

const PHYSICS_FACTS = [
  "If the net force on an object is zero, its velocity must be constant.",
  "Inertia is not a force; it is a property of matter directly related to its mass.",
  "An object moving at a constant 100 m/s in a straight line has a net force of zero acting upon it.",
  "You feel pushed back in an accelerating car because your body's inertia wants to stay at rest.",
];

const NODE_ID = 'MCH-01';

const UNLOCKS_MAP: Record<string, string[]> = {
  'MCH-01': ['MCH-03', 'MCH-04'],
  'MCH-02': ['MCH-03', 'MCH-07'],
  'MCH-03': ['MCH-05', 'MCH-06', 'MCH-08'],
  'MCH-04': ['MCH-05'],
  'MCH-05': ['MCH-08'],
  'MCH-06': ['MCH-09'],
  'MCH-07': ['MCH-09'],
};

const PREREQUISITES_MAP: Record<string, string[]> = {
  'MCH-03': ['MCH-01', 'MCH-02'],
  'MCH-04': ['MCH-01'],
  'MCH-05': ['MCH-03', 'MCH-04'],
  'MCH-06': ['MCH-03'],
  'MCH-07': ['MCH-02'],
  'MCH-08': ['MCH-03', 'MCH-05'],
  'MCH-09': ['MCH-06', 'MCH-07'],
};

export default function NewtonsFirstLawPage() {
  const auth = getAuth(app);

  const TOPIC_NAME = "Mechanics";
  const SUBTOPIC_NAME = "Newton's First Law of Motion — Inertia";

  const [overrideText, setOverrideText] = useState("");
  const [questionCount, setQuestionCount] = useState(3);
  const [quiz, setQuiz] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<any>({});
  const [startTime, setStartTime] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [currentFact, setCurrentFact] = useState("");
  const [showAnswers, setShowAnswers] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

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

    try {
const prompt = `You are an expert physics professor generating a diagnostic quiz on: "${SUBTOPIC_NAME}".
${overrideText ? `\nCRITICAL USER OVERRIDE INSTRUCTIONS: "${overrideText}"\n` : "\nVary the conceptual difficulty appropriately to test core knowledge of linear motion.\n"}

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

      const quizResponse = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    const progressRef = doc(db, 'users', user.uid, 'progress', 'mechanics');

    const snap = await getDoc(progressRef);
    const current = (snap.exists() ? snap.data() : {}) as Record<string, string>;

    const updates: Record<string, string> = { ...current };

    if (correctCount >= 5) {
      updates[NODE_ID] = 'mastered';

      const candidates = UNLOCKS_MAP[NODE_ID] ?? [];
      for (const candidateId of candidates) {
        const prereqs = PREREQUISITES_MAP[candidateId] ?? [];
        const allMet = prereqs.every(p => updates[p] === 'mastered');
        if (allMet && updates[candidateId] !== 'mastered') {
          updates[candidateId] = 'unlocked';
        }
      }
    }

    await setDoc(progressRef, updates, { merge: true });
  }

  async function handleSubmitAnswers() {
    setIsEvaluating(true);
    setError(null);

    try {
      const timeTaken = (Date.now() - (startTime || Date.now())) / 1000;
      let correctCount = 0;
      const gradedResults = questions.map((q, index) => {
        const userAnswer = answers[index]?.answer?.toLowerCase() || "none";
        const isCorrect = userAnswer === q.correctAnswer;
        if (isCorrect) correctCount++;
        return { question: q.text, userAnswer, correctAnswer: q.correctAnswer, isCorrect };
      });

      setFinalScore(correctCount);
      setShowAnswers(true);

      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.uid || "guest", score: correctCount, total: questions.length, gradedResults }),
      });

      if (!response.ok) throw new Error("Evaluate failed.");
      const data = await response.json();
      setAiFeedback(data.analysis?.feedbackSummary || "Diagnostic complete.");

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

      await updateProgress(correctCount);
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

        <Link href="/highschoolquiz/mechanics" className={styles.breadcrumb}>
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
          Return to Mechanics Directory
        </Link>

        <div className={styles.header}>
          <div className={styles.badge}>SYS_// {NODE_ID}</div>
          <h1 className={styles.title}>{SUBTOPIC_NAME}</h1>
          <p className={styles.subtitle}>
            Review the study protocols below to calibrate your theoretical knowledge, then initialize the diagnostic terminal to test your mastery.
          </p>
        </div>

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
            <div className={styles.terminalLeft}>
              <div>
                <div className={styles.terminalStatusRow}>
                  <div className={styles.terminalDot} />
                  <span className={styles.terminalStatusLabel}>Target Locked</span>
                </div>
                <h3 className={styles.terminalId}>{NODE_ID}</h3>
                <p className={styles.terminalSubtitle}>Inertia & Balanced Forces</p>
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

        {(isGenerating || isEvaluating) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.loadingBox}>
            <div className={styles.spinner} />
            <p className={styles.loadingLabel}>
              {isGenerating ? "Generating GPT-4o Parameters..." : "AI Evaluating Telemetry..."}
            </p>
            <p className={styles.loadingFact}>"{currentFact}"</p>
          </motion.div>
        )}

        {error && <div className={styles.errorBox}>System Error: {error}</div>}

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
          </motion.div>
        )}

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