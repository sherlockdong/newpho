"use client";

import Link from "next/link";
import "katex/dist/katex.min.css";
import { useQuizDiagnostics } from "../../../../lib/useQuizDiagnostics";
import { getOptionTextByLetter } from "../../../../lib/quizUtils";
import { RenderQuizMath } from "../../../../lib/renderQuizMath";
import { motion } from "framer-motion";
import styles from "../../usa.module.css";

const PAST_PROBLEMS = [
    {
        id: "USA_15_P01",
        title: "USAPhO 2017 Problem A3",
        desc: "The problem focuses on computing magnetic fields for a long current-carrying wire via Ampere's law, requiring students to set up and integrate the equations of motion for a charged particle launched perpendicularly to analyze its trajectory boundaries.",
        url: "https://www.aapt.org/physicsteam/2017/upload/2017-USAPhO-Exam.pdf",
        type: "Problem"
    },
]
const PHYSICS_FACTS = [
    "The Navier–Stokes equations describe the motion of fluid substances.",
    "Bernoulli’s principle relates pressure, speed, and height in ideal flow.",
    String.raw`The Reynolds number, $Re=\frac{\rho uL}{\mu}$, predicts whether flow tends to be laminar or turbulent.`,
    String.raw`Boundary-layer separation can occur under an adverse pressure gradient, $\frac{dp}{dx}>0$.`,
];


const NODE_ID = 'USA-15';
const DIFFICULTY_LEVEL = "USAPhO Electricity and magnetism physics competition";
const SAMPLE_PROBLEMS = String.raw`Question A3 (from USAPhO 2017)
A ship can be thought of as a symmetric arrangement of soft iron. In the presence of an external
magnetic field, the soft iron will become magnetized, creating a second, weaker magnetic field. We
want to examine the effect of the ship’s field on the ship’s compass, which will be located in the
middle of the ship.
Let the strength of the Earth’s magnetic field near the ship be B_e, and the orientation of the
field be horizontal, pointing directly toward true north.
The Earth’s magnetic field B_e will magnetize the ship, which will then create a second magnetic
field B_s in the vicinity of the ship’s compass given by
B_s = B_e * (-K_b * cos(θ) b_hat + K_s * sin(θ) s_hat)
where K_b and K_s are positive constants, θ is the angle between the heading of the ship and magnetic
north, measured clockwise, and b_hat and s_hat are unit vectors pointing in the forward direction of the ship
(bow) and directly right of the forward direction (starboard), respectively.
Because of the ship’s magnetic field, the ship’s compass will no longer necessarily point North.
a. Derive an expression for the deviation of the compass, δθ, from north as a function of K_b,
K_s, and θ.
b. Assuming that K_b and K_s are both much smaller than one, at what heading(s) θ will the
deviation δθ be largest?
A pair of iron balls placed in the same horizontal plane as the compass but a distance d away
can be used to help correct for the error caused by the induced magnetism of the ship.
(A binnacle protects the ship’s compass in the center, with two soft iron spheres to help correct for errors in the
compass heading. The use of the spheres was suggested by Lord Kelvin.)
Just like the ship, the iron balls will become magnetic because of the Earth’s field B_e. As
spheres, the balls will individually act like dipoles. A dipole can be thought of as the field produced
by two magnetic monopoles of strength ±m at two different points.
The magnetic field of a single pole is
B = ±m * r_hat / r^2
where the positive sign is for a north pole and the negative for a south pole. The dipole magnetic
field is the sum of the two fields: a north pole at y = +a/2 and a south pole at y = -a/2, where
the y-axis is horizontal and pointing north. The value a is a small distance much smaller than the radius of
the iron balls; in general, a = K_i * B_e where K_i is a constant that depends on the size of the iron
sphere.
c. Derive an expression for the magnetic field B_i from the iron a distance d >> a from the center
of the ball. Note that there will be a component directed radially away from the ball and a
component directed tangent to a circle of radius d around the ball, so using polar coordinates
is recommended.
d. If placed directly to the right and left of the ship's compass, the iron balls can be located at a
distance d to cancel out the error in the magnetic heading for any angle(s) where δθ is largest.
Assuming that this is done, find the resulting expression for the compass deviation at all headings.`
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


const TOPIC_NAME = "USAPhO";
const SUBTOPIC_NAME = "Magnetic Fields, Biot-Savart Law, and Ampere's Law";

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
    return String.raw`You are an expert physics professor and competition problem writer generating a diagnostic quiz on: "${subtopicName}".

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

export default function MagneticFieldPage() {
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
        progressCollection: "USAPhO",
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

                <Link href="/usapho/eandm" className={styles.breadcrumb}>
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
                    Return to USAPhO E&M Directory
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
                                <p className={styles.terminalSubtitle}>Magnetic Field</p>
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
                                <button type="button"

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
                        <div className={styles.loadingFact}>
                            “<RenderQuizMath text={currentFact} />”
                        </div>

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
                                            <div
                                                style={{
                                                    color: "#4f8ef7",
                                                    fontFamily: "monospace",
                                                    fontSize: "13px",
                                                }}
                                            >
                                                Q_{String(idx + 1).padStart(2, "0")} — Correct:{" "}
                                                <RenderQuizMath text={correctOption || ""} />
                                            </div>

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
                                                <div className={styles.questionNumber}>Q_{String(index + 1).padStart(2, "0")}</div>
                                                <div className={styles.questionText}>
                                                    <RenderQuizMath text={question.text} />
                                                </div>


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
                                            disabled={
                                                isBusy ||
                                                !authReady ||
                                                !user ||
                                                !isNodeAccessible
                                            }

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
