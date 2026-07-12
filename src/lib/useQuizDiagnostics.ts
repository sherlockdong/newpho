"use client";

import { useEffect, useRef, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  getDoc,
  getFirestore,
} from "firebase/firestore";

import { app } from "../firebase";
import type {
  AnswerLetter,
  AnswerState,
  EvaluationAnalysis,
  QuizQuestion,
} from "./quizTypes";
import {
  buildGradedResults,
  checkNodeAccessible,
  findUnansweredQuestions,
  normalizeAnswer,
  parseAndValidateQuiz,
  parseApiError,
} from "./quizUtils";

export interface QuizDiagnosticsConfig {
  nodeId: string;
  progressCollection: string;
  unlocksMap: Record<string, string[]>;
  prerequisitesMap: Record<string, string[]>;
  topicName: string;
  subtopicName: string;
  difficultyLevel: string;
  physicsFacts: string[];
  buildPrompt: (params: {
    questionCount: number;
    overrideText: string;
    subtopicName: string;
    difficultyLevel: string;
  }) => string;
}

export function createAuthenticatedFetch(auth = getAuth(app)) {
  return async function authenticatedFetch(
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
  };
}

export function useQuizDiagnostics(config: QuizDiagnosticsConfig) {
  const auth = getAuth(app);
  const authenticatedFetch = createAuthenticatedFetch(auth);
  const operationIdRef = useRef(0);

  const [overrideText, setOverrideText] = useState("");
  const [questionCount, setQuestionCount] = useState(3);
  const [quiz, setQuiz] = useState<string | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<QuizQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [startTime, setStartTime] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isNodeAccessible, setIsNodeAccessible] = useState(true);
  const [currentFact, setCurrentFact] = useState("");
  const [showAnswers, setShowAnswers] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [questionExplanations, setQuestionExplanations] = useState<
    EvaluationAnalysis["questionExplanations"]
  >([]);
  const [progressWarning, setProgressWarning] = useState<string | null>(null);

  const isBusy = isGenerating || isEvaluating;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });

    return unsubscribe;
  }, [auth]);

  useEffect(() => {
    if (!authReady || !user) {
      return;
    }

    async function loadNodeAccess() {
      const db = getFirestore(app);
      const progressRef = doc(
        db,
        "users",
        user.uid,
        "progress",
        config.progressCollection,
      );
      const snapshot = await getDoc(progressRef);
      const current = (
        snapshot.exists() ? snapshot.data() : {}
      ) as Record<string, string>;

      setIsNodeAccessible(
        checkNodeAccessible(
          config.nodeId,
          config.prerequisitesMap,
          current,
        ),
      );
    }

    void loadNodeAccess();
  }, [authReady, user, config.nodeId, config.prerequisitesMap, config.progressCollection]);

  useEffect(() => {
    if (!isBusy || config.physicsFacts.length === 0) {
      return;
    }
  
    const interval = setInterval(() => {
      const fact =
        config.physicsFacts[
          Math.floor(Math.random() * config.physicsFacts.length)
        ];
  
      setCurrentFact(fact);
    }, 4000);
  
    return () => clearInterval(interval);
  }, [config.physicsFacts, isBusy]);

  async function handleGenerateQuiz() {
    if (!authReady || !user) {
      setError("Please sign in to generate a quiz.");
      return;
    }

    if (!isNodeAccessible) {
      setError("Complete prerequisite nodes before attempting this quiz.");
      return;
    }

    const operationId = ++operationIdRef.current;

    setIsGenerating(true);
    setError(null);
    setProgressWarning(null);
    setQuiz(null);
    setParsedQuestions([]);
    setAnswers({});
    setStartTime(null);
    setShowAnswers(false);
    setFinalScore(null);
    setAiFeedback(null);
    setQuestionExplanations([]);

    try {
      const prompt = config.buildPrompt({
        questionCount,
        overrideText,
        subtopicName: config.subtopicName,
        difficultyLevel: config.difficultyLevel,
      });

      const quizResponse = await authenticatedFetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({
          prompt,
          difficultyLevel: config.difficultyLevel,
        }),
      });

      if (operationId !== operationIdRef.current) {
        return;
      }

      if (!quizResponse.ok) {
        const errorText = await quizResponse.text();
        let message = errorText;

        try {
          const parsed = JSON.parse(errorText) as { error?: string };
          message = parsed.error || errorText;
        } catch {
          // Keep raw text when response is not JSON.
        }

        throw new Error(message || "Quiz generation failed.");
      }

      const data = await quizResponse.json();
      const quizContent = data.content || "";
      const validatedQuestions = parseAndValidateQuiz(
        quizContent,
        questionCount,
      );

      if (operationId !== operationIdRef.current) {
        return;
      }

      setQuiz(quizContent);
      setParsedQuestions(validatedQuestions);
      setStartTime(Date.now());
      setTimeout(
        () =>
          document
            .getElementById("quiz-anchor")
            ?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch (err: unknown) {
      if (operationId !== operationIdRef.current) {
        return;
      }

      setError(
        err instanceof Error ? err.message : "Quiz generation failed.",
      );
    } finally {
      if (operationId === operationIdRef.current) {
        setIsGenerating(false);
      }
    }
  }

  function handleAnswerChange(index: number, value: string) {
    const normalized = normalizeAnswer(value);
    setAnswers((prev) => ({
      ...prev,
      [index]: { answer: normalized },
    }));
  }

  async function updateProgress(correctCount: number, totalQuestions: number) {
    if (!user?.uid) {
      return;
    }

    const response = await authenticatedFetch("/api/progress", {
      method: "POST",
      body: JSON.stringify({
        progressCollection: config.progressCollection,
        nodeId: config.nodeId,
        correctCount,
        totalQuestions,
        unlocksMap: config.unlocksMap,
        prerequisitesMap: config.prerequisitesMap,
      }),
    });

    await parseApiError(response);
  }

  async function handleSubmitAnswers() {
    if (!authReady || !user) {
      setError("Please sign in to submit your answers.");
      return;
    }

    const unanswered = findUnansweredQuestions(
      parsedQuestions.length,
      answers,
    );

    if (unanswered.length > 0) {
      setError(
        `${unanswered.length} question(s) remain unanswered. Please answer all questions before submitting.`,
      );
      document
        .getElementById(`question-${unanswered[0]}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const operationId = ++operationIdRef.current;

    setIsEvaluating(true);
    setError(null);
    setProgressWarning(null);

    try {
      const timeTakenSeconds = startTime
        ? Math.round((Date.now() - startTime) / 1000)
        : 0;

      const { gradedResults, correctCount } = buildGradedResults(
        parsedQuestions,
        answers,
      );

      setFinalScore(correctCount);
      setShowAnswers(true);

      const response = await authenticatedFetch("/api/evaluate", {
        method: "POST",
        body: JSON.stringify({
          score: correctCount,
          total: parsedQuestions.length,
          gradedResults,
          difficultyLevel: config.difficultyLevel,
        }),
      });

      if (operationId !== operationIdRef.current) {
        return;
      }

      const data = await parseApiError<{
        analysis?: EvaluationAnalysis;
      }>(response);

      setAiFeedback(
        data.analysis?.feedbackSummary || "Diagnostic complete.",
      );
      setQuestionExplanations(data.analysis?.questionExplanations || []);

      try {
        await updateProgress(correctCount, parsedQuestions.length);
      } catch (progressErr: unknown) {
        console.error("Progress update failed:", progressErr);
        setProgressWarning(
          progressErr instanceof Error
            ? progressErr.message
            : "Progress could not be saved.",
        );
      }

      try {
        const db = getFirestore(app);
        await addDoc(collection(db, "quizLogs"), {
          score: correctCount,
          totalQuestions: parsedQuestions.length,
          topic: `${config.topicName} - ${config.subtopicName}`,
          timeTakenSeconds,
          analysis: data.analysis?.feedbackSummary,
          timestamp: Timestamp.fromDate(new Date()),
          userId: user.uid,
        });
      } catch (logErr: unknown) {
        console.error("Quiz log write failed:", logErr);
      }
    } catch (err: unknown) {
      if (operationId !== operationIdRef.current) {
        return;
      }

      setError(err instanceof Error ? err.message : "Evaluation failed.");
    } finally {
      if (operationId === operationIdRef.current) {
        setIsEvaluating(false);
      }
    }
  }

  return {
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
  };
}

export type { AnswerLetter };
