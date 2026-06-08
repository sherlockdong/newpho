"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import styles from "../hsdirectory.module.css";

const MECHANICS_SUBTOPICS = [
  {
    id: "MECH_01",
    title: "Newton's First Law of Motion — Inertia",
    desc: "Objects at rest stay at rest and objects in motion stay in motion unless acted upon by a net external force. Explores inertia, balanced forces, and reference frames.",
    slug: "newtons-first-law",
  },
  {
    id: "MECH_02",
    title: "Linear Motion",
    desc: "Kinematics of motion in a straight line: displacement, velocity, acceleration, and the SUVAT equations for uniformly accelerated motion.",
    slug: "linear-motion",
  },
  {
    id: "MECH_03",
    title: "Newton's Second Law of Motion",
    desc: "The relationship between net force, mass, and acceleration (F = ma). Covers free-body diagrams, normal forces, friction, and coupled systems.",
    slug: "newtons-second-law",
  },
  {
    id: "MECH_04",
    title: "Newton's Third Law of Motion",
    desc: "For every action there is an equal and opposite reaction. Explores action-reaction pairs, contact forces, and common misconceptions.",
    slug: "newtons-third-law",
  },
  {
    id: "MECH_05",
    title: "Momentum",
    desc: "Linear momentum, impulse, and the conservation of momentum in collisions. Covers elastic vs. inelastic collisions and center-of-mass motion.",
    slug: "momentum",
  },
  {
    id: "MECH_06",
    title: "Energy",
    desc: "Kinetic and potential energy, the work-energy theorem, and conservation of mechanical energy. Includes power, efficiency, and non-conservative forces.",
    slug: "energy",
  },
  {
    id: "MECH_07",
    title: "Rotational Motion",
    desc: "Angular kinematics, torque, moment of inertia, and rotational analogues of Newton's laws. Covers rolling without slipping and angular momentum conservation.",
    slug: "rotational-motion",
  },
  {
    id: "MECH_08",
    title: "Gravity",
    desc: "Newton's law of universal gravitation, gravitational fields, and gravitational potential energy. Introduces orbital mechanics and escape velocity.",
    slug: "gravity",
  },
  {
    id: "MECH_09",
    title: "Projectile and Satellite Motion",
    desc: "Two-dimensional kinematics treating horizontal and vertical motion independently. Extends to circular orbits and the conditions for satellite flight.",
    slug: "projectile-and-satellite-motion",
  },
];

export default function MechanicsDirectoryPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelectSubtopic = (slug: string, id: string) => {
    setSelectedId(id);
    router.push(`/highschoolquiz/mechanics/${slug}`);
  };

  return (
    <main className={`page-wrapper ${styles.pageWrapper}`}>
      <div className={styles.inner}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.badge}>SYS_// DIRECTORY_MECHANICS</div>
          <h1 className={styles.title}>
            Mechanics <span className={styles.titleAccent}>Section</span>
          </h1>
          <p className={styles.subtitle}>
            Select a specific subtopic below to calibrate the GPT-4o diagnostic engine and begin your evaluation.
          </p>
        </div>

        {/* Directory Grid */}
        <div className={styles.grid}>
          {MECHANICS_SUBTOPICS.map((sub) => {
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