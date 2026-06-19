'use client';

import React from "react";
import Link from 'next/link';
import { motion } from 'framer-motion';

const topics = [
  {
    id: "VEC_01",
    title: "Classical Mechanics",
    desc: "Translational dynamics, rotational matrices, central forces, and Lagrangian frameworks.",
    subtopics: ["Kinematics", "Newtonian Laws", "Rotational Motion", "Oscillations"],
    href: "/highschoolquiz/mechanics",
    color: "#4f8ef7"
  }
];

export default function Rout() {
  return (
    <main className="page-wrapper">
      <div className="hub-container">
        
        {/* =========================================
            SYSTEM TELEMETRY SUMMARY
            ========================================= */}
        <div className="system-status-banner">
          <div className="status-item">
            <span className="status-dot green"></span>
            <span className="status-text">AI ENGINE: ACTIVE // GPT-4o PROTOCOL</span>
          </div>
          <div className="status-item">
            <span className="status-text">TOTAL DIAGNOSTICS LOGGED: <span className="text-white font-mono">0</span></span>
          </div>
          <div className="status-item">
            <span className="status-text">CURRENT FOCUS VECTOR: <span className="text-[#4f8ef7] font-mono">STANDBY</span></span>
          </div>
        </div>

        {/* Hub Header */}
        <div className="hub-header">
          <h1 className="hub-title">Targeted <span className="text-highlight">Physics Vectors</span></h1>
          <p className="hub-subtitle">
            Select a domain module below to review core study protocols and initialize AI-powered diagnostic matrices.
          </p>
        </div>

        {/* =========================================
            TOPICS SELECTION GRID
            ========================================= */}
        <div className="hub-grid">
          {topics.map((topic, i) => (
            <Link href={topic.href} key={topic.id}>
              <motion.div 
                whileHover={{ y: -6, borderColor: topic.color }}
                className="hub-card group relative overflow-hidden"
              >
                {/* Subtle background glow effect on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                  style={{ backgroundColor: topic.color }}
                ></div>

                {/* Identifier tag */}
                <div className="card-sys-label">{topic.id}</div>
                
                {/* Core Title */}
                <h2 className="card-title">{topic.title}</h2>
                <p className="card-desc">{topic.desc}</p>
                
                {/* Interactive Sub-topic Tags */}
                <div className="subtopic-tag-container">
                  {topic.subtopics.map((sub, idx) => (
                    <span key={idx} className="subtopic-tag border border-zinc-800/50 bg-zinc-900/30 text-zinc-400">
                      {sub}
                    </span>
                  ))}
                </div>

                <div className="card-footer border-t border-zinc-800/50 pt-4 mt-4 flex justify-between items-center">
                  <span className="mock-mastery-text text-[10px] uppercase tracking-widest text-zinc-500">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 animate-pulse"></span>
                    Module Ready
                  </span>
                  <span 
                    className="card-action text-sm font-semibold transition-colors duration-300"
                    style={{ color: topic.color }}
                  >
                    Access Hub →
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}