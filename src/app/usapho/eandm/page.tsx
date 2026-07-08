"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import styles from "../usa.module.css";

const EAM_SUBTOPICS = [
  {
    id: "USA_12",
    title: "Electrostatic Fields, Potentials, and Multipole Expansions",
    desc: "Calculus-based electrostatics. Covers Gauss's Law in integral form, calculating electric fields and potentials for arbitrary continuous charge distributions, electrostatic self-energy, and electric dipoles.",
    slug: "advanced-electrostatics"
  },
  {
    id: "USA_13",
    title: "Dielectrics, Capacitance, and Electrostatic Energy Densities",
    desc: "Behavior of electric fields in matter. Covers boundary conditions at interfaces, polarization vectors, calculating capacitance for complex geometries, and energy storage in electric fields.",
    slug: "dielectrics-and-capacitance"
  },
  {
    id: "USA_14",
    title: "DC and Transient RC/LR/LRC Circuits",
    desc: "Time-dependent circuit analysis. Covers Kirchhoff's laws applied via differential equations, transient behavior during charging/discharging, and steady-state AC circuit analysis using complex impedance or phasors.",
    slug: "transient-circuits"
  },
  {
    id: "USA_15",
    title: "Magnetic Fields, Biot-Savart Law, and Ampere's Law",
    desc: "Calculus-based magnetostatics. Covers computing magnetic fields for arbitrary current configurations using the Biot-Savart law, Ampere's law in integral form, and magnetic forces on moving charges/current loops.",
    slug: "magnetostatics"
  },
  {
    id: "USA_16",
    title: "Electromagnetic Induction and Maxwell's Equations",
    desc: "Time-dependent electromagnetic fields. Covers Faraday's Law, Lenz's Law, motional EMF, self and mutual inductance, magnetic energy density, and the integration of Maxwell's displacement current.",
    slug: "electromagnetic-induction"
  }
];

export default function EAMDirectoryPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelectSubtopic = (slug: string, id: string) => {
    setSelectedId(id);
    router.push(`/usapho/eandm/${slug}`);
  };

  return (
    <main className={`page-wrapper ${styles.pageWrapper}`}>
      <div className={styles.inner}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.badge}>SYS_// DIRECTORY_EAM</div>
          <h1 className={styles.title}>
            USAPhO Electricity and Magnetism <span className={styles.titleAccent}>Section</span>
          </h1>
          <p className={styles.subtitle}>
            Select a specific subtopic below to calibrate the GPT-4o diagnostic engine and begin your evaluation.
          </p>
        </div>

        {/* Directory Grid */}
        <div className={styles.grid}>
          {EAM_SUBTOPICS.map((sub) => {
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