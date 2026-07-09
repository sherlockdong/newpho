"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import styles from "../usa.module.css";

const thermo_SUBTOPICS = [
  {
    id: "USA_17",
    title: "Kinetic Theory, Statistical Transport, and Calorimetry",
    desc: "Microscopic thermal physics. Covers the Maxwell-Boltzmann distribution, root-mean-square speed, mean free path, internal energy degrees of freedom, equipartition theorem, and complex multi-phase calorimetry.",
    slug: "kinetic-theory-gases"
  },
  {
    id: "USA_18",
    title: "Thermodynamic Cycles and Entropy Formulations",
    desc: "Macroscopic thermal systems. Covers the First and Second Laws of Thermodynamics, calculating work, heat, and internal energy changes along arbitrary p-V pathways, Carnot cycles, and calculus-based entropy changes.",
    slug: "thermodynamic-cycles"
  }
]
export default function thermoDirectoryPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelectSubtopic = (slug: string, id: string) => {
    setSelectedId(id);
    router.push(`/usapho/thermo/${slug}`);
  };

  return (
    <main className={`page-wrapper ${styles.pageWrapper}`}>
      <div className={styles.inner}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.badge}>SYS_// DIRECTORY_USAPhO</div>
          <h1 className={styles.title}>
            Thermodynamics <span className={styles.titleAccent}>Section</span>
          </h1>
          <p className={styles.subtitle}>
            Select a specific subtopic below to calibrate the GPT 5.4 diagnostic engine and begin your evaluation.
          </p>
        </div>

        {/* Directory Grid */}
        <div className={styles.grid}>
          {thermo_SUBTOPICS.map((sub) => {
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