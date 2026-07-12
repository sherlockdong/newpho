"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import styles from "../fmapb.module.css";

const FMA_SUBTOPICS = [
  {
    id: "FMA_01",
    title: "Fluid Statics and Dynamics",
    desc: "The behavior of fluids at rest and in motion. Covers density, pressure, Archimedes' principle of buoyancy, the continuity equation, and Bernoulli's equation with applications to fluid flow.",
    slug: "fluid-mechanics",
  },
  {
    id: "FMA_02",
    title: "Simple Harmonic Motion and Oscillations",
    desc: "Kinematics and dynamics of oscillatory systems. Covers spring-mass systems, simple and physical pendulums, angular frequency, energy in SHM, and specialized oscillations like liquid in a U-tube.",
    slug: "oscillatory-motion",
  },
  {
    id: "FMA_03",
    title: "Advanced Rigid Body Dynamics",
    desc: "Deep dive into rotational mechanics. Covers the parallel and perpendicular axis theorems, rolling with and without slipping, rotational kinetic energy, angular impulse, and torque-driven angular acceleration.",
    slug: "advanced-rigid-bodies",
  },
  {
    id: "FMA_04",
    title: "Statics and Mechanical Equilibrium",
    desc: "The study of rigid bodies in static equilibrium. Focuses on the concurrent balance of net forces and net torques, determining pivot points, string tensions, friction thresholds, and conditions for tipping vs. slipping.",
    slug: "statics-and-equilibrium",
  },
  {
    id: "FMA_05",
    title: "Systems of Particles and Center of Mass",
    desc: "Dynamics of multi-particle systems. Covers locating the center of mass for discrete and continuous bodies, the motion of the center of mass under external forces, and conservative internal systems.",
    slug: "systems-of-masses",
  },
  {
    id: "FMA_06",
    title: "Advanced Collisions and Restitution",
    desc: "Analysis of complex impact mechanics. Covers two-dimensional elastic and inelastic collisions, center-of-mass reference frames, and the coefficient of restitution applied to bouncing objects and multi-stage impacts.",
    slug: "advanced-collisions",
  },
  {
    id: "FMA_07",
    title: "Orbital Mechanics and Advanced Gravity",
    desc: "Advanced applications of gravitational force. Covers Kepler's laws of planetary motion, gravitational potential energy configurations, gravitational self-energy, shell theorem, and elliptic or circular orbital transitions.",
    slug: "advanced-gravity",
  },
  {
    id: "FMA_08",
    title: "Dimensional Analysis, Scaling, and Error Propagation",
    desc: "Foundational mathematical tools for physics competitions. Covers verifying equations using SI units, scaling laws to predict system changes, estimating uncertainties, and calculating error propagation.",
    slug: "dimensional-analysis-and-error",
  },
  {
    id: "FMA_09",
    title: "Non-Conservative Forces and Resistive Media",
    desc: "Dynamics under velocity-dependent forces. Covers fluid drag, terminal velocity, air resistance, and energy dissipation in mechanical systems, often utilizing linear approximations or graphical data.",
    slug: "resistive-forces-and-drag",
  },
  {
    id: "FMA_10",
    title: "Potential Energy Curves and Stability",
    desc: "Graphical and analytical approach to conservative systems. Interpreting potential energy functions U(x) to determine force profiles, identify equilibrium positions, and evaluate stable vs. unstable system configurations.",
    slug: "potential-energy-stability",
  }
];

export default function FMADirectoryPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelectSubtopic = (slug: string, id: string) => {
    setSelectedId(id);
    router.push(`/fmapb/fma/${slug}`);
  };

  return (
    <main className={`page-wrapper ${styles.pageWrapper}`}>
      <div className={styles.inner}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.badge}>SYS_// DIRECTORY_FMA</div>
          <h1 className={styles.title}>
            F=ma <span className={styles.titleAccent}>Section</span>
          </h1>
          <p className={styles.subtitle}>
            Select a specific subtopic below to calibrate the GPT 5.4 diagnostic engine and begin your evaluation.
          </p>
        </div>

        {/* Directory Grid */}
        <div className={styles.grid}>
          {FMA_SUBTOPICS.map((sub) => {
            const isActive = selectedId === sub.id;
            return (
              <motion.div
                key={sub.id}
                whileHover={{ y: -4 }}
                onClick={() => handleSelectSubtopic(sub.slug, sub.id)}
                className={`${styles.card} ${isActive ? styles.active : ""}`}
              >
                {/* Dot indicator */}
                <div className={styles.dotWrapper}>
                  <div className={`${styles.dot} ${isActive ? styles.dotActive : ""}`} />
                </div>

                <div className={styles.cardId}>{sub.id}</div>
                <h3 className={styles.cardTitle}>{sub.title}</h3>
                <p className={styles.cardDesc}>{sub.desc}</p>

                {/* Arrow footer */}
                <div className={styles.cardFooter}>
                  <span>OPEN PROTOCOL</span>
                  <svg
                    className={styles.arrowIcon}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </main>
  );
}