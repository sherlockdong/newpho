"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import styles from "../usa.module.css";

const waves_SUBTOPICS = [
  {
    id: "USA_09",
    title: "Mechanical Waves, Standing Modes, and Acoustics",
    desc: "The physics of continuous media. Covers the classical wave equation, boundary reflections, phase shifts, standing waves in strings and columns, sound intensity, and the relativistic/non-relativistic Doppler effect.",
    slug: "mechanical-waves"
  },
  {
    id: "USA_10",
    title: "Geometrical Optics and Optical Instrument Matrix Analysis",
    desc: "Light behavior as rays. Covers Fermat's Principle, Snell's law, derivation of the mirror and thin-lens equations, thick lenses, spherical aberration, and tracing rays through multi-component optical systems.",
    slug: "geometrical-optics"
  },
  {
    id: "USA_11",
    title: "Wave Optics, Interference, and Diffraction Regimes",
    desc: "Light behavior as a wave. Covers Huygens' principle, thin-film interference, double-slit interference, single-slit diffraction patterns, diffraction gratings, and resolution limits via Rayleigh's criterion.",
    slug: "wave-optics"
  }
];

export default function wavesDirectoryPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelectSubtopic = (slug: string, id: string) => {
    setSelectedId(id);
    router.push(`/usapho/wavesoptics/${slug}`);
  };

  return (
    <main className={`page-wrapper ${styles.pageWrapper}`}>
      <div className={styles.inner}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.badge}>SYS_// DIRECTORY_USAPHO</div>
          <h1 className={styles.title}>
            Waves and Optics <span className={styles.titleAccent}>Section</span>
          </h1>
          <p className={styles.subtitle}>
            Select a specific subtopic below to calibrate the GPT-4o diagnostic engine and begin your evaluation.
          </p>
        </div>

        {/* Directory Grid */}
        <div className={styles.grid}>
          {waves_SUBTOPICS.map((sub) => {
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