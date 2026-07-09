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
  "The Navier-Stokes equations, which govern the motion of fluid substances, are a statement of Newton's second law applied to continuous media under the assumption of a Newtonian fluid.",
  "In a steady, incompressible, and inviscid flow, Bernoulli's principle states that an increase in the speed of the fluid occurs simultaneously with a decrease in static pressure or a decrease in the fluid's potential energy.",
  "The Reynolds number (Re = \frac{\rho u L}{\mu}) is a dimensionless quantity that predicts fluid flow patterns, where low values indicate laminar flow dominated by viscous forces and high values indicate turbulent flow dominated by inertial forces.",
  "Boundary layer separation occurs when the pressure gradient is adverse (\frac{dp}{dx} > 0), causing the velocity gradient at the wall to drop to zero and forcing the bulk fluid to detach from the solid surface."
];

const NODE_ID = 'PB-01';
const DIFFICULTY_LEVEL = "Physics Bowl physics competition";
const SAMPLE_PROBLEMS = "34. A sample of an ideal gas is being held at a constant pressure. What happens to the internal energy of the gas if 10 J of heat energy are transferred to the gas?\n\n(A) Increases by 10 J\n(B) Increases by <10 J  ← CORRECT\n(C) Increases by >10 J\n(D) Remains unchanged\n(E) More information is needed\n\nSolution:\nTo determine the change in internal energy, we apply the First Law of Thermodynamics:\n$$\\Delta U = Q - W$$\n\nWhere:\n- $\\Delta U$ is the change in the internal energy of the gas.\n- $Q$ is the heat energy added to the system ($Q = +10\\text{ J}$).\n- $W$ is the work done *by* the gas on its surroundings during expansion.\n\nBecause the gas is kept at a constant pressure while heat is added, the temperature increases, causing the gas to expand. The work done by an expanding gas at constant pressure is given by:\n$$W = P\\Delta V > 0$$\n\nSince the gas expands, it does positive work ($W > 0$) on its surroundings, meaning some of the added heat energy is spent on expanding the container rather than raising the temperature:\n$$\\Delta U = 10\\text{ J} - W \\implies \\Delta U < 10\\text{ J}$$\n\nTherefore, the internal energy increases by an amount less than 10 J.\n\nTherefore, the correct choice is (B).";
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

const TOPIC_NAME = "Physics Bowl";
const SUBTOPIC_NAME = "Thermodynamics and Kinetic Theory";

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

export default function FluidMechanicsPage() {
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
    progressCollection: "Physics Bowl",
    unlocksMap: UNLOCKS_MAP,
    prerequisitesMap: PREREQUISITES_MAP,
    topicName: "Physics Bowl",
    subtopicName: "Thermodynamics and Kinetic Theory",
    difficultyLevel: "Physics Bowl physics competition",
    physicsFacts: PHYSICS_FACTS,
    buildPrompt: buildQuizPrompt,
  });

  return (
    <main className={`page-wrapper ${styles.pageWrapper}`}>
      <div className={styles.inner}>

        <Link href="/fmapb/pb" className={styles.breadcrumb}>
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
          Return to Physics Bowl Directory
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
                <p className={styles.terminalSubtitle}>Thermodynamics Kinetic Energy</p>
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
                  placeholder='> e.g., "Make the parsedQuestions strictly conceptual with no math calculations required..."'
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
            <p className={styles.loadingFact}>"{currentFact}"</p>
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
            <h3 className={styles.resultsFeedbackTitle}>AI Feedback Analysis</h3>
            <p className={styles.resultsFeedbackText}>{aiFeedback}</p>
            {parsedQuestions.length > 0 && (
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {parsedQuestions.map((q, idx) => {
                  const correctAnswer = normalizeAnswer(q.correctAnswer);
                  const correctOption = getOptionTextByLetter(q, correctAnswer);
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
                        Q_0{idx + 1} — Correct: {<RenderQuizMath text={correctOption || ""} />}
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
