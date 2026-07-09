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
import styles from "../../fmapb.module.css";
import { parseQuizQuestions } from "../../../../lib/quizParser";
const auth = getAuth(app);
const STUDY_RESOURCES = [
];

const PHYSICS_FACTS = [
    "For a rigid body to achieve static equilibrium, both the vector sum of all external forces and the vector sum of all external torques about any arbitrary pivot point must equal zero (\sum \vec{F} = 0 and \sum \vec{T} = 0), ensuring the system remains completely at rest.",
    "Mechanical equilibrium encompasses both static and dynamic states, dictating that a system has zero linear and angular acceleration; a object moving at a constant linear and rotational velocity is still in mechanical equilibrium despite its motion.",
    "The stability of a system in static equilibrium is determined by the behavior of its potential energy function (U); a system is in stable equilibrium if it rests at a local minimum (\frac{d^2U}{dx^2} > 0), meaning any slight displacement generates a restoring force back toward that position.",
    "Virtual work principles state that for a system in mechanical equilibrium, the total virtual work done by all active forces during any arbitrary, infinitesimal virtual displacement compatible with the system's constraints is identically zero (\delta W = \sum \vec{F}_i \cdot \delta \vec{r}_i = 0)."
]

const NODE_ID = 'FMA-06';
const DIFFICULTY_LEVEL = "F=MA physics competition";
const SAMPLE_PROBLEMS = "An object of mass $m_1$ initially moving at speed $v_0$ collides with an originally stationary object of mass $m_2 = \\alpha m_1$, where $\\alpha < 1$. The collision could be completely elastic, completely inelastic, or partially inelastic. After the collision the two objects move at speeds $v_1$ and $v_2$. Assume that the collision is one dimensional, and that object one cannot pass through object two.\n\nAfter the collision, the speed ratio $r_2 = \\frac{v_2}{v_0}$ of object 2 is bounded by:\n\n(A) $\\frac{1 - \\alpha}{1 + \\alpha} \\le r_2 \\le 1$\n(B) $\\frac{1 - \\alpha}{1 + \\alpha} \\le r_2 \\le \\frac{1}{1 + \\alpha}$\n(C) $\\frac{\\alpha}{1 + \\alpha} \\le r_2 \\le 1$\n(D) $0 \\le r_2 \\le \\frac{2\\alpha}{1 + \\alpha}$\n(E) $\\frac{1}{1 + \\alpha} \\le r_2 \\le \\frac{2}{1 + \\alpha}$  ← CORRECT\n\nSolution:\nTo determine the bounds of the speed ratio $r_2$, we examine the two physical extremes of one-dimensional collisions: a completely inelastic collision and a completely elastic collision.\n\n1. **Lower Bound: Completely Inelastic Collision**\n   In a completely inelastic collision, the two objects stick together after impact and move forward with a single shared final velocity ($v_1 = v_2 = v_f$). This represents the minimum possible speed transferred to object 2 because maximum kinetic energy is dissipated.\n   \n   Applying conservation of linear momentum:\n   $$m_1 v_0 + m_2(0) = (m_1 + m_2)v_f$$\n   \n   Substitute $m_2 = \\alpha m_1$:\n   $$m_1 v_0 = (m_1 + \\alpha m_1)v_f \\implies m_1 v_0 = m_1(1 + \\alpha)v_f$$\n   $$v_f = \\frac{v_0}{1 + \\alpha}$$\n   \n   Solving for the speed ratio $r_2$ under this condition:\n   $$r_{2,\\text{min}} = \\frac{v_2}{v_0} = \\frac{1}{1 + \\alpha}$$\n\n2. **Upper Bound: Completely Elastic Collision**\n   In a completely elastic collision, kinetic energy is perfectly conserved, resulting in the maximum possible mechanical energy and speed transfer to the target mass.\n   \n   Using the standard 1D elastic collision velocity formula for a stationary target:\n   $$v_2 = \\left(\\frac{2m_1}{m_1 + m_2}\\right)v_0$$\n   \n   Substitute $m_2 = \\alpha m_1$:\n   $$v_2 = \\left(\\frac{2m_1}{m_1 + \\alpha m_1}\\right)v_0 = \\left(\\frac{2}{1 + \\alpha}\\right)v_0$$\n   \n   Solving for the speed ratio $r_2$ under this condition:\n   $$r_{2,\\text{max}} = \\frac{v_2}{v_0} = \\frac{2}{1 + \\alpha}$$\n\n3. **Physical Constraints and Verification:**\n   Since any real-world partially inelastic collision falls strictly between these two extremes, the ratio must satisfy:\n   $$\\frac{1}{1 + \\alpha} \\le r_2 \\le \\frac{2}{1 + \\alpha}$$\n   \n   Additionally, because $\\alpha < 1$, the incoming object $m_1$ is striking a less massive object ($m_2$). In an elastic collision, object 1 will continue moving forward after impact with a speed ratio of $r_1 = \\frac{1 - \\alpha}{1 + \\alpha} > 0$. Because object 1 cannot pass through object 2, object 2 is guaranteed to be pushed forward, maintaining a velocity greater than or equal to object 1 ($v_2 \\ge v_1$).\n\nTherefore, the correct choice is (E).";
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

export default function AdvancedCollisionPage() {
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

    const TOPIC_NAME = "F=ma";
    const SUBTOPIC_NAME = "Advanced Collisions and Restitution";

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
        const unsubscribe = onAuthStateChanged(
            auth,
            (currentUser) => {
                setUser(currentUser);
                setAuthReady(true);
            },
        );

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
            const prompt = `You are an expert physics professor and competition problem writer generating a diagnostic quiz on: "${SUBTOPIC_NAME}".

Target Difficulty Level: ${DIFFICULTY_LEVEL}

To calibrate the difficulty, carefully analyze the following sample problems. Your generated questions must exactly match the conceptual depth, mathematical rigor, trickiness, and multi-step reasoning required by these samples.

--- SAMPLE PROBLEMS ---
${SAMPLE_PROBLEMS}
-----------------------
${overrideText ? `\nCRITICAL USER OVERRIDE INSTRUCTIONS: "${overrideText}"\n` : ""}
CRITICAL INSTRUCTIONS:
1. Generate EXACTLY ${questionCount} multiple-choice question${questionCount === 1 ? "" : "s"} — no more, no fewer.
2. Ensure the difficulty strictly aligns with the provided sample problems. 
3. You MUST use standard LaTeX formatting for all variables, formulas, and math. Enclose inline math with single $ signs and block math with double $$ signs.
4. Output ONLY the quiz. Do not include any introductory text.
5. You may use standard physics constants.

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
        const progressRef = doc(db, 'users', user.uid, 'progress', 'F=ma');

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
                    difficultyLevel: DIFFICULTY_LEVEL,
                }),
            });


            const responseText = await response.text();

            let data: any;

            try {
                data = JSON.parse(responseText);
            } catch {
                throw new Error(
                    responseText || `Evaluation failed with status ${response.status}`,
                );
            }

            if (!response.ok) {
                throw new Error(
                    data.error || `Evaluation failed with status ${response.status}`,
                );
            }

            setAiFeedback(
                data.analysis?.feedbackSummary || "Diagnostic complete.",
            );

            setQuestionExplanations(
                data.analysis?.questionExplanations || [],
            );


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

                <Link href="/fmapb/fma" className={styles.breadcrumb}>
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
                    Return to F=ma Directory
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
                                <p className={styles.terminalSubtitle}>Advanced Collisions</p>
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
                            {isGenerating ? "Generating GPT 5.4 Parameters..." : "AI Evaluating Telemetry..."}
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