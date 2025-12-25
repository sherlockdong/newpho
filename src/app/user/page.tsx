"use client";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import SettingsModal from "../../components/SettingsModal";
import ReactMarkdown from "react-markdown";
import styles from "../page.module.css";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";

interface QuizLog {
  analysis: string;
  quizTopic?: string;
  timestamp?: any; // Flexible to handle different formats
  score?: number;
  weakTopics?: string[];
}

export default function UserPage() {
  const [user, setUser] = useState<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [quizLogs, setQuizLogs] = useState<QuizLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Theme toggle
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Safe date formatter (handles Firestore Timestamp, Date, string, number, etc.)
  const getFormattedDate = (timestamp: any): string => {
    if (!timestamp) return "Unknown date";

    // Firestore Timestamp
    if (timestamp && typeof timestamp.toDate === "function") {
      return timestamp.toDate().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    // JavaScript Date
    if (timestamp instanceof Date && !isNaN(timestamp.getTime())) {
      return timestamp.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    // Unix timestamp (seconds or milliseconds)
    if (typeof timestamp === "number") {
      const date = new Date(timestamp * (timestamp > 1e10 ? 1 : 1000));
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    }

    // ISO string
    if (typeof timestamp === "string") {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    }

    return "Invalid date";
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const db = getFirestore();
        const q = query(collection(db, "quizLogs"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);

        const logs: QuizLog[] = snapshot.docs.map((doc) => doc.data() as QuizLog);

        // Sort newest first (safe for mixed timestamp types)
        logs.sort((a, b) => {
          const timeA = a.timestamp
            ? new Date(
                typeof a.timestamp.toDate === "function"
                  ? a.timestamp.toDate()
                  : a.timestamp
              ).getTime()
            : 0;
          const timeB = b.timestamp
            ? new Date(
                typeof b.timestamp.toDate === "function"
                  ? b.timestamp.toDate()
                  : b.timestamp
              ).getTime()
            : 0;
          return timeB - timeA;
        });

        setQuizLogs(logs);
      } catch (err) {
        console.error("Error fetching quiz logs:", err);
        setError("Failed to load quiz history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user]);

  // Metrics Calculation
  const totalQuizzes = quizLogs.length;
  const averageScore =
    quizLogs.length > 0
      ? quizLogs.reduce((sum, log) => sum + (log.score || 0), 0) / totalQuizzes
      : 0;
  const allWeakTopics = quizLogs
    .flatMap((log) => log.weakTopics || [])
    .filter(Boolean);
  const weakTopicCounts = allWeakTopics.reduce((acc, topic) => {
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topWeakTopics = Object.entries(weakTopicCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([topic]) => topic);

  if (!user) {
    return <div className={styles.signInMessage}>Please sign in to view this page.</div>;
  }

  return (
    <div className="quiz-container">
      <div className={styles.userContainer}>
        <h1 className="quiz-title">User Profile</h1>

        {/* Profile Section */}
        <div className={styles.profileSection}>
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile Picture"
              className={styles.profilePicture}
              width="100"
              height="100"
            />
          ) : (
            <div className={styles.profilePicturePlaceholder}>No Image</div>
          )}
          <h2 className={styles.profileName}>{user.displayName || "Anonymous"}</h2>
        </div>

        <button className="settings-button" onClick={() => setIsSettingsOpen(true)}>
          Edit Profile
        </button>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button
            className="primary-button"
            onClick={() => (window.location.href = "/quiz-history")}
          >
            View All Quiz Feedback
          </button>

          <button
            className="secondary-button"
            onClick={() => (window.location.href = "/study-plan")}
          >
            View My Study Plan
          </button>
        </div>

        {/* Metrics Dashboard */}
        {totalQuizzes > 0 && (
          <div className={styles.metricsDashboard}>
            <h3 className="quiz-subtitle">Your Progress Summary</h3>
            <div className={styles.metricsGrid}>
              <div>
                <strong>Total Quizzes:</strong> {totalQuizzes}
              </div>
              <div>
                <strong>Average Score:</strong> {averageScore.toFixed(1)}
              </div>
              {topWeakTopics.length > 0 && (
                <div>
                  <strong>Focus Areas:</strong> {topWeakTopics.join(", ")}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quiz History Preview (collapsed accordions) */}
        <div className={styles.quizLogsSection}>
          <h3 className="quiz-subtitle">Recent Quiz Feedback</h3>

          {loading && (
            <div className={styles.loadingSpinner}>
              <p>Loading your quiz history...</p>
              <div className={styles.spinner}></div>
            </div>
          )}

          {error && <p className="quiz-error">{error}</p>}

          {!loading && !error && quizLogs.length === 0 && (
            <p className="quiz-error">
              No quiz history available yet. Complete a quiz to see feedback!
            </p>
          )}

          {!loading && !error && quizLogs.length > 0 && (
            <div className={styles.historyList}>
              {quizLogs.slice(0, 5).map((log, index) => {  // Show only latest 5 as preview
                const formattedDate = getFormattedDate(log.timestamp);
                const title = log.quizTopic
                  ? `${log.quizTopic} – ${formattedDate}`
                  : `Quiz – ${formattedDate}`;

                return (
                  <details key={index} className={styles.accordion}>
                    <summary className={styles.accordionSummary}>
                      {title}
                      {log.score !== undefined && (
                        <span className={styles.scoreBadge}>Score: {log.score}</span>
                      )}
                    </summary>
                    <div className={styles.accordionContent}>
                      <ReactMarkdown>{log.analysis || "No analysis available"}</ReactMarkdown>
                    </div>
                  </details>
                );
              })}
              {quizLogs.length > 5 && (
                <p className={styles.moreLink}>
                  See all feedback in the full view →
                </p>
              )}
            </div>
          )}
        </div>

        {/* Settings Modal */}
        <SettingsModal
          user={user}
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    </div>
  );
}