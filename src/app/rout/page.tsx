'use client';

import React from "react";
import Link from 'next/link';
import { motion } from 'framer-motion';

// Mock data array to populate the dashboard dynamically
const topics = [
  {
    id: "VEC_01",
    title: "Classical Mechanics",
    desc: "Translational dynamics, rotational matrices, central forces, and Lagrangian frameworks.",
    subtopics: ["Kinematics", "Newtonian Laws", "Rotational Motion", "Oscillations"],
    href: "/highschoolquiz?topic=mechanics",
    color: "#4f8ef7"
  },
  {
    id: "VEC_02",
    title: "Electromagnetism",
    desc: "Electrostatic potentials, Maxwell's field equations, magnetic induction, and circuitry analysis.",
    subtopics: ["Gauss's Law", "Magnetic Fields", "AC Circuits", "Maxwell Vectors"],
    href: "/highschoolquiz?topic=em",
    color: "#a78bfa"
  },
  {
    id: "VEC_03",
    title: "Thermodynamics",
    desc: "Kinetic molecular theory, statistical mechanics, entropy pathways, and state cycles.",
    subtopics: ["Ideal Gases", "Laws of Thermo", "Statistical Entropy", "Heat Engines"],
    href: "/highschoolquiz?topic=thermo",
    color: "#34d399"
  },
  {
    id: "VEC_04",
    title: "Relativity & Quantum",
    desc: "Lorentz transformations, space-time manifolds, wave-particle duality, and atomic physics.",
    subtopics: ["Time Dilation", "Photoelectric Effect", "Bohr Atom", "Wave Functions"],
    href: "/highschoolquiz?topic=modern",
    color: "#fb923c"
  }
];

export default function Rout() {
  return (
    <main className="page-wrapper">
      <div className="hub-container">
        
        {/* =========================================
            SYSTEM TELEMETRY SUMMARY (Fills the Emptiness)
            ========================================= */}
        <div className="system-status-banner">
          <div className="status-item">
            <span className="status-dot green"></span>
            <span className="status-text">AI ENGINE: ACTIVE // CLUSTER_v4</span>
          </div>
          <div className="status-item">
            <span className="status-text">TOTAL DIAGNOSTICS LOGGED: <span className="text-white font-mono">1,402</span></span>
          </div>
          <div className="status-item">
            <span className="status-text">CURRENT FOCUS VECTOR: <span className="text-[#4f8ef7] font-mono">MECHANICS</span></span>
          </div>
        </div>

        {/* Hub Header */}
        <div className="hub-header">
          <h1 className="hub-title">Targeted <span className="text-highlight">Physics Vectors</span></h1>
          <p className="hub-subtitle">Initialize an isolated domain module below to launch practice problem sets and performance analytics.</p>
        </div>

        {/* =========================================
            TOPICS SELECTION GRID
            ========================================= */}
        <div className="hub-grid">
          {topics.map((topic, i) => (
            <Link href={topic.href} key={topic.id}>
              <motion.div 
                whileHover={{ y: -6, borderColor: topic.color }}
                className="hub-card group"
              >
                {/* Identifier tag */}
                <div className="card-sys-label">SYS_{topic.id}</div>
                
                {/* Core Title */}
                <h2 className="card-title">{topic.title}</h2>
                <p className="card-desc">{topic.desc}</p>
                
                {/* Functional improvement: Interactive Sub-topic Tags */}
                <div className="subtopic-tag-container">
                  {topic.subtopics.map((sub, idx) => (
                    <span key={idx} className="subtopic-tag">
                      {sub}
                    </span>
                  ))}
                </div>

                <div className="card-footer">
                  <span className="mock-mastery-text">Telemetry Ready</span>
                  <span className="card-action">Launch Matrix →</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}