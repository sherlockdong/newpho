"use client";

import Link from "next/link";
import "katex/dist/katex.min.css";
import { useQuizDiagnostics } from "../../../../lib/useQuizDiagnostics";
import { getOptionTextByLetter } from "../../../../lib/quizUtils";
import { RenderQuizMath } from "../../../../lib/renderQuizMath";
import { motion } from "framer-motion";
import styles from "../../fmapb.module.css";

const STUDY_RESOURCES = [
];

const PHYSICS_FACTS = [
    "For a rigid body to achieve static equilibrium, both the vector sum of all external forces and the vector sum of all external torques about any arbitrary pivot point must equal zero (\sum \vec{F} = 0 and \sum \vec{T} = 0), ensuring the system remains completely at rest.",
    "Mechanical equilibrium encompasses both static and dynamic states, dictating that a system has zero linear and angular acceleration; a object moving at a constant linear and rotational velocity is still in mechanical equilibrium despite its motion.",
    "The stability of a system in static equilibrium is determined by the behavior of its potential energy function (U); a system is in stable equilibrium if it rests at a local minimum (\frac{d^2U}{dx^2} > 0), meaning any slight displacement generates a restoring force back toward that position.",
    "Virtual work principles state that for a system in mechanical equilibrium, the total virtual work done by all active forces during any arbitrary, infinitesimal virtual displacement compatible with the system's constraints is identically zero (\delta W = \sum \vec{F}_i \cdot \delta \vec{r}_i = 0)."
]

const NODE_ID = 'FMA-04';
const DIFFICULTY_LEVEL = "F=MA physics competition";
const SAMPLE_PROBLEMS = "A 1.00 m long stick with uniform density is allowed to rotate about a point 30.0 cm from its end. The stick is perfectly balanced when a 50.0 g mass is placed on the stick 20.0 cm from the same end. What is the mass of the stick?\n\n(A) 35.7 g\n(B) 33.3 g\n(C) 25.0 g  ← CORRECT\n(D) 17.5 g\n(E) 14.3 g\n\nSolution:\nTo find the mass of the stick, we apply the condition for static rotational equilibrium: the net torque about the pivot point must equal zero ($\\sum \\tau = 0$). Let's establish a coordinate system along the 100.0 cm stick, measuring positions from the reference end (0 cm).\n\n1. **Identify Key Positions:**\n   - **Pivot point ($x_{\\text{pivot}}$):** Given as $30.0\\text{ cm}$.\n   - **Added mass ($x_{\\text{mass}}$):** Located $20.0\\text{ cm}$ from the reference end.\n   - **Center of mass of the stick ($x_{\\text{cm}}$):** Because the stick has a uniform density, its entire mass ($M$) can be treated as a single point force acting exactly at its geometric midpoint, which is $50.0\\text{ cm}$ from either end.\n\n2. **Calculate Lever Arms relative to the Pivot ($30.0\\text{ cm}$):**\n   - **Lever arm for the 50.0 g mass ($r_{\\text{mass}}$):** \n     $$r_{\\text{mass}} = 30.0\\text{ cm} - 20.0\\text{ cm} = 10.0\\text{ cm}$$\n     *(This mass is to the left of the pivot, creating a counter-clockwise torque)*\n   - **Lever arm for the stick's mass ($r_{\\text{stick}}$):** \n     $$r_{\\text{stick}} = 50.0\\text{ cm} - 30.0\\text{ cm} = 20.0\\text{ cm}$$\n     *(The center of mass is to the right of the pivot, creating a clockwise torque)*\n\n3. **Set Up the Torque Balance Equation:**\n   For the stick to be perfectly balanced, the magnitude of the counter-clockwise torque must equal the magnitude of the clockwise torque:\n   $$\\tau_{\\text{counter-clockwise}} = \\tau_{\\text{clockwise}}$$\n   $$m \\cdot g \\cdot r_{\\text{mass}} = M \\cdot g \\cdot r_{\\text{stick}}$$\n\n   We can cancel the acceleration due to gravity ($g$) from both sides:\n   $$m \\cdot r_{\\text{mass}} = M \\cdot r_{\\text{stick}}$$\n\n4. **Solve for the Mass of the Stick ($M$):**\n   Substituting the known values ($m = 50.0\\text{ g}$, $r_{\\text{mass}} = 10.0\\text{ cm}$, and $r_{\\text{stick}} = 20.0\\text{ cm}$):\n   $$(50.0\\text{ g})(10.0\\text{ cm}) = M(20.0\\text{ cm})$$\n   $$500 = 20.0 \\cdot M$$\n   $$M = \\frac{500}{20.0} = 25.0\\text{ g}$$\n\nTherefore, the correct choice is (C).";
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

const TOPIC_NAME = "F=ma";
const SUBTOPIC_NAME = "Static and Mechanical Equilibrium";

