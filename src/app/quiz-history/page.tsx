"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { app } from "../../firebase";

interface QuizLog {
  analysis: string;
  quizTopic?: string;
  timestamp?: any;
  score?: number;
}

const auth = getAuth(app);

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
    if (typeof ts === "number") return ts * (ts > 1e10 ? 1 : 1000);
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
        setError("Failed to load telemetry logs. Please query again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user]);

  // Unauthenticated State
  if (!user && !loading) {
    return (
      <main className="page-wrapper min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-center bg-[#0A0A18] border border-zinc-800 p-10 rounded-3xl max-w-md shadow-2xl">
          <h2 className="text-2xl font-bold text-white font-heading mb-4">Access Denied</h2>
          <p className="text-zinc-400 mb-8">Please authenticate to access your persistent training telemetry history.</p>
          <Link href="/auth">
            <button className="tg-btn w-full">Sign In</button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-wrapper">
      <div className="max-w-[1000px] mx-auto px-6 history-container">
        
        {/* Header Block */}
        <div className="mb-10 history-header">
          <h1 className="text-3xl md:text-4xl font-bold text-white font-heading tracking-tight mb-2">
            Quiz Analytics <span className="text-[#4f8ef7]">Logs</span>
          </h1>
          <p className="text-zinc-400">
            Review detailed AI diagnostic evaluations and feedback profiles from your past training iterations.
          </p>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 loading-spinner-container">
            <div className="w-8 h-8 border-4 border-[#4f8ef7] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-500 font-medium text-sm">Querying historical index database...</p>
          </div>
        )}

        {/* Error Feedback */}
        {error && (
          <div className="bg-[#180a0a] border border-red-900/50 p-6 rounded-2xl text-red-400 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && quizLogs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-zinc-800 rounded-3xl text-center px-6">
            <p className="text-zinc-500 max-w-md">No telemetry data recorded yet. Initialize a training module to see evaluation logs.</p>
            <Link href="/rout">
              <button className="tg-btn mt-6 text-sm">Start Training Hub</button>
            </Link>
          </div>
        )}

        {/* Logs Accordion Menu */}
        {!loading && !error && quizLogs.length > 0 && (
          <div className="flex flex-col gap-4 history-list">
            {quizLogs.map((log, i) => {
              const formattedDate = getFormattedDate(log.timestamp);
              
              return (
                <motion.details 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.4) }}
                  key={i} 
                  className="group border border-zinc-800 bg-[#0A0A18] rounded-2xl overflow-hidden transition-all duration-300 hover:border-zinc-700/80 history-accordion"
                >
                  <summary className="flex items-center justify-between p-5 md:p-6 cursor-pointer select-none list-none accordion-summary">
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                      <span className="text-white font-semibold font-heading tracking-tight text-base md:text-lg log-topic">
                        {log.quizTopic || "General Physics Assessment"}
                      </span>
                      <span className="text-zinc-500 text-xs md:text-sm font-medium log-date">
                        {formattedDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {log.score !== undefined && (
                        <span className="px-3 py-1 text-xs font-bold font-mono rounded-full bg-[#4f8ef7]/10 text-[#4f8ef7] border border-[#4f8ef7]/20 score-badge">
                          SCORE: {log.score}%
                        </span>
                      )}
                      {/* Interactive CSS Chevron Indicator */}
                      <svg className="accordion-chevron" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
</svg>
                    </div>
                  </summary>

                  <div className="p-6 border-t border-zinc-900 bg-[#06060f]/60 text-zinc-300 line-height-relaxed markdown-body-override accordion-content">
                    <ReactMarkdown>{log.analysis || "No analytical evaluation profile generated for this record."}</ReactMarkdown>
                  </div>
                </motion.details>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}