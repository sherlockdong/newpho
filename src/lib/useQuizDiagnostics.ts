"use client";

import { useEffect, useRef, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
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
  const expectedUid = auth.currentUser?.uid;
  return async function authenticatedFetch(
    url: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const currentUser = auth.currentUser;

    if (!currentUser || currentUser.uid !== expectedUid) {
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
  const attemptIdRef = useRef<string | null>(null);

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
      operationIdRef.current++;
      attemptIdRef.current = null;
      setIsGenerating(false); setIsEvaluating(false);
      setShowAnswers(false); setParsedQuestions([]); setQuiz(null);
      setFinalScore(null); setAiFeedback(null); setError(null);
      setQuestionExplanations([]); setProgressWarning(null);
      setIsNodeAccessible(false);
      setUser(currentUser);
      setAuthReady(true);
    });

    return () => {
      unsubscribe();
      // This ref is a request counter, not a DOM node; invalidate pending work on unmount.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      operationIdRef.current++;
    };
  }, [auth]);

  useEffect(() => {
    if (!authReady || !user) {
      return;
    }

    let cancelled = false;
    async function loadNodeAccess() {
      try {
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

      if (cancelled) return;
      setIsNodeAccessible(
        checkNodeAccessible(
          config.nodeId,
          config.prerequisitesMap,
          current,
        ),
      );
      } catch {
        if (!cancelled) { setIsNodeAccessible(false); setError("Unable to load prerequisites. Please reload to retry."); }
      }
    }

    void loadNodeAccess();
    return () => { cancelled = true; };
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
    if (isBusy) return;
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
    attemptIdRef.current = crypto.randomUUID();
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
    if (isBusy || !parsedQuestions.length) return;
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

      async function saveAttempt(status: string, analysis?: EvaluationAnalysis) {
        attemptIdRef.current ??= crypto.randomUUID();
        const response = await authenticatedFetch("/api/logs", {
          method: "POST",
          body: JSON.stringify({
            attemptId: attemptIdRef.current, schemaVersion: 1, eventType: "quiz_completed",
            nodeId: config.nodeId, progressCollection: config.progressCollection,
            lessonId: window.location.pathname,
            topicName: config.topicName, subtopicName: config.subtopicName,
            topic: `${config.topicName} - ${config.subtopicName}`,
            difficultyLevel: config.difficultyLevel,
            score: correctCount, totalQuestions: parsedQuestions.length,
            timeTakenSeconds, gradedResults, evaluationStatus: status,
            analysis: analysis?.feedbackSummary ?? "Feedback pending. Your quiz result has been saved.",
            questionExplanations: analysis?.questionExplanations ?? [],
          }),
        });
        await parseApiError(response);
      }
      // Persist before any optional AI work. A retry uses the same attempt ID.
      await saveAttempt("pending");
      try {
        await updateProgress(correctCount, parsedQuestions.length);
      } catch {
        setProgressWarning("Your quiz is saved, but roadmap progress could not be updated. Submit again to retry.");
      }

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
        await saveAttempt("complete", data.analysis);
      } catch {
        setProgressWarning("Your score is saved, but feedback could not be saved. Submit again to retry.");
      }
    } catch (err: unknown) {
      if (operationId !== operationIdRef.current) {
        return;
      }

      setError(err instanceof Error ? `${err.message} You can submit again to retry; saved attempts will not be duplicated.` : "Evaluation failed. Submit again to retry.");
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
