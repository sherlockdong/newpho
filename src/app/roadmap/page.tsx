'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Mock data defining the tree structure and node status
const mechanicsTree = [
  {
    tier: "Tier I: Baseline Vectors",
    nodes: [
      { id: "KIN-01", title: "1D & 2D Kinematics", status: "mastered", desc: "Projectiles & reference frames." }
    ]
  },
  {
    tier: "Tier II: Dynamic Systems",
    nodes: [
      { id: "DYN-01", title: "Newton's 1st & 2nd Laws", status: "unlocked", desc: "Equilibrium & Atwood constraints." },
      { id: "DYN-02", title: "Newton's 3rd Law", status: "unlocked", desc: "System boundaries & recoil." }
    ]
  },
  {
    tier: "Tier III: Conservation Laws",
    nodes: [
      { id: "CON-01", title: "Work & Energy", status: "locked", desc: "Potential wells & theorem." },
      { id: "CON-02", title: "Linear Momentum", status: "locked", desc: "Ballistics & center of mass." }
    ]
  },
  {
    tier: "Tier IV: Advanced Mechanics",
    nodes: [
      { id: "ADV-01", title: "Rotational Motion", status: "locked", desc: "Torque & angular momentum." },
      { id: "ADV-02", title: "Orbital Mechanics", status: "locked", desc: "Kepler's laws & tidal forces." }
    ]
  }
];

export default function RoadmapPage() {
  return (
    <main className="page-wrapper min-h-screen px-6 pb-20">
      <div className="max-w-[900px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-mono text-[#a78bfa] bg-[#a78bfa]/10 border border-[#a78bfa]/20 rounded-full">
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white font-heading tracking-tight mb-4">
            Curriculum <span className="text-[#a78bfa]">Node Tree</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Progress sequentially through the physics architecture. Mastering a tier unlocks subsequent advanced diagnostic modules.
          </p>
        </div>

        {/* The Node Tree Container */}
        <div className="relative flex flex-col items-center">
          
          {/* Vertical connecting spine */}
          <div className="absolute top-0 bottom-0 w-1 bg-zinc-800/50 left-1/2 -translate-x-1/2 z-0 hidden md:block"></div>

          {mechanicsTree.map((tier, tierIndex) => (
            <div key={tierIndex} className="w-full relative z-10 mb-16 last:mb-0">
              
              {/* Tier Label */}
              <div className="text-center mb-8">
                <span className="bg-[#0A0A18] px-4 py-1 text-xs font-mono text-zinc-500 uppercase tracking-widest border border-zinc-800 rounded-full shadow-lg">
                  {tier.tier}
                </span>
              </div>

              {/* Node Grid for this Tier */}
              <div className={`grid gap-6 ${tier.nodes.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto'}`}>
                {tier.nodes.map((node, nodeIndex) => {
                  
                  // Visual logic based on node status
                  const isMastered = node.status === "mastered";
                  const isUnlocked = node.status === "unlocked";
                  const isLocked = node.status === "locked";

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.4, delay: nodeIndex * 0.1 }}
                      key={node.id}
                      className={`
                        relative p-6 rounded-2xl border transition-all duration-300
                        ${isMastered ? 'bg-[#0f1f1a] border-emerald-500/50 hover:border-emerald-400' : ''}
                        ${isUnlocked ? 'bg-[#0A0A18] border-[#4f8ef7]/50 hover:border-[#4f8ef7] cursor-pointer hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(79,142,247,0.15)]' : ''}
                        ${isLocked ? 'bg-[#050510] border-zinc-800 opacity-60 cursor-not-allowed' : ''}
                      `}
                    >
                      {/* Status Indicator Dot */}
                      <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${
                        isMastered ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 
                        isUnlocked ? 'bg-[#4f8ef7] animate-pulse shadow-[0_0_8px_#4f8ef7]' : 
                        'bg-zinc-700'
                      }`}></div>

                      <div className={`text-xs font-mono mb-2 ${isMastered ? 'text-emerald-500' : isUnlocked ? 'text-[#4f8ef7]' : 'text-zinc-600'}`}>
                        {node.id}
                      </div>
                      
                      <h3 className={`text-lg font-bold font-heading mb-2 ${isLocked ? 'text-zinc-500' : 'text-white'}`}>
                        {node.title}
                      </h3>
                      
                      <p className={`text-sm ${isLocked ? 'text-zinc-600' : 'text-zinc-400'}`}>
                        {node.desc}
                      </p>

                      {/* Action / Status Footer */}
                      <div className="mt-4 pt-4 border-t border-zinc-800/50 flex justify-between items-center text-xs font-semibold">
                        {isMastered && <span className="text-emerald-500">100% Calibrated</span>}
                        {isUnlocked && <span className="text-[#4f8ef7]">Initialize Module →</span>}
                        {isLocked && <span className="text-zinc-600">Encrypted Vector</span>}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}