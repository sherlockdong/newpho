'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = 'mastered' | 'unlocked' | 'locked';
type ProgressMap = Record<string, Status>;

interface TreeNode {
  id: string;
  title: string[];
  status: Status;
  desc: string;
  url: string;
  prerequisites: string[];
}

interface Tier {
  label: string;
  sub: string;
  nodes: TreeNode[];
  cx: number;
}

// ─── Mechanics Layout Data ───────────────────────────────────────────────────

const MECHANICS_TEMPLATE: (Omit<TreeNode, 'status'> & { defaultStatus: Status })[] = [
  // Original Nodes (Untouched)
  { id: 'MCH-01', title: ["Newton's First Law"], defaultStatus: 'unlocked', desc: 'Projectiles & reference frames.', url: '/highschoolquiz/mechanics/newtons-first-law', prerequisites: [] },
  { id: 'MCH-02', title: ["Linear Motion"], defaultStatus: 'unlocked', desc: 'Equilibrium & Atwood constraints.', url: '/highschoolquiz/mechanics/linear-motion', prerequisites: [] },
  {
    id: 'MCH-03',
    title: ["Newton's Second Law"],
    defaultStatus: 'locked',
    desc: 'F = ma, free-body diagrams, friction, and coupled systems.',
    url: '/highschoolquiz/mechanics/newtons-second-law',
    prerequisites: ['MCH-01', 'MCH-02']
  },
  {
    id: 'MCH-04',
    title: ["Newton's Third Law"],
    defaultStatus: 'locked',
    desc: 'System boundaries, action-reaction pairs, and recoil.',
    url: '/highschoolquiz/mechanics/newtons-third-law',
    prerequisites: ['MCH-01']
  },
  {
    id: 'MCH-05',
    title: ['Linear', 'Momentum'],
    defaultStatus: 'locked',
    desc: 'Ballistics, impulse, and center of mass.',
    url: '/highschoolquiz/mechanics/linear-momentum',
    prerequisites: ['MCH-03', 'MCH-04']
  },
  {
    id: 'MCH-06',
    title: ['Work &', 'Energy'],
    defaultStatus: 'locked',
    desc: 'Potential wells, work-energy theorem, and conservation.',
    url: '/highschoolquiz/mechanics/work-energy',
    prerequisites: ['MCH-03']
  },
  {
    id: 'MCH-07',
    title: ['Projectile', 'Motion'],
    defaultStatus: 'locked',
    desc: 'Two-dimensional kinematics and independent horizontal/vertical components.',
    url: '/highschoolquiz/mechanics/projectile-motion',
    prerequisites: ['MCH-02']
  },
  {
    id: 'MCH-08',
    title: ['Rotational', 'Motion'],
    defaultStatus: 'locked',
    desc: 'Torque, moment of inertia, and angular momentum.',
    url: '/highschoolquiz/mechanics/rotational-motion',
    prerequisites: ['MCH-03', 'MCH-05']
  },
  {
    id: 'MCH-09',
    title: ['Orbital', 'Mechanics'],
    defaultStatus: 'locked',
    desc: "Kepler's laws, universal gravitation, and escape velocity.",
    url: '/highschoolquiz/mechanics/orbital-mechanics',
    prerequisites: ['MCH-06', 'MCH-07']
  },
  // New Higher-Difficulty Nodes
  {
    id: 'MCH-10',
    title: ['Oscillatory', 'Motion'],
    defaultStatus: 'locked',
    desc: "Simple harmonic motion, pendulums, and driven oscillations.",
    url: '/highschoolquiz/mechanics/oscillatory-motion',
    prerequisites: ['MCH-06', 'MCH-08']
  },
  {
    id: 'MCH-11',
    title: ['Fluid', 'Mechanics'],
    defaultStatus: 'locked',
    desc: "Buoyancy, continuity equation, and Bernoulli's principle.",
    url: '/highschoolquiz/mechanics/fluid-mechanics',
    prerequisites: ['MCH-03', 'MCH-06']
  },
  {
    id: 'MCH-12',
    title: ['Special', 'Topics'],
    defaultStatus: 'locked',
    desc: "Lagrangian mechanics and introduction to special relativity.",
    url: '/highschoolquiz/mechanics/special-topics',
    prerequisites: ['MCH-09', 'MCH-10']
  }
];