function buildQuizPrompt({
    questionCount,
    overrideText,
    subtopicName,
    difficultyLevel,
}: {
    questionCount: number;
    overrideText: string;
    subtopicName: string;
    difficultyLevel: string;
}) {
    return `You are an expert physics professor and competition problem writer generating a diagnostic quiz on: "${subtopicName}".

Target Difficulty Level: ${difficultyLevel}

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
}

export default function StaticsAndEquilibriumPage() {
    const {
        overrideText,
        setOverrideText,
        questionCount,
        setQuestionCount,
        quiz,
        parsedQuestions,
        isGenerating,
        isEvaluating,
        isBusy,
        error,
        answers,
        showAnswers,
        finalScore,
        aiFeedback,
        questionExplanations,
        currentFact,
        isNodeAccessible,
        authReady,
        user,
        progressWarning,
        handleGenerateQuiz,
        handleSubmitAnswers,
        handleAnswerChange,
        normalizeAnswer,
    } = useQuizDiagnostics({
        nodeId: NODE_ID,
        progressCollection: "F=ma",
        unlocksMap: UNLOCKS_MAP,
        prerequisitesMap: PREREQUISITES_MAP,
        topicName: TOPIC_NAME,
        subtopicName: SUBTOPIC_NAME,
        difficultyLevel: DIFFICULTY_LEVEL,
        physicsFacts: PHYSICS_FACTS,
        buildPrompt: buildQuizPrompt,
    });

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
                                <p className={styles.terminalSubtitle}>Static and Mechanical Equilibrium</p>
                                <div className={styles.terminalStat}>
                                    <span className={styles.terminalStatLabel}>Questions</span>
                                    <select
                                        value={questionCount}
                                        onChange={(e) => !isBusy && setQuestionCount(Number(e.target.value))} disabled={isBusy}
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
                                    onChange={(e) => !isBusy && setOverrideText(e.target.value)} disabled={isBusy}
                                    className={styles.terminalTextarea}
                                    rows={3}
                                    placeholder='> e.g., "Make the questions strictly conceptual with no math calculations required..."'
                                />
                            </div>
                            <div className={styles.terminalFooter}>
                                <button
                                    onClick={handleGenerateQuiz}
                                    disabled={isBusy || !authReady || !user || !isNodeAccessible}
                                    className="tg-btn"
                                    style={{ opacity: isBusy || !authReady || !user || !isNodeAccessible ? 0.5 : 1, cursor: isBusy || !authReady || !user || !isNodeAccessible ? "not-allowed" : "pointer" }}
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
                        <p className={styles.loadingFact}>“{currentFact}”</p>
                    </motion.div>
                )}

                {error && <div className={styles.errorBox}>System Error: {error}</div>}
                {progressWarning && <div className={styles.errorBox}>Progress Warning: {progressWarning}</div>}
                {!authReady && <div className={styles.errorBox}>Initializing authentication...</div>}
                {authReady && !user && <div className={styles.errorBox}>Sign in to generate and submit quizzes.</div>}
                {authReady && user && !isNodeAccessible && <div className={styles.errorBox}>Prerequisites for this node are not yet mastered.</div>}

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
                            <span className={styles.resultsScoreDenom}> / {parsedQuestions.length}</span>
                        </div>
                        <hr className={styles.resultsDivider} />
                        <h3 className={styles.resultsFeedbackTitle}>
  AI Feedback Analysis
</h3>

<div className={styles.resultsFeedbackText}>
  <RenderQuizMath text={aiFeedback || ""} />
</div>
                        {parsedQuestions.length > 0 && (
                            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {parsedQuestions.map((q, idx) => {
                                    const correctAnswer = normalizeAnswer(q.correctAnswer);
                                    const correctOption = getOptionTextByLetter(q, correctAnswer);
                                    const explanation = questionExplanations.find((e) => e.index === idx)?.explanation;

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
                                                Q_0{idx + 1} — Correct: {<RenderQuizMath text={correctOption || ""} />}
                                            </p>
                                            {explanation && (
  <div
    style={{
      color: "#aaa",
      fontSize: "13px",
      margin: "6px 0 0 0",
    }}
  >
    <RenderQuizMath text={explanation} />
  </div>
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
                        {parsedQuestions.length > 0 && (
                            <form onSubmit={(e) => { e.preventDefault(); handleSubmitAnswers(); }}>
                                <div className={styles.questionList}>
                                    {parsedQuestions.map((question, index) => {
                                        const userAnswer = normalizeAnswer(answers[index]?.answer);
                                        const correctAnswer = normalizeAnswer(question.correctAnswer);
                                        const isCorrect = userAnswer === correctAnswer;

                                        return (
                                            <div id={`question-${index}`} key={index}
                                                className={[
                                                    styles.questionCard,
                                                    showAnswers ? (isCorrect ? styles.correct : styles.incorrect) : "",
                                                ].join(" ")}
                                            >
                                                <div className={styles.questionNumber}>Q_0{index + 1}</div>
                                                <h3 className={styles.questionText}>{<RenderQuizMath text={question.text} />}</h3>

                                                <div className={styles.optionsList}>
                                                    {question.options.map((option: string, optIdx: number) => {
                                                        const optionLetter = normalizeAnswer(option);
                                                        const isSelected = userAnswer === optionLetter;
                                                        const isActuallyCorrect = optionLetter === correctAnswer;

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
                                                                    onChange={(e) => !showAnswers && !isBusy && handleAnswerChange(index, e.target.value)}
                                                                    disabled={showAnswers || isBusy}
                                                                    className={styles.optionRadio}
                                                                />
                                                                <span className={styles.optionText}>{<RenderQuizMath text={option} />}</span>
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
                                            disabled={isBusy || !authReady || !user}
                                            className="tg-btn"
                                            style={{ opacity: isBusy || !authReady || !user ? 0.5 : 1 }}
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
