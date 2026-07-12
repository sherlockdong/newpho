"use client";

import Link from "next/link";
import "katex/dist/katex.min.css";
import { useQuizDiagnostics } from "../../../../lib/useQuizDiagnostics";
import { getOptionTextByLetter } from "../../../../lib/quizUtils";
import { RenderQuizMath } from "../../../../lib/renderQuizMath";
import { motion } from "framer-motion";
import styles from "../../hsdirectory.module.css";

const STUDY_RESOURCES = [
  {
    id: "REF_01",
    title: "The Physics Classroom: 1-D Kinematics",
    desc: "A highly readable conceptual breakdown of all type of linear motions.",
    url: "https://www.physicsclassroom.com/Physics-Tutorial/1-D-Kinematics",
    type: "Articles",
  },
  {
    id: "REF_02",
    title: "Khan Academy: Unit One",
    desc: "Step-by-step video lecture explaining balanced forces and reference frames.",
    url: "https://www.khanacademy.org/science/highschool-physics/x6679aa2c65c01e53:motion-and-forces/x6679aa2c65c01e53:describing-motion/v/position_velocity_speed",
    type: "Video",
  },
  {
    id: "REF_03",
    title: "Flipping Physics: Displacement, Speed and Velocity",
    desc: "Complete, detailed, professional lecture notes",
    url: "https://www.flippingphysics.com/uploads/2/1/1/0/21103672/02-01_lecture_notes_compilation_-_displacement_speed_and_velocity.pdf",
    type: "Lecture Note",
  },
  {
    id: "REF_04",
    title: "Flipping Physics: One Dimensional Motion Demos",
    desc: "Real-world visual demonstrations of objects resisting changes in motion.",
    url: "https://www.youtube.com/playlist?list=PLPyapQSxH6mbXWoeU5ZqSwQiJmn6NqRGN",
    type: "Video",
  },
  {
    id: "REF_05",
    title: "Organic Chemistry Tutor",
    desc: "Real-world visual demonstrations of objects resisting changes in motion.",
    url: "https://www.youtube.com/watch?v=RDRDoBqYT7s&pp=ygUNbGluZWFyIG1vdGlvbg%3D%3D",
    type: "Video",
  },
];
const DIFFICULTY_LEVEL = "high school physics"
const PHYSICS_FACTS = [
  "If the net force on an object is zero, its velocity must be constant.",
  "Inertia is not a force; it is a property of matter directly related to its mass.",
  "An object moving at a constant 100 m/s in a straight line has a net force of zero acting upon it.",
  "You feel pushed back in an accelerating car because your body's inertia wants to stay at rest.",
];

// 2. ADDED CONSTANTS FOR PROGRESS TRACKING
// Map each quiz page to its node ID
const NODE_ID = 'MCH-02'; // Correct ID for linear-motion

// Which nodes does mastering this one unlock?
const UNLOCKS_MAP: Record<string, string[]> = {
  'MCH-01': ['MCH-03', 'MCH-04'],
  'MCH-02': ['MCH-03', 'MCH-07'],
  'MCH-03': ['MCH-05', 'MCH-06', 'MCH-08'],
  'MCH-04': ['MCH-05'],
  'MCH-05': ['MCH-08'],
  'MCH-06': ['MCH-09'],
  'MCH-07': ['MCH-09'],
};

// Prerequisites that must ALL be mastered before a node unlocks
const PREREQUISITES_MAP: Record<string, string[]> = {
  'MCH-03': ['MCH-01', 'MCH-02'],
  'MCH-04': ['MCH-01'],
  'MCH-05': ['MCH-03', 'MCH-04'],
  'MCH-06': ['MCH-03'],
  'MCH-07': ['MCH-02'],
  'MCH-08': ['MCH-03', 'MCH-05'],
  'MCH-09': ['MCH-06', 'MCH-07'],
};


const TOPIC_NAME = "Mechanics";
const SUBTOPIC_NAME = "Linear Motion";

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
  return String.raw`
You are an experienced high-school physics teacher creating a diagnostic multiple-choice quiz.


QUIZ SETTINGS:
- Topic: ${subtopicName}
- Difficulty: ${difficultyLevel}
- Number of questions: exactly ${questionCount}
${overrideText ? `- Additional instructions: ${overrideText}` : ""}


QUESTION REQUIREMENTS:
1. Generate exactly ${questionCount} questions about ${subtopicName}.
2. Test genuine physics understanding, not simple vocabulary memorization.
3. Include a balanced mix of:
   - conceptual reasoning;
   - interpretation of physical situations;
   - calculations appropriate for high-school physics;
   - common misconceptions students may have.
4. Each question must have exactly four answer choices labeled a), b), c), and d).
5. Each question must have exactly one correct answer.
6. Make incorrect options believable and based on realistic student mistakes.
7. Keep all calculations solvable using the information provided.
8. Do not require calculus unless the additional instructions explicitly request it.
9. Use standard SI units unless another unit system is necessary.
10. Use LaTeX for variables, equations, and scientific notation:
    - Inline mathematics: $...$
    - Display mathematics: $$...$$
11. Do not repeat questions or create questions that test the same idea in nearly identical ways.
12. Do not reveal the correct answer inside the question or answer choices.


OUTPUT RULES:
- Output only the quiz.
- Do not include an introduction, conclusion, explanations, hints, or grading commentary.
- Follow the exact format below for every question.
- Write the correct answer as one lowercase letter: a, b, c, or d.


EXACT FORMAT:


### Question 1
[Question text]
a) [First option]
b) [Second option]
c) [Third option]
d) [Fourth option]
**Correct Answer:** [lowercase letter]
---


Repeat this structure until exactly ${questionCount} complete questions have been generated.
`;
}


export default function LinearMotionPage() {
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
    progressCollection: "mechanics",
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

        {/* Breadcrumb */}
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

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.badge}>SYS_// MECH_02</div>
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
                <h3 className={styles.terminalId}>MECH_02</h3>
                <p className={styles.terminalSubtitle}>Linear Motion</p>
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

            {/* Right panel */}
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

        {/* Loading */}
        {(isGenerating || isEvaluating) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.loadingBox}>
            <div className={styles.spinner} />
            <p className={styles.loadingLabel}>
              {isGenerating ? "Generating GPT 5.4 Parameters..." : "AI Evaluating Telemetry..."}
            </p>
            <p className={styles.loadingFact}>“{currentFact}”</p>
          </motion.div>
        )}

        {/* Error */}
        {error && <div className={styles.errorBox}>System Error: {error}</div>}
        {progressWarning && <div className={styles.errorBox}>Progress Warning: {progressWarning}</div>}
        {!authReady && <div className={styles.errorBox}>Initializing authentication...</div>}
        {authReady && !user && <div className={styles.errorBox}>Sign in to generate and submit quizzes.</div>}
        {authReady && user && !isNodeAccessible && <div className={styles.errorBox}>Prerequisites for this node are not yet mastered.</div>}

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
              <span className={styles.resultsScoreDenom}> / {parsedQuestions.length}</span>
            </div>
            <hr className={styles.resultsDivider} />
            <h3 className={styles.resultsFeedbackTitle}>AI Feedback Analysis</h3>
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

        {/* Quiz */}
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
    </main >
  );
}
