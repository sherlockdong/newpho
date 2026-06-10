'use client';

import { motion } from 'framer-motion';

const EDITORS = [
  {
    id: "ED_01",
    name: "Sherlock Dong",
    tag: "Lead Editor",
    affiliation: "Rabun Gap Nacoochee School",
    description: "A physics enthusiast since 7th grade. Awarded first place in the Chinese National Physics Olympiad (CPhO).",
    color: "#10b981", // Mastered green
    bg: "rgba(16,185,129,0.05)",
    border: "rgba(16,185,129,0.2)"
  }
];

export default function InsightsPage() {
  return (
    <main className="page-wrapper min-h-screen px-4 pb-20 pt-12">
      <div className="max-w-[960px] mx-auto">

        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-3 py-1 mb-4 text-xs font-mono text-[#a78bfa] bg-[#a78bfa]/10 border border-[#a78bfa]/20 rounded-full"
          >
            SYS_// EDITORIAL
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-white font-heading tracking-tight mb-6"
          >
            Physics <span className="text-[#a78bfa]">Insights</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Access the editorial database for theoretical breakdowns, advanced learning protocols, mathematical tools, and strategic approaches to physics mastery.
          </motion.p>
        </div>

        {/* Editors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {EDITORS.map((editor, index) => (
            <motion.div
              key={editor.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 + 0.3 }}
              className="relative p-6 rounded-xl border backdrop-blur-sm"
              style={{ 
                backgroundColor: editor.bg, 
                borderColor: editor.border 
              }}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{editor.name}</h2>
                  <p className="text-sm font-mono" style={{ color: editor.color }}>
                    {editor.tag}
                  </p>
                </div>
                <div className="px-2 py-1 text-xs font-mono rounded bg-black/40 text-zinc-500 border border-zinc-800">
                  {editor.id}
                </div>
              </div>

              {/* Affiliation Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[1px] flex-grow bg-zinc-800"></div>
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                  {editor.affiliation}
                </span>
                <div className="h-[1px] flex-grow bg-zinc-800"></div>
              </div>

              {/* Bio */}
              <p className="text-zinc-300 text-sm leading-relaxed">
                {editor.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </main>
  );
}