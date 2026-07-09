'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAuth,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

import { app } from "../../firebase";
import { motion } from "framer-motion";

const auth = getAuth(app);

export default function UserDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [loading, setLoading] = useState(true);
  const [wantsUpdates, setWantsUpdates] = useState(true);
  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#4f8ef7] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Unauthenticated State
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center bg-[#0A0A18] border border-zinc-800 p-10 rounded-3xl max-w-md shadow-2xl"
        >
          <h2 className="text-2xl font-bold text-white font-heading mb-4">Access Denied</h2>
          <p className="text-zinc-400 mb-8">You must be logged in to access the researcher dashboard.</p>
          <Link href="/auth">
            <button className="tg-btn w-full">Authenticate Now</button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Authenticated Dashboard Layout
  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <main className="max-w-[1000px] mx-auto">

        {/* =========================================
            USER PROFILE HEADER
            ========================================= */}
        <motion.section
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="user-profile-header bg-[#0A0A18] border border-zinc-800 rounded-3xl shadow-2xl relative overflow-hidden"
        >
          {/* Schematic visual accent */}
          <div className="absolute top-0 right-0 p-4 font-mono text-xs text-zinc-700 select-none">
            USR_OP_ID // {user.uid.substring(0, 8)}
          </div>

          <div className="flex-shrink-0">
            {user.photoURL ? (
              <img src={user.photoURL} alt="User Avatar" className="w-24 h-24 rounded-full border-2 border-[#4f8ef7] object-cover shadow-[0_0_20px_rgba(79,142,247,0.3)]" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#4f8ef7]/10 border-2 border-[#4f8ef7] flex items-center justify-center text-4xl font-bold text-[#4f8ef7] shadow-[0_0_20px_rgba(79,142,247,0.3)]">
                {user.displayName?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white font-heading tracking-tight mb-2">
              Welcome back, <span className="text-[#4f8ef7]">{user.displayName || "Researcher"}</span>
            </h1>
            <p className="text-zinc-400 text-lg">
              {user.email}
            </p>
          </div>
          <label className="flex items-start gap-3 cursor-pointer mb-6 group bg-[#0f0f20]/50 p-4 rounded-xl border border-[#27272a]/80 hover:border-[var(--accent-blue)]/50 transition-colors">
            <input
              type="checkbox"
              checked={wantsUpdates}
              onChange={(e) => setWantsUpdates(e.target.checked)}
              className="w-5 h-5 shrink-0 cursor-pointer mt-0.5 accent-[var(--accent-blue)]"
            />
            <span className="text-xs text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors leading-relaxed">
              I agree to receive notifications about system updates and new training modules.
            </span>
          </label>
          <div className="flex-shrink-0">
            <button
              onClick={() => auth.signOut()}
              className="text-sm font-medium text-zinc-400 hover:text-[#ff6b9d] border border-zinc-800 hover:border-[#ff6b9d]/50 px-6 py-2 rounded-full transition-all duration-300"
            >
              Sign Out
            </button>
          </div>
        </motion.section>

        {/* =========================================
            DASHBOARD METRICS GRID
            ========================================= */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#0A0A18] border border-zinc-800 p-8 rounded-3xl relative group hover:border-[#4f8ef7]/50 transition-colors"
          >
            <h3 className="text-zinc-500 text-sm uppercase tracking-widest font-semibold mb-2">Total Quizzes</h3>
            <div className="text-5xl font-black text-white font-heading">0</div>
            <p className="text-[#4f8ef7] text-sm mt-4 cursor-pointer group-hover:underline">View History →</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#0A0A18] border border-zinc-800 p-8 rounded-3xl relative group hover:border-[#a78bfa]/50 transition-colors"
          >
            <h3 className="text-zinc-500 text-sm uppercase tracking-widest font-semibold mb-2">Average Score</h3>
            <div className="text-5xl font-black text-white font-heading">--%</div>
            <p className="text-[#a78bfa] text-sm mt-4 cursor-pointer group-hover:underline">Analytics Matrix →</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-[#0A0A18] border border-zinc-800 p-8 rounded-3xl relative group hover:border-emerald-500/50 transition-colors"
          >
            <h3 className="text-zinc-500 text-sm uppercase tracking-widest font-semibold mb-2">Current Vector</h3>
            <div className="text-2xl font-bold text-white font-heading mt-2">Kinematics</div>
            <p className="text-emerald-500 text-sm mt-6 cursor-pointer group-hover:underline">Resume Module →</p>
          </motion.div>

        </section>

        {/* =========================================
            RECENT ACTIVITY PLACEHOLDER
            ========================================= */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-[#0A0A18] border border-zinc-800 p-10 rounded-3xl shadow-xl"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white font-heading">Recent Activity</h2>
            <Link href="/quiz-history" className="text-sm text-zinc-400 hover:text-white transition-colors">View All</Link>
          </div>

          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-zinc-800 rounded-xl">
            <p className="text-zinc-500">No telemetry data recorded yet.</p>
            <Link href="/highschoolquiz">
              <button className="tg-btn mt-6 text-sm">Start Your First Quiz</button>
            </Link>
          </div>
        </motion.section>

      </main>
    </div>
  );
}