const MECHANICS_LAYOUT = [
  { label: 'Tier I', sub: 'Baseline Vectors', cx: 100, ids: ['MCH-01', 'MCH-02'] },
  { label: 'Tier II', sub: 'Dynamic Systems', cx: 280, ids: ['MCH-03', 'MCH-04'] },
  { label: 'Tier III', sub: 'Conservation Laws', cx: 460, ids: ['MCH-05', 'MCH-06', 'MCH-09'] },
  { label: 'Tier IV', sub: 'Advanced Mechanics', cx: 640, ids: ['MCH-07', 'MCH-08'] },
  { label: 'Tier V', sub: 'Complex Systems', cx: 820, ids: ['MCH-10', 'MCH-11'] },
  { label: 'Tier VI', sub: 'Modern Extensions', cx: 1000, ids: ['MCH-12'] },
];

// ─── Electricity & Magnetism Data ───────────────────────────────────────────

const ENM_TEMPLATE: (Omit<TreeNode, 'status'> & { defaultStatus: Status })[] = [
  // Original Nodes (Untouched)
  {
    id: 'ENM-01',
    title: ["Electrostatics"],
    defaultStatus: 'unlocked',
    desc: "Coulomb's law, electric fields, and electric potential.",
    url: '/highschoolquiz/electricity-magnetism/electrostatics',
    prerequisites: []
  },
  {
    id: 'ENM-02',
    title: ["Electric Current", "& Circuits"],
    defaultStatus: 'locked',
    desc: "Ohm's law, Kirchhoff's laws, and circuit analysis.",
    url: '/highschoolquiz/electricity-magnetism/currentcircuits',
    prerequisites: ['ENM-01']
  },
  {
    id: 'ENM-03',
    title: ["Magnetism"],
    defaultStatus: 'locked',
    desc: "Magnetic field lines, fields on moving charges, and materials.",
    url: '/highschoolquiz/electricity-magnetism/magnetism',
    prerequisites: ['ENM-02']
  },
  {
    id: 'ENM-04',
    title: ["Electromagnetic", "Induction"],
    defaultStatus: 'locked',
    desc: "Faraday's law, Lenz's law, and applied induction.",
    url: '/highschoolquiz/electricity-magnetism/induction',
    prerequisites: ['ENM-03']
  },
  // New Higher-Difficulty Nodes
  {
    id: 'ENM-05',
    title: ["AC Circuits"],
    defaultStatus: 'locked',
    desc: "RLC circuits, impedance, phasors, and resonance.",
    url: '/highschoolquiz/electricity-magnetism/ac-circuits',
    prerequisites: ['ENM-04']
  },
  {
    id: 'ENM-06',
    title: ["EM Waves"],
    defaultStatus: 'locked',
    desc: "Maxwell's equations and electromagnetic radiation.",
    url: '/highschoolquiz/electricity-magnetism/em-waves',
    prerequisites: ['ENM-04']
  },
  {
    id: 'ENM-07',
    title: ["Optics"],
    defaultStatus: 'locked',
    desc: "Geometric optics, diffraction, and wave interference.",
    url: '/highschoolquiz/electricity-magnetism/optics',
    prerequisites: ['ENM-06']
  },
];

const ENM_LAYOUT = [
  { label: 'Tier I', sub: 'Static Charges', cx: 100, ids: ['ENM-01'] },
  { label: 'Tier II', sub: 'Dynamic Currents', cx: 280, ids: ['ENM-02'] },
  { label: 'Tier III', sub: 'Magnetic Fields', cx: 460, ids: ['ENM-03'] },
  { label: 'Tier IV', sub: 'Electrodynamics', cx: 640, ids: ['ENM-04'] },
  { label: 'Tier V', sub: 'Wave Phenomena', cx: 820, ids: ['ENM-05', 'ENM-06'] },
  { label: 'Tier VI', sub: 'Light & Optics', cx: 1000, ids: ['ENM-07'] },
];

// ─── Helper Functions ──────────────────────────────────────────────────────────

