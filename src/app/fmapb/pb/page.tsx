"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import styles from "../fmapb.module.css";

const PB_SUBTOPICS = [
  {
    id: "PB_01",
    title: "Thermodynamics and Kinetic Theory",
    desc: "Thermal behavior of matter and heat energy. Covers the Zeroth, First, and Second Laws of Thermodynamics, ideal gas laws, kinetic theory, internal energy, PV diagrams, and thermodynamic cycles (Carnot, efficiency).",
    slug: "thermodynamics-kinetic-theory",
  },
  {
    id: "PB_02",
    title: "Electrostatics and DC Circuits",
    desc: "The behavior of electric charges at rest and in steady currents. Covers Coulomb's Law, electric fields, electric potential, Gauss's Law, capacitance, Ohm's Law, and complex resistor-capacitor DC circuit analysis.",
    slug: "electrostatics-and-circuits",
  },
  {
    id: "PB_03",
    title: "Magnetism and Electromagnetic Induction",
    desc: "Magnetic fields and their interactions with moving charges and time-varying fields. Covers the Lorentz force, Biot-Savart Law, Ampere's Law, Faraday's Law of induction, Lenz's Law, and inductors.",
    slug: "magnetism-and-induction",
  },
  {
    id: "PB_04",
    title: "Waves and Geometric Optics",
    desc: "Mechanics of wave propagation and light behavior. Covers wave properties, standing waves, the Doppler effect, physical optics (interference, diffraction), reflection, refraction, Snell's Law, mirrors, and lenses.",
    slug: "waves-and-optics",
  },
  {
    id: "PB_05",
    title: "Modern Physics and Quantum Phenomena",
    desc: "Physics of the subatomic and relativistic domains. Covers Special Relativity (time dilation, Lorentz factor), the photoelectric effect, wave-particle duality, de Broglie wavelength, Bohr atom, and nuclear physics.",
    slug: "modern-and-quantum-physics",
  },
  {
    id: "PB_06",
    title: "Physics History, Discoveries, and Trivia",
    desc: "Contextual and historic knowledge evaluated on the PhysicsBowl. Covers landmark historical experiments, timelines of major discoveries, notable physicists, Nobel Prize history, and contemporary breakthrough discoveries.",
    slug: "history-and-trivia",
  }
];

export default function PBDirectoryPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelectSubtopic = (slug: string, id: string) => {
    setSelectedId(id);
    router.push(`/fmapb/pb/${slug}`);
  };

  return (
    <main className={`page-wrapper ${styles.pageWrapper}`}>
      <div className={styles.inner}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.badge}>SYS_// DIRECTORY_PB</div>
          <h1 className={styles.title}>
            Physics Bowl <span className={styles.titleAccent}>Section</span>
          </h1>
          <p className={styles.subtitle}>
            Select a specific subtopic below to calibrate the GPT 5.4 diagnostic engine and begin your evaluation.
          </p>
        </div>

        {/* Directory Grid */}
        <div className={styles.grid}>
          {PB_SUBTOPICS.map((sub) => {
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