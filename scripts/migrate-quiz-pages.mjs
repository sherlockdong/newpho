#!/usr/bin/env node

import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

const QUIZ_PAGES = [
  "src/app/highschoolquiz/mechanics/gravity/page.tsx",
  "src/app/highschoolquiz/mechanics/linear-motion/page.tsx",
  "src/app/highschoolquiz/mechanics/momentum/page.tsx",
  "src/app/highschoolquiz/mechanics/newtons-first-law/page.tsx",
  "src/app/highschoolquiz/mechanics/newtons-second-law/page.tsx",
  "src/app/highschoolquiz/mechanics/newtons-third-law/page.tsx",
  "src/app/highschoolquiz/mechanics/projectile-and-satellite-motion/page.tsx",
  "src/app/highschoolquiz/mechanics/rotational-motion/page.tsx",
  "src/app/highschoolquiz/electricity/currentcircuits/page.tsx",
  "src/app/highschoolquiz/electricity/electrostatics/page.tsx",
  "src/app/highschoolquiz/electricity/induction/page.tsx",
  "src/app/highschoolquiz/electricity/magnetism/page.tsx",
  "src/app/fmapb/fma/advanced-collisions/page.tsx",
  "src/app/fmapb/fma/advanced-gravity/page.tsx",
  "src/app/fmapb/fma/advanced-rigid-bodies/page.tsx",
  "src/app/fmapb/fma/dimensional-analysis-and-error/page.tsx",
  "src/app/fmapb/fma/fluid-mechanics/page.tsx",
  "src/app/fmapb/fma/oscillatory-motion/page.tsx",
  "src/app/fmapb/fma/potential-energy-stability/page.tsx",
  "src/app/fmapb/fma/resistive-forces-and-drag/page.tsx",
  "src/app/fmapb/fma/statics-and-equilibrium/page.tsx",
  "src/app/fmapb/fma/systems-of-masses/page.tsx",
  "src/app/fmapb/pb/electrostatics-and-circuits/page.tsx",
  "src/app/fmapb/pb/history-and-trivia/page.tsx",
  "src/app/fmapb/pb/magnetism-and-induction/page.tsx",
  "src/app/fmapb/pb/modern-and-quantum-physics/page.tsx",
  "src/app/fmapb/pb/thermodynamics-kinetic-theory/page.tsx",
  "src/app/fmapb/pb/waves-and-optics/page.tsx",
  "src/app/usapho/mechanics/3d-rigid-bodies/page.tsx",
  "src/app/usapho/mechanics/advanced-celestial-mechanics/page.tsx",
  "src/app/usapho/mechanics/advanced-fluid-mechanics/page.tsx",
  "src/app/usapho/mechanics/advanced-statics/page.tsx",
  "src/app/usapho/mechanics/complex-oscillations/page.tsx",
  "src/app/usapho/mechanics/differential-drag/page.tsx",
  "src/app/usapho/mechanics/rotational-collisions/page.tsx",
  "src/app/usapho/mechanics/variable-mass-systems/page.tsx",
];

const PROGRESS_COLLECTIONS = {
  highschoolquiz: { mechanics: "mechanics", electricity: "electricity" },
  fmapb: { fma: "F=ma", pb: "Physics Bowl" },
  usapho: { mechanics: "USAPhO" },
};

function readHeadFile(relativePath) {
  return execSync(`git show HEAD:${relativePath}`, { cwd: ROOT, encoding: "utf8" });
}

function getProgressCollection(filePath) {
  const [, , section, topic] = filePath.split("/");
  return PROGRESS_COLLECTIONS[section]?.[topic] ?? "mechanics";
}

function getDifficultyLevel(content, filePath) {
  const match = content.match(/const DIFFICULTY_LEVEL = ("[^"]+"|'[^']+');/);
  if (match) return match[1];
  return '"High School Physics"';
}

function extractPrompt(content) {
  const match = content.match(/const prompt = `([\s\S]*?)`;\s*\n\s*const quizResponse/);
  if (!match) throw new Error("Could not extract prompt");
  return match[1]
    .replace(/\$\{SUBTOPIC_NAME\}/g, "${subtopicName}")
    .replace(/\$\{DIFFICULTY_LEVEL\}/g, "${difficultyLevel}");
}

function extractTopicNames(content) {
  const topic = content.match(/const TOPIC_NAME = ("[^"]+"|'[^']+');/);
  const subtopic = content.match(/const SUBTOPIC_NAME = ("[^"]+"|'[^']+');/);
  return { topicName: topic?.[1], subtopicName: subtopic?.[1] };
}

function getLibPrefix(content) {
  return content.includes('from "../../../../lib/') ? "../../../../lib/" : "../../../lib/";
}

function patchImports(content, libPrefix) {
  let result = content
    .replace(/import \{ useState, useEffect \} from "react";\n/, "")
    .replace(/import \{\s*getAuth,\s*onAuthStateChanged,\s*type User,\s*\} from "firebase\/auth";\n\n?/, "")
    .replace(/import \{ app \} from ".*?firebase";\n/, "")
    .replace(/import \{\s*getFirestore,\s*collection,\s*addDoc,\s*Timestamp,\s*doc,\s*getDoc,\s*setDoc\s*\} from "firebase\/firestore";\n\n?/, "")
    .replace(/import \{ InlineMath \} from "react-katex";\n/, "")
    .replace(/import \{ parseQuizQuestions \} from ".*?quizParser";\n/, "")
    .replace(/const auth = getAuth\(app\);\n\nasync function authenticatedFetch[\s\S]*?\n\}\n\n/, "")
    .replace(/const auth = getAuth\(app\);\n/, "");

  const hookImports = `import { useQuizDiagnostics } from "${libPrefix}useQuizDiagnostics";
import { getOptionTextByLetter } from "${libPrefix}quizUtils";
import { RenderQuizMath } from "${libPrefix}renderQuizMath";
`;

  result = result.replace(
    /import "katex\/dist\/katex.min.css";\n/,
    `import "katex/dist/katex.min.css";\n${hookImports}`,
  );

  return result;
}

function buildPromptFn(promptBody) {
  return `
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
  return \`${promptBody}\`;
}
`;
}

function buildHookBlock({ progressCollection, difficultyLevel, topicName, subtopicName, indent }) {
  const pad = indent;
  return `${pad}const {
${pad}  overrideText,
${pad}  setOverrideText,
${pad}  questionCount,
${pad}  setQuestionCount,
${pad}  quiz,
${pad}  parsedQuestions,
${pad}  isGenerating,
${pad}  isEvaluating,
${pad}  isBusy,
${pad}  error,
${pad}  answers,
${pad}  showAnswers,
${pad}  finalScore,
${pad}  aiFeedback,
${pad}  questionExplanations,
${pad}  currentFact,
${pad}  isNodeAccessible,
${pad}  authReady,
${pad}  user,
${pad}  progressWarning,
${pad}  handleGenerateQuiz,
${pad}  handleSubmitAnswers,
${pad}  handleAnswerChange,
${pad}  normalizeAnswer,
${pad}} = useQuizDiagnostics({
${pad}  nodeId: NODE_ID,
${pad}  progressCollection: "${progressCollection}",
${pad}  unlocksMap: UNLOCKS_MAP,
${pad}  prerequisitesMap: PREREQUISITES_MAP,
${pad}  topicName: ${topicName},
${pad}  subtopicName: ${subtopicName},
${pad}  difficultyLevel: ${difficultyLevel},
${pad}  physicsFacts: PHYSICS_FACTS,
${pad}  buildPrompt: buildQuizPrompt,
${pad}});
`;
}

function patchJsx(content) {
  return content
    .replace(/\bquestions\b/g, (match, offset, full) => {
      const before = full.slice(Math.max(0, offset - 12), offset);
      if (before.includes("parsed") || before.includes("total")) return match;
      return "parsedQuestions";
    })
    .replace(/generated parsedQuestions/g, "generated questions")
    .replace(/renderMathText\(([^)]+)\)/g, "<RenderQuizMath text={$1} />")
    .replace(
      /const userAnswer = answers\[index\]\?\.answer\?\.toLowerCase\(\);\s*\n\s*const isCorrect = userAnswer === question\.correctAnswer;/g,
      "const userAnswer = normalizeAnswer(answers[index]?.answer);\n                    const correctAnswer = normalizeAnswer(question.correctAnswer);\n                    const isCorrect = userAnswer === correctAnswer;",
    )
    .replace(
      /const userAnswer = normalizeAnswer\(answers\[index\]\?\.answer\);\s*\n\s*const correctAnswer = normalizeAnswer\(question\.correctAnswer\);\s*\n\s*const isCorrect = userAnswer === correctAnswer;/g,
      "const userAnswer = normalizeAnswer(answers[index]?.answer);\n                    const correctAnswer = normalizeAnswer(question.correctAnswer);\n                    const isCorrect = userAnswer === correctAnswer;",
    )
    .replace(/const optionLetter = option\.charAt\(0\)\.toLowerCase\(\);/g, "const optionLetter = normalizeAnswer(option);")
    .replace(/const isActuallyCorrect = optionLetter === question\.correctAnswer;/g, "const isActuallyCorrect = optionLetter === correctAnswer;")
    .replace(
      /const correctOption = q\.options\.find\(\s*\(opt: string\) => opt\.charAt\(0\)\.toLowerCase\(\) === q\.correctAnswer\s*\);/g,
      "const correctAnswer = normalizeAnswer(q.correctAnswer);\n                  const correctOption = getOptionTextByLetter(q, correctAnswer);",
    )
    .replace(/<div\s+key=\{index\}/g, '<div id={`question-${index}`} key={index}')
    .replace(/disabled=\{showAnswers\}/g, "disabled={showAnswers || isBusy}")
    .replace(/onChange=\{\(e\) => !showAnswers && handleAnswerChange/g, "onChange={(e) => !showAnswers && !isBusy && handleAnswerChange")
    .replace(/disabled=\{isGenerating\}/g, "disabled={isBusy || !authReady || !user || !isNodeAccessible}")
    .replace(/opacity: isGenerating \? 0\.5 : 1, cursor: isGenerating \? "not-allowed" : "pointer"/g, 'opacity: isBusy || !authReady || !user || !isNodeAccessible ? 0.5 : 1, cursor: isBusy || !authReady || !user || !isNodeAccessible ? "not-allowed" : "pointer"')
    .replace(/disabled=\{isEvaluating\}/g, "disabled={isBusy || !authReady || !user}")
    .replace(/opacity: isEvaluating \? 0\.5 : 1/g, "opacity: isBusy || !authReady || !user ? 0.5 : 1")
    .replace(/onChange=\{\(e\) => setQuestionCount\(Number\(e\.target\.value\)\)\}/g, "onChange={(e) => !isBusy && setQuestionCount(Number(e.target.value))} disabled={isBusy}")
    .replace(/onChange=\{\(e\) => setOverrideText\(e\.target\.value\)\}/g, "onChange={(e) => !isBusy && setOverrideText(e.target.value)} disabled={isBusy}")
    .replace(
      /\{error && <div className=\{styles\.errorBox\}>System Error: \{error\}<\/div>\}/,
      `{error && <div className={styles.errorBox}>System Error: {error}</div>}
        {progressWarning && <div className={styles.errorBox}>Progress Warning: {progressWarning}</div>}
        {!authReady && <div className={styles.errorBox}>Initializing authentication...</div>}
        {authReady && !user && <div className={styles.errorBox}>Sign in to generate and submit quizzes.</div>}
        {authReady && user && !isNodeAccessible && <div className={styles.errorBox}>Prerequisites for this node are not yet mastered.</div>}`,
    );
}

function migrateFile(relativePath) {
  const original = readHeadFile(relativePath);
  const promptBody = extractPrompt(original);
  const { topicName, subtopicName } = extractTopicNames(original);
  const progressCollection = getProgressCollection(relativePath);
  const difficultyLevel = getDifficultyLevel(original, relativePath);
  const libPrefix = getLibPrefix(original);

  if (!topicName || !subtopicName) throw new Error("Missing topic names");

  const exportMatch = original.match(/export default function \w+\(\) \{/);
  if (!exportMatch || exportMatch.index === undefined) throw new Error("No export default");

  const tail = original.slice(exportMatch.index);
  const returnMatch = tail.match(/\n( +)return \(\n\1\1<main/);
  if (!returnMatch || returnMatch.index === undefined) {
    throw new Error("No main return");
  }

  const indent = returnMatch[1];
  const header = patchImports(original.slice(0, exportMatch.index), libPrefix);
  const jsx = tail.slice(returnMatch.index);
  const functionName = exportMatch[0].match(/function (\w+)/)?.[1] ?? "QuizPage";

  const output =
    header +
    `\nconst TOPIC_NAME = ${topicName};\nconst SUBTOPIC_NAME = ${subtopicName};\n` +
    buildPromptFn(promptBody) +
    `\nexport default function ${functionName}() {\n` +
    buildHookBlock({ progressCollection, difficultyLevel, topicName, subtopicName, indent }) +
    jsx;

  writeFileSync(path.join(ROOT, relativePath), patchJsx(output), "utf8");
  console.log(`Migrated ${relativePath}`);
}

for (const file of QUIZ_PAGES) {
  try {
    migrateFile(file);
  } catch (error) {
    console.error(`Failed ${file}:`, error.message);
    process.exitCode = 1;
  }
}