function buildTree(progress: ProgressMap, template: typeof MECHANICS_TEMPLATE, layout: typeof MECHANICS_LAYOUT): Tier[] {
  const nodeMap = Object.fromEntries(
    template.map(n => [n.id, n])
  );

  return layout.map(tier => ({
    label: tier.label,
    sub: tier.sub,
    cx: tier.cx,
    nodes: tier.ids.map(id => ({
      ...nodeMap[id],
      status: progress[id] ?? nodeMap[id].defaultStatus,
    })),
  }));
}

function nodeY(_ti: number, ni: number, total: number): number {
  if (total === 1) return 210;
  if (total === 2) return ni === 0 ? 140 : 280;
  return ni === 0 ? 100 : ni === 1 ? 210 : 320;
}

// ─── HexNode Component ────────────────────────────────────────────────────────

function HexNode({ node, cx, cy, delay, onNavigate }: {
  node: TreeNode; cx: number; cy: number; delay: number;
  onNavigate: (url: string) => void;
}) {
  const R = 34;

  function hex(r: number) {
    return [0, 1, 2, 3, 4, 5].map(i => {
      const a = (Math.PI / 180) * (60 * i - 90);
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(' ');
  }

  const colors = {
    mastered: { stroke: '#10b981', fill: '#0a1a12', innerFill: '#0f2a1c', text: '#d1fae5', id: '#10b981', badge: '#10b981', badgeBg: 'rgba(16,185,129,0.15)', label: 'Mastered', dotFill: '#10b981' },
    unlocked: { stroke: '#4f8ef7', fill: '#050d1f', innerFill: '#081428', text: '#bfdbfe', id: '#4f8ef7', badge: '#4f8ef7', badgeBg: 'rgba(79,142,247,0.15)', label: 'Unlocked', dotFill: '#4f8ef7' },
    locked: { stroke: '#2a2a3a', fill: '#08080f', innerFill: '#08080f', text: '#2e2e48', id: '#2a2a3a', badge: '#2a2a3a', badgeBg: 'rgba(42,42,58,0.3)', label: 'Locked', dotFill: '#2a2a3a' },
  };

  const c = colors[node.status];
  const isNavigable = node.status !== 'locked';

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.7 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay, ease: 'backOut' }}
      onClick={() => { if (isNavigable) onNavigate(node.url); }}
      style={{ cursor: isNavigable ? 'pointer' : 'not-allowed' }}
    >
      {node.status === 'unlocked' && (
        <circle cx={cx} cy={cy} r={R + 6} fill="none" stroke={c.stroke} strokeWidth={0.8} opacity={0.4}
          style={{ animation: 'pulseTechRing 1.8s ease-out infinite' }} />
      )}
      {node.status === 'mastered' && (<>
        <circle cx={cx} cy={cy} r={R + 8} fill="none" stroke={c.stroke} strokeWidth={0.5} opacity={0.2} />
        <circle cx={cx} cy={cy} r={R + 4} fill="none" stroke={c.stroke} strokeWidth={0.5} opacity={0.35} />
      </>)}

      <polygon points={hex(R)} fill={c.fill} stroke={c.stroke} strokeWidth={node.status === 'locked' ? 1 : 1.5} opacity={node.status === 'locked' ? 0.6 : 1} />
      <polygon points={hex(R - 6)} fill={c.innerFill} stroke={c.stroke} strokeWidth={0.5} opacity={0.5} />

      {node.status === 'mastered' && (
        <polyline points={`${cx - 9},${cy} ${cx - 3},${cy + 8} ${cx + 9},${cy - 8}`}
          fill="none" stroke={c.stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      )}
      {node.status === 'unlocked' && (<g>
        <line x1={cx - 9} y1={cy} x2={cx + 9} y2={cy} stroke={c.stroke} strokeWidth={1.8} strokeLinecap="round" />
        <polyline points={`${cx + 5},${cy - 4} ${cx + 9},${cy} ${cx + 5},${cy + 4}`}
          fill="none" stroke={c.stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </g>)}
      {node.status === 'locked' && (<g>
        <rect x={cx - 7} y={cy - 4} width={14} height={10} rx={2.5} fill="none" stroke={c.stroke} strokeWidth={1.5} />
        <path d={`M${cx - 4} ${cy - 4} C${cx - 4} ${cy - 10} ${cx + 4} ${cy - 10} ${cx + 4} ${cy - 4}`}
          fill="none" stroke={c.stroke} strokeWidth={1.5} />
        <circle cx={cx} cy={cy + 1} r={1.8} fill={c.stroke} />
      </g>)}

      <circle cx={cx} cy={cy - R} r={3} fill={c.dotFill} opacity={node.status === 'locked' ? 0.4 : 1} />

      <text x={cx} y={cy + R + 14} textAnchor="middle"
        style={{ fontFamily: 'monospace', fontSize: '8px', fontWeight: 500, fill: c.id }}>
        {node.id}
      </text>
      {node.title.map((line, i) => (
        <text key={i} x={cx} y={cy + R + 30 + i * 13} textAnchor="middle"
          style={{ fontFamily: 'inherit', fontSize: '10px', fontWeight: 500, fill: c.text }}>
          {line}
        </text>
      ))}
      <rect x={cx - 30} y={cy + R + 30 + node.title.length * 13} width={60} height={14} rx={7} fill={c.badgeBg} />
      <text x={cx} y={cy + R + 40 + node.title.length * 13} textAnchor="middle"
        style={{ fontFamily: 'inherit', fontSize: '8px', fontWeight: 500, fill: c.badge }}>
        {c.label}
      </text>
    </motion.g>
  );
}

// ─── Connectors Component ────────────────────────────────────────────────────

function DynamicConnectors({ tree }: { tree: Tier[] }) {
  const links: any[] = [];

  for (let ti = 0; ti < tree.length - 1; ti++) {
    const currentTier = tree[ti];
    const nextTier = tree[ti + 1];

    currentTier.nodes.forEach((nodeA, niA) => {
      const x1 = currentTier.cx + 34;
      const y1 = nodeY(ti, niA, currentTier.nodes.length);

      nextTier.nodes.forEach((nodeB, niB) => {
        // Evaluate connection if Node B explicitly depends on Node A
        if (!nodeB.prerequisites?.includes(nodeA.id)) return;

        const x2 = nextTier.cx - 34;
        const y2 = nodeY(ti + 1, niB, nextTier.nodes.length);

        let pathClass = 'dim';
        if (nodeA.status === 'mastered') {
          if (nodeB.status === 'mastered') pathClass = 'green';
          else if (nodeB.status === 'unlocked') pathClass = 'blue';
        }

        links.push({ x1, y1, x2, y2, pathClass, key: `${nodeA.id}-${nodeB.id}` });
      });
    });
  }

  return (
    <g>
      {links.map(({ x1, y1, x2, y2, pathClass, key }) => {
        const d = `M${x1} ${y1} C${(x1 + x2) / 2} ${y1} ${(x1 + x2) / 2} ${y2} ${x2} ${y2}`;

        if (pathClass === 'green') {
          return <path key={key} fill="none" stroke="#10b981" strokeWidth={1.5} d={d} markerEnd="url(#arr-green)" />;
        }
        if (pathClass === 'blue') {
          return <path key={key} fill="none" stroke="#4f8ef7" strokeWidth={1.5} strokeDasharray="6 3" d={d} markerEnd="url(#arr-blue)" />;
        }
        return <path key={key} fill="none" stroke="#333" strokeWidth={1.5} strokeDasharray="4 4" d={d} markerEnd="url(#arr-dim)" />;
      })}
    </g>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RoadmapPage() {
  const router = useRouter();
  const [mechanicsTree, setMechanicsTree] = useState<Tier[]>(buildTree({}, MECHANICS_TEMPLATE, MECHANICS_LAYOUT));
  const [enmTree, setEnmTree] = useState<Tier[]>(buildTree({}, ENM_TEMPLATE, ENM_LAYOUT));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setMechanicsTree(buildTree({}, MECHANICS_TEMPLATE, MECHANICS_LAYOUT));
        setEnmTree(buildTree({}, ENM_TEMPLATE, ENM_LAYOUT));
        setLoading(false);
        return;
      }

      try {
        // Fetch Mechanics progress
        const mechSnap = await getDoc(doc(db, 'users', user.uid, 'progress', 'mechanics'));
        const mechProgress = (mechSnap.exists() ? mechSnap.data() : {}) as ProgressMap;
        setMechanicsTree(buildTree(mechProgress, MECHANICS_TEMPLATE, MECHANICS_LAYOUT));

        // Fetch Electricity & Magnetism progress
        const enmSnap = await getDoc(doc(db, 'users', user.uid, 'progress', 'electricity-magnetism'));
        const enmProgress = (enmSnap.exists() ? enmSnap.data() : {}) as ProgressMap;
        setEnmTree(buildTree(enmProgress, ENM_TEMPLATE, ENM_LAYOUT));

      } catch (err) {
        console.error('Failed to fetch progress:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const renderMapSvg = (tree: Tier[]) => (
    <div className="overflow-x-auto pb-4 -mx-4 px-4 mb-20 scrollbar-hide">
      {/* Updated viewBox to 1100 width to account for Tier V and VI (cx up to 1000) */}
      <svg viewBox="0 0 1100 430" style={{ minWidth: 1000, width: '100%', display: 'block' }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arr-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth={5} markerHeight={5} orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#10b981" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          <marker id="arr-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth={5} markerHeight={5} orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#4f8ef7" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          <marker id="arr-dim" viewBox="0 0 10 10" refX="8" refY="5" markerWidth={5} markerHeight={5} orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#444" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>

        {tree.map((tier) => (
          <g key={tier.label}>
            <text x={tier.cx} y={20} textAnchor="middle"
              style={{ fontFamily: 'monospace', fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em', fill: '#555', textTransform: 'uppercase' }}>
              {tier.label}
            </text>
            <text x={tier.cx} y={33} textAnchor="middle" style={{ fontFamily: 'inherit', fontSize: '9px', fill: '#444' }}>
              {tier.sub}
            </text>
          </g>
        ))}

        {/* Updated dashed divider lines mapping to include the gaps before new tiers */}
        {[190, 370, 550, 730, 910].map(x => (
          <line key={x} x1={x} y1={42} x2={x} y2={400} stroke="#ffffff10" strokeWidth={0.5} strokeDasharray="4 4" />
        ))}

        <DynamicConnectors tree={tree} />

        {tree.map((tier, ti) =>
          tier.nodes.map((node, ni) => (
            <HexNode
              key={node.id}
              node={node}
              cx={tier.cx}
              cy={nodeY(ti, ni, tier.nodes.length)}
              delay={ti * 0.1 + ni * 0.08}
              onNavigate={(url) => router.push(url)}
            />
          ))
        )}

        <g transform="translate(20, 410)">
          {[
            { color: '#10b981', label: 'Mastered' },
            { color: '#4f8ef7', label: 'Unlocked' },
            { color: '#2a2a3a', label: 'Locked' },
          ].map(({ color, label }, i) => (
            <g key={label} transform={`translate(${i * 90}, 0)`}>
              <circle cx={6} cy={6} r={5} fill={color} opacity={0.2} stroke={color} strokeWidth={1} />
              <circle cx={6} cy={6} r={3} fill={color} />
              <text x={16} y={10} style={{ fontFamily: 'inherit', fontSize: '9px', fill: '#555' }}>
                {label}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );

  return (
    <main className="page-wrapper min-h-screen px-4 pb-20">
      <style>{`
        @keyframes pulseTechRing {
          0%   { r: 40; opacity: 0.5; }
          100% { r: 52; opacity: 0;   }
        }
      `}</style>

      <div className="max-w-[1200px] mx-auto">
        {/* Main Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-white font-heading tracking-tight mb-4">
            Curriculum <span className="text-[#a78bfa]">Node Trees</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Progress sequentially through the physics architectures. Mastering nodes unlocks subsequent units.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-zinc-600 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Map 1: Mechanics */}
            <div className="mb-6">
              <div className="inline-block px-3 py-1 mb-2 text-xs font-mono text-[#a78bfa] bg-[#a78bfa]/10 border border-[#a78bfa]/20 rounded-full">
                Branch 01 // Classical Mechanics
              </div>
            </div>
            {renderMapSvg(mechanicsTree)}

            <hr className="border-zinc-800 my-12" />

            {/* Map 2: Electricity and Magnetism */}
            <div className="mb-6">
              <div className="inline-block px-3 py-1 mb-2 text-xs font-mono text-[#3b82f6] bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded-full">
                Branch 02 // Electricity & Magnetism
              </div>
            </div>
            {renderMapSvg(enmTree)}
          </>
        )}
      </div>
    </main>
  );
}