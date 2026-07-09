"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import styles from "../usa.module.css";

const relativity_SUBTOPICS = [
  {
    id: "USA_19",
    title: "Special Relativity and Relativistic Mechanics",
    desc: "Space-time mechanics at high velocities. Covers the Michelson-Morley experiment, Lorentz transformations, time dilation, length contraction, relativistic velocity addition, four-momentum, and energy-momentum invariants.",
    slug: "special-relativity"
  },
  {
    id: "USA_20",
    title: "Quantum Mechanics, Photons, and Atomic Structure",
    desc: "Early quantum theory and foundations. Covers the photoelectric effect, Compton scattering, de Broglie wavelength, Heisenberg uncertainty principle, Bohr model of the atom, and the 1D time-independent Schrödinger equation.",
    slug: "quantum-and-atomic"
  },
  {
    id: "USA_21",
    title: "Nuclear Physics, Radioactive Decay, and Particle Reactions",
    desc: "Subatomic interactions. Covers nuclear binding energy, mass defect, alpha/beta/gamma decay kinetics, fission and fusion energetics, the Standard Model basics, and conservation laws in high-energy particle collisions.",
    slug: "nuclear-and-particle"
  }
];

export default function relativityDirectoryPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelectSubtopic = (slug: string, id: string) => {
    setSelectedId(id);
    router.push(`/usapho/relativity/${slug}`);
  };

  return (
    <main className={`page-wrapper ${styles.pageWrapper}`}>
      <div className={styles.inner}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.badge}>SYS_// DIRECTORY_USAPHO</div>
          <h1 className={styles.title}>
            Relativity and Modern Physics <span className={styles.titleAccent}>Section</span>
          </h1>
          <p className={styles.subtitle}>
            Select a specific subtopic below to calibrate the GPT 5.4 diagnostic engine and begin your evaluation.
          </p>
        </div>

        {/* Directory Grid */}
        <div className={styles.grid}>
          {relativity_SUBTOPICS.map((sub) => {
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