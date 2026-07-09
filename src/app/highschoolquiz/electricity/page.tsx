"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import styles from "../hsdirectory.module.css";

const ELECTRICITY_SUBTOPICS = [
  {
    id: "ENM_01",
    title: "Electrostatics",
    desc: "The study of electric charges at rest and the forces they exert on each other. Covers Coulomb's law, electric fields, and electric potential.",
    slug: "electrostatics",
  },
  {
    id: "ENM_02",
    title: "Electric Current and Circuits",
    desc: "The flow of electric charge and the behavior of current in various circuit configurations. Covers Ohm's law, Kirchhoff's laws, and circuit analysis.",
    slug: "currentcircuits",
  },
  {
    id: "ENM_03",
    title: "Magnetism",
    desc: "The study of magnetic fields and the forces they exert on moving charges and magnetic materials. Covers magnetic field lines, electromagnetic induction, and Faraday's law.",
    slug: "magnetism",
  },
  {
    id: "ENM_04",
    title: "Electromagnetic Induction",
    desc: "The process of generating an electric current in a conductor by changing the magnetic field around it. Covers Faraday's law, Lenz's law, and applications of electromagnetic induction.",
    slug: "induction",
  },
];

export default function ElectricityDirectoryPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelectSubtopic = (slug: string, id: string) => {
    setSelectedId(id);
    router.push(`/highschoolquiz/electricity/${slug}`);
  };

  return (
    <main className={`page-wrapper ${styles.pageWrapper}`}>
      <div className={styles.inner}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.badge}>SYS_// DIRECTORY_ELECTRICITY</div>
          <h1 className={styles.title}>
            Electricity and Magnetism <span className={styles.titleAccent}>Section</span>
          </h1>
          <p className={styles.subtitle}>
            Select a specific subtopic below to calibrate the GPT 5.4 diagnostic engine and begin your evaluation.
          </p>
        </div>

        {/* Directory Grid */}
        <div className={styles.grid}>
          {ELECTRICITY_SUBTOPICS.map((sub) => {
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