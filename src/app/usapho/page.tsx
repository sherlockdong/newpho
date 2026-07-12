"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

import { useRouter } from "next/navigation";
import { app } from "../../firebase";
import { motion } from "framer-motion";

const auth = getAuth(app);

export default function USAPHOQuizPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const topics = [
    { slug: "mechanics", name: "Mechanics", code: "USA-MCH" },
    { slug: "eandm", name: "Electricity and Magnetism", code: "USA-ENM" },
    { slug: "relativity", name: "Relativity and Modern Physics", code: "USA-RMP" },

    { slug: "thermo", name: "Thermodynamics", code: "USA-TMD" },

    { slug: "wavesoptics", name: "Waves and Optics", code: "USA-WAO" },
    { slug: "dataanalysis", name: "Data Analysis", code: "USA-DTA" },

  ];
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 80, damping: 15 }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [loading, user, router]);

  // Upgraded Premium Loading State
  if (loading) {
    return (
      <main className="min-h-screen bg-[#05050A] flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#8b5cf6]/20 border-t-[#8b5cf6] rounded-full animate-spin"></div>
          <div className="absolute w-4 h-4 bg-[#8b5cf6] rounded-full animate-pulse blur-sm"></div>
        </div>
        <p className="mt-6 text-zinc-400 font-mono tracking-widest text-xs uppercase">Verifying credentials...</p>
      </main>
    );
  }

  // Prevents UI flashing while router.push executes
  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#05050A] text-zinc-200 relative overflow-hidden py-24">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#8b5cf6]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-[1100px] mx-auto px-6 relative z-10">

        {/* Header Section */}
        <div className="mb-16 text-center md:text-left flex flex-col items-center md:items-start">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-mono text-[#8b5cf6] bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.1)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] animate-pulse"></span>
            VECTOR: United States of America Physics Olympics
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Select Training <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#c4b5fd]">Module</span>
          </h1>

          <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
            Choose a specific sub-domain below to initialize your diagnostic quiz. Parameters will scale dynamically based on your performance.
          </p>
        </div>

        {/* The Module Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {topics.map((topic) => (
            <Link href={`/usapho/${topic.slug}`} key={topic.slug} className="block group">
              <motion.div
                variants={itemVariants}
                className="flex flex-col h-full bg-[#0A0A18]/80 backdrop-blur-sm border border-zinc-800/80 p-8 rounded-2xl hover:border-[#8b5cf6]/50 hover:bg-[#0c0c1f] transition-all duration-500 relative overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]"
              >
                {/* Vibrant side glow on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#8b5cf6] to-[#c4b5fd] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="flex items-center justify-between mb-8">
                  <span className="text-xs font-mono tracking-wider text-zinc-500 group-hover:text-[#8b5cf6] transition-colors duration-300">
                    SYS_// {topic.code}
                  </span>

                  <div className="p-2 rounded-full bg-zinc-800/50 group-hover:bg-[#8b5cf6]/10 transition-colors duration-300">
                    <svg className="w-4 h-4 shrink-0 text-zinc-400 group-hover:text-[#8b5cf6] transform group-hover:translate-x-0.5 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-zinc-100 tracking-wide leading-snug group-hover:text-white transition-colors duration-300">
                  {topic.name}
                </h2>
              </motion.div>
            </Link>
          ))}
        </motion.div>

      </div>
    </main>
  );
}