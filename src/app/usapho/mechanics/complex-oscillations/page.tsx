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
import styles from "../../usa.module.css";
import { parseQuizQuestions } from "../../../../lib/quizParser";

const PAST_PROBLEMS = [
    {
        id: "PST_01",
        title: "USAPhO 2021 Problem B3",
        desc: "This problem is a sophisticated analytical mechanics challenge that uses a zero-relaxed-length spring on a sphere to test a student's mastery of structural stability bifurcations, constrained orbital dynamics, and non-intuitive constraint forces.",
        url: "https://www.aapt.org/Common/upload/2020_USAPhO.pdf",
        type: "Problem",
    },
];

const PHYSICS_FACTS = [
    "The Navier-Stokes equations, which govern the motion of fluid substances, are a statement of Newton's second law applied to continuous media under the assumption of a Newtonian fluid.",
    "In a steady, incompressible, and inviscid flow, Bernoulli's principle states that an increase in the speed of the fluid occurs simultaneously with a decrease in static pressure or a decrease in the fluid's potential energy.",
    "The Reynolds number (Re = \frac{\rho u L}{\mu}) is a dimensionless quantity that predicts fluid flow patterns, where low values indicate laminar flow dominated by viscous forces and high values indicate turbulent flow dominated by inertial forces.",
    "Boundary layer separation occurs when the pressure gradient is adverse (\frac{dp}{dx} > 0), causing the velocity gradient at the wall to drop to zero and forcing the bulk fluid to detach from the solid surface."
];

const NODE_ID = 'USA-02';
const DIFFICULTY_LEVEL = "USAPhO Mechanics physics competition";
const SAMPLE_PROBLEMS = `Question B3
The Mad Hatter
A frictionless hemisphere of radius R is fixed on top of a flat cylinder. One end of a spring with
zero relaxed length and spring constant k (i.e. the force from the spring when stretched to length \`
is -k\`) is fixed to the top of the hemisphere. Its other end is attached to a point mass of mass m.
θ
R
a. The number and nature of the equilibrium points on the hemisphere depends on the value of
the spring constant k. Consider the semicircular arc shown above as a dashed line, which is
parameterized by angles in the range -π/2 ≤ θ ≤ π/2. Make a table indicating the number of
equilibrium points on the arc, and the number that are stable, for each range of k values. A
blank table for your reference is given below. (You may need more or fewer rows than shown.)
Range of k (kmin < k < kmax) # of Equilibria # of Stable Equilibria
0 < k < ?
? < k < ∞
For the rest of the problem, suppose the value of k is such that the mass begins at stable equilibrium
on the surface of the hemisphere at angle θ0. The mass can move on the two-dimensional surface
of the hemisphere, but a radially-inward external force prevents it from jumping off the surface.
b. At t = 0, the mass is given a speed v along a line of constant latitude θ = θ0.
θ = θ0
v
i. Indicate which of the following trajectories the mass takes for a short time after t = 0 and
briefly explain your reasoning. The differences between the paths are exaggerated.
2021 USAPhO Part B 4
B θ = θ0
A
C
ii. What is the total radial force (i.e., normal to the surface of the hemisphere) on the mass at
t = 0? Express your answer in terms of m, v, R, g, and θ0.
c. A cylinder of radius r ≪ Rθ0 is placed on top of the sphere. Suppose the mass is launched at an
angle α away from the direction of the spring's displacement with kinetic energy K, as shown.
What is the maximum angle αmax at which the mass can be launched such that it can still hit
the cylinder? Express your answer in terms of K, m, g, θ0, r, and R. You may assume K is
large enough for the mass to reach the cylinder for α = 0.
v
α
(view from above)
Copyright ©2021 American Association of Physics Teachers`;

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

export default function AribitraryPage() {
    const auth = getAuth(app);

    const TOPIC_NAME = "USAPhO";
    const SUBTOPIC_NAME = "Arbitrary Potential Wells and Approximated Oscillations";

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
    const [questionExplanations, setQuestionExplanations] = useState<any[]>([]);

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
        const progressRef = doc(db, 'users', user.uid, 'progress', 'USAPhO');

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
                body: JSON.stringify({
                    userId: user?.uid || "guest",
                    score: correctCount,
                    total: questions.length,
                    gradedResults,
                    difficultyLevel: DIFFICULTY_LEVEL // Passes the difficulty to the backend
                }),
            });

            if (!response.ok) throw new Error("Evaluate failed.");
            const data = await response.json();
            setAiFeedback(data.analysis?.feedbackSummary || "Diagnostic complete.");
            setQuestionExplanations(data.analysis?.questionExplanations || []);

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

                <Link href="/usapho/mechanics" className={styles.breadcrumb}>
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
                    Return to USAPhO Mechanics Directory
                </Link>

                <div className={styles.header}>
                    <div className={styles.badge}>SYS_// {NODE_ID}</div>
                    <h1 className={styles.title}>{SUBTOPIC_NAME}</h1>
                    <p className={styles.subtitle}>
                        Take a look at some past problems below to gain a further understanding of what USAPhO problem in this category looks like.
                    </p>
                </div>

                <div className={styles.protocolsSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Before taking the quiz...</h2>
                        <hr className={styles.sectionRule} />
                    </div>

                    <div className={styles.protocolsGrid}>
                        {PAST_PROBLEMS.map((resource) => (
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
                                <p className={styles.terminalSubtitle}>Complex Oscillations</p>
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