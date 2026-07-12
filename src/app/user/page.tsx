"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getAuth,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { motion } from "framer-motion";

import { app } from "../../firebase";

type QuizTimestamp = Timestamp | Date | number | string | null;

interface QuizLog {
  id: string;
  analysis?: string;
  topic?: string;
  quizTopic?: string;
  timestamp?: QuizTimestamp;
  score?: number;
  totalQuestions?: number;
}

const auth = getAuth(app);

function getTimestampMs(timestamp?: QuizTimestamp): number {
  if (!timestamp) return 0;

  if (timestamp instanceof Timestamp) {
    return timestamp.toMillis();
  }

  if (timestamp instanceof Date) {
    return Number.isNaN(timestamp.getTime()) ? 0 : timestamp.getTime();
  }

  if (typeof timestamp === "number") {
    return timestamp > 1e10 ? timestamp : timestamp * 1000;
  }

  if (typeof timestamp === "string") {
    const milliseconds = new Date(timestamp).getTime();
    return Number.isNaN(milliseconds) ? 0 : milliseconds;
  }

  return 0;
}

function formatDate(timestamp?: QuizTimestamp): string {
  const milliseconds = getTimestampMs(timestamp);

  if (!milliseconds) return "Unknown date";

  return new Date(milliseconds).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getPercentage(log: QuizLog): number | null {
  if (
    typeof log.score !== "number" ||
    typeof log.totalQuestions !== "number" ||
    log.totalQuestions <= 0
  ) {
    return null;
  }

  return Math.round((log.score / log.totalQuestions) * 100);
}

function getTopic(log: QuizLog): string {
  return log.topic || log.quizTopic || "General Physics Assessment";
}

export default function UserDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizLogs, setQuizLogs] = useState<QuizLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [wantsUpdates, setWantsUpdates] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setError(null);

      if (currentUser) {
        setLoading(true);
      } else {
        setQuizLogs([]);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function fetchQuizLogs() {
      try {
        const db = getFirestore(app);
        const logsQuery = query(
          collection(db, "quizLogs"),
          where("userId", "==", user!.uid),
        );

        const snapshot = await getDocs(logsQuery);

        if (cancelled) return;

        const logs = snapshot.docs.map((document): QuizLog => {
          const data = document.data();

          return {
            id: document.id,
            analysis:
              typeof data.analysis === "string" ? data.analysis : undefined,
            topic: typeof data.topic === "string" ? data.topic : undefined,
            quizTopic:
              typeof data.quizTopic === "string"
                ? data.quizTopic
                : undefined,
            timestamp: data.timestamp as QuizTimestamp,
            score: typeof data.score === "number" ? data.score : undefined,
            totalQuestions:
              typeof data.totalQuestions === "number"
                ? data.totalQuestions
                : undefined,
          };
        });

        logs.sort(
          (first, second) =>
            getTimestampMs(second.timestamp) -
            getTimestampMs(first.timestamp),
        );

        setQuizLogs(logs);
      } catch (fetchError: unknown) {
        console.error("Failed to load dashboard quiz logs:", fetchError);

        if (!cancelled) {
          setError("Unable to load your quiz activity.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchQuizLogs();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const scoredQuizzes = quizLogs
    .map(getPercentage)
    .filter((score): score is number => score !== null);

  const averageScore =
    scoredQuizzes.length > 0
      ? Math.round(
          scoredQuizzes.reduce((total, score) => total + score, 0) /
            scoredQuizzes.length,
        )
      : null;

  const recentLogs = quizLogs.slice(0, 3);
  const currentTopic =
    quizLogs.length > 0 ? getTopic(quizLogs[0]) : "No quiz yet";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#4f8ef7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center bg-[#0A0A18] border border-zinc-800 p-6 sm:p-10 rounded-3xl shadow-2xl"
        >
          <h2 className="text-2xl font-bold text-white font-heading mb-4">
            Access Denied
          </h2>

          <p className="text-zinc-400 mb-8">
            You must be logged in to access the researcher dashboard.
          </p>

          <Link href="/auth" className="tg-btn block w-full">
            Authenticate Now
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
      <main className="max-w-[1000px] mx-auto">
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#0A0A18] border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="shrink-0">
              {user.photoURL ? (
                // Firebase profile URLs may require additional Next Image config.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt={`${user.displayName || "User"} avatar`}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-[#4f8ef7] object-cover shadow-[0_0_20px_rgba(79,142,247,0.3)]"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#4f8ef7]/10 border-2 border-[#4f8ef7] flex items-center justify-center text-3xl sm:text-4xl font-bold text-[#4f8ef7]">
                  {user.displayName?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white font-heading tracking-tight break-words">
                Welcome back,{" "}
                <span className="text-[#4f8ef7]">
                  {user.displayName || "Researcher"}
                </span>
              </h1>

              <p className="text-zinc-400 mt-2 break-all">{user.email}</p>

              <label className="mt-5 max-w-xl flex items-start gap-3 cursor-pointer bg-[#0f0f20]/50 p-4 rounded-xl border border-zinc-800">
                <input
                  type="checkbox"
                  checked={wantsUpdates}
                  onChange={(event) =>
                    setWantsUpdates(event.target.checked)
                  }
                  className="w-5 h-5 shrink-0 mt-0.5 cursor-pointer accent-[#4f8ef7]"
                />

                <span className="min-w-0 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  I agree to receive notifications about system updates and new
                  training modules.
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => void auth.signOut()}
              className="shrink-0 self-start md:self-center text-sm font-medium text-zinc-400 hover:text-[#ff6b9d] border border-zinc-800 hover:border-[#ff6b9d]/50 px-6 py-2 rounded-full transition-colors"
            >
              Sign Out
            </button>
          </div>
        </motion.section>

        {error && (
          <div className="mb-8 bg-red-950/30 border border-red-900/50 text-red-300 p-4 rounded-2xl">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          <DashboardMetric
            label="Total Quizzes"
            value={String(quizLogs.length)}
            linkText="View History →"
            href="/quiz-history"
            color="#4f8ef7"
            delay={0.1}
          />

          <DashboardMetric
            label="Average Score"
            value={averageScore === null ? "—" : `${averageScore}%`}
            linkText="Analytics Matrix →"
            href="/quiz-history"
            color="#a78bfa"
            delay={0.2}
          />

          <DashboardMetric
            label="Current Vector"
            value={currentTopic}
            linkText="Resume Training →"
            href="/rout"
            color="#10b981"
            delay={0.3}
            compact
          />
        </section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-[#0A0A18] border border-zinc-800 p-5 sm:p-8 rounded-3xl shadow-xl"
        >
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">
              Recent Activity
            </h2>

            <Link
              href="/quiz-history"
              className="shrink-0 text-sm text-zinc-400 hover:text-white"
            >
              View All
            </Link>
          </div>

          {recentLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-5 border-2 border-dashed border-zinc-800 rounded-xl text-center">
              <p className="text-zinc-500">
                No telemetry data recorded yet.
              </p>

              <Link href="/highschoolquiz" className="tg-btn mt-6 text-sm">
                Start Your First Quiz
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => {
                const percentage = getPercentage(log);

                return (
                  <Link
                    key={log.id}
                    href="/quiz-history"
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-5 bg-[#06060f] border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-white font-semibold break-words">
                        {getTopic(log)}
                      </p>

                      <p className="text-xs text-zinc-500 mt-1">
                        {formatDate(log.timestamp)}
                      </p>
                    </div>

                    <div className="shrink-0 text-left sm:text-right">
                      {typeof log.score === "number" &&
                      typeof log.totalQuestions === "number" ? (
                        <>
                          <p className="text-[#4f8ef7] font-mono font-bold">
                            {log.score}/{log.totalQuestions}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {percentage}% correct
                          </p>
                        </>
                      ) : (
                        <p className="text-zinc-500 text-sm">Score unavailable</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}

function DashboardMetric({
  label,
  value,
  linkText,
  href,
  color,
  delay,
  compact = false,
}: {
  label: string;
  value: string;
  linkText: string;
  href: string;
  color: string;
  delay: number;
  compact?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="min-w-0 bg-[#0A0A18] border border-zinc-800 p-6 rounded-3xl"
    >
      <h3 className="text-zinc-500 text-xs sm:text-sm uppercase tracking-wider font-semibold mb-3">
        {label}
      </h3>

      <div
        className={`font-black text-white font-heading break-words ${
          compact ? "text-xl sm:text-2xl" : "text-4xl sm:text-5xl"
        }`}
      >
        {value}
      </div>

      <Link
        href={href}
        className="inline-block text-sm mt-5 hover:underline"
        style={{ color }}
      >
        {linkText}
      </Link>
    </motion.div>
  );
}