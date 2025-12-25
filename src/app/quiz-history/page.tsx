// app/quiz-history/page.tsx
"use client";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ReactMarkdown from "react-markdown";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import "../../../public/assets/css/main.css"; // Adjust path if]
import styles from "../page.module.css";
interface QuizLog {
  analysis: string;
  quizTopic?: string;
  timestamp?: any; // Flexible for different formats
  score?: number;
}

export default function QuizHistoryPage() {
  const [user, setUser] = useState<any>(null);
  const [quizLogs, setQuizLogs] = useState<QuizLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Safe timestamp to milliseconds converter
  const getTimestampMs = (ts: any): number => {
    if (!ts) return 0;
    if (typeof ts.toDate === "function") return ts.toDate().getTime();
    if (ts instanceof Date && !isNaN(ts.getTime())) return ts.getTime();
    if (typeof ts === "number") return ts * (ts > 1e10 ? 1 : 1000); // ms if large
    if (typeof ts === "string") {
      const date = new Date(ts);
      return !isNaN(date.getTime()) ? date.getTime() : 0;
    }
    return 0;
  };

  // Safe date formatter for display
  const getFormattedDate = (timestamp: any): string => {
    if (!timestamp) return "Unknown date";

    let date: Date | null = null;

    if (typeof timestamp.toDate === "function") {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === "number") {
      date = new Date(timestamp * (timestamp > 1e10 ? 1 : 1000));
    } else if (typeof timestamp === "string") {
      date = new Date(timestamp);
    }

    if (date && !isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    return "Invalid date";
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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

        // Safe sorting: newest first
        logs.sort((a, b) => getTimestampMs(b.timestamp) - getTimestampMs(a.timestamp));

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

  if (!user) {
    return (
      <div className={styles.userContainer}>
        <p>Please sign in to view your quiz history.</p>
      </div>
    );
  }

  return (
    <div className={styles.userContainer}>
      <h1 className="quiz-title">All Quiz Feedback</h1>

      {loading && (
        <div className={styles.loadingSpinner}>
          <p>Loading your quiz history...</p>
          <div className={styles.spinner}></div>
        </div>
      )}

      {error && <p className="quiz-error">{error}</p>}

      {!loading && !error && quizLogs.length === 0 && (
        <p>No quizzes completed yet. Start a quiz to see personalized feedback!</p>
      )}

      {!loading && !error && quizLogs.length > 0 && (
        <div className={styles.historyList}>
          {quizLogs.map((log, i) => {
            const formattedDate = getFormattedDate(log.timestamp);
            const title = log.quizTopic
              ? `${log.quizTopic} – ${formattedDate}`
              : `Quiz – ${formattedDate}`;

            return (
              <details key={i} className={styles.accordion}>
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
        </div>
      )}
    </div>
  );
}