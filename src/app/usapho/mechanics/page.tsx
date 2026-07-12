"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import styles from "../usa.module.css";

const Mech_SUBTOPICS = [
  {
    id: "USA_01",
    title: "Advanced Fluid Mechanics and Non-Inertial Hydrodynamics",
    desc: "Analysis of fluids using calculus. Covers pressure gradients in accelerating and rotating reference frames, time-dependent draining using differential equations, and viscous fluid flow approximations.",
    slug: "advanced-fluid-mechanics"
  },
  {
    id: "USA_02",
    title: "Arbitrary Potential Wells and Approximated Oscillations",
    desc: "Deriving equations of motion for complex systems. Covers Taylor series expansions of potential energy U(x) about stable equilibria to find angular frequency, damped harmonic motion, and driven resonance.",
    slug: "complex-oscillations"
  },
  {
    id: "USA_03",
    title: "3D Rigid Body Mechanics and Variable Contact Constraints",
    desc: "Advanced rotational dynamics. Covers simultaneous translation and rotation, angular momentum tensors, transition from slipping to rolling, and non-fixed axes of rotation.",
    slug: "3d-rigid-bodies"
  },
  {
    id: "USA_04",
    title: "Statically Indeterminate Systems and Continuous Statics",
    desc: "Statics beyond simple torque balance. Covers Young's Modulus and micro-deformations in indeterminate structures, and calculus-based statics for continuous systems like catenary curves.",
    slug: "advanced-statics"
  },
  {
    id: "USA_05",
    title: "Variable Mass Systems and Continuous Mass Distribution",
    desc: "Dynamics of systems changing mass dynamically. Covers the rocket equation, falling chains, and integrating center of mass and gravitational fields for continuous, non-uniform bodies.",
    slug: "variable-mass-systems"
  },
  {
    id: "USA_06",
    title: "Rigid Body Collisions and Rotational Restitution",
    desc: "Complex impact mechanics involving energy and momentum transfer. Covers multi-dimensional impacts between constrained or free rigid bodies, applying the coefficient of restitution to localized contact points.",
    slug: "rotational-collisions"
  },
  {
    id: "USA_07",
    title: "Elliptical Orbits and Gravitational Self-Energy",
    desc: "Advanced celestial mechanics. Covers the vis-viva equation, Keplerian orbital transitions, tidal forces via differential gravitational fields, and computing the gravitational self-energy of spheres.",
    slug: "advanced-celestial-mechanics"
  },
  {
    id: "USA_08",
    title: "Resistive Media and Differential Trajectories",
    desc: "Solving equations of motion under velocity-dependent forces. Covers linear and quadratic drag forces, utilizing separation of variables to derive explicit equations for velocity and position over time.",
    slug: "differential-drag"
  }
];

export default function MechDirectoryPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelectSubtopic = (slug: string, id: string) => {
    setSelectedId(id);
    router.push(`/usapho/mechanics/${slug}`);
  };

  return (
    <main className={`page-wrapper ${styles.pageWrapper}`}>
      <div className={styles.inner}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.badge}>SYS_// DIRECTORY_USAPHO_Mechancis</div>
          <h1 className={styles.title}>
            USAPhO <span className={styles.titleAccent}>Section</span>
          </h1>
          <p className={styles.subtitle}>
            Select a specific subtopic below to calibrate the GPT 5.4 diagnostic engine and begin your evaluation.
          </p>
        </div>

        {/* Directory Grid */}
        <div className={styles.grid}>
          {Mech_SUBTOPICS.map((sub) => {
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