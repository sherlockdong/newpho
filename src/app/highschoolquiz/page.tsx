"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { app } from "../../firebase"; 
import { motion } from "framer-motion";

const auth = getAuth(app);

export default function QuizIndexPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const topics = [
    { slug: "mechanics", name: "Mechanics", code: "MCH-00" },
     { slug: "electricity", name: "Electricity and Magnetism", code: "ELM-00" },
  ];
  /*  { slug: "propertiesomatter", name: "Properties of Matter", code: "prm-00" },
    { slug: "heat", name: "Heat", code: "HEA-00" },
    { slug: "sound", name: "Sound", code: "SND-00" },
     { slug: "light", name: "Light", code: "LGT-00" },
    { slug: "electricity", name: "Electricity and Magnetism", code: "ELM-00" },
    { slug: "relativity", name: "Relativity", code: "REL-00" }

    */
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring" as const, stiffness: 100 } 
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

  // Premium Loading State
  if (loading) {
    return (
      <main className="page-wrapper min-h-screen flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#4f8ef7] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-500 font-medium text-sm">Verifying credentials...</p>
      </main>
    );
  }

  // Prevents UI flashing while router.push executes
  if (!user) return null; 

  return (
    <main className="page-wrapper">
      <div className="max-w-[1100px] mx-auto px-6">
        
        {/* Header Section */}
        <div className="mb-12 text-center md:text-left">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-mono text-[#4f8ef7] bg-[#4f8ef7]/10 border border-[#4f8ef7]/20 rounded-full">
            VECTOR: PRE-COLLEGE PHYSICS
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white font-heading tracking-tight mb-4">
            Select Training <span className="text-[#4f8ef7]">Module</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
            Choose a specific sub-domain below to initialize your diagnostic quiz. Parameters will scale dynamically based on your performance.
          </p>
        </div>

        {/* The Module Grid */}
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {topics.map((topic) => (
            <Link href={`/highschoolquiz/${topic.slug}`} key={topic.slug} className="block group">
              <motion.div 
                variants={itemVariants}
                className="flex flex-col h-full bg-[#0A0A18] border border-zinc-800 p-6 rounded-2xl hover:border-[#4f8ef7]/50 hover:bg-[#0c0c1f] transition-all duration-300 relative overflow-hidden module-card"
              >
                {/* Subtle side glow on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4f8ef7] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-zinc-500 group-hover:text-[#4f8ef7] transition-colors">
                    SYS_// {topic.code}
                  </span> 

                  {/* Added 'bg-transparent' to fix the mismatched box color! */}
                  <svg className="module-arrow w-4 h-4 shrink-0 bg-transparent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                
                <h2 className="text-lg font-bold text-white font-heading tracking-wide leading-snug group-hover:text-[#e8eaf6]">
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