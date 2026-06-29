"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { app } from "../../firebase";
import { motion } from "framer-motion";
import styles from "./fmapb.module.css";

const auth = getAuth(app);

export default function FmaIndexPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const topics = [
    { slug: "fma", name: "F=ma", code: "FMA-00" },
    { slug: "pb", name: "Physics Bowl", code: "PB-00" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100 }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [loading, user, router]);

  // Premium Loading State using the CSS Module
  if (loading) {
    return (
      <main className={styles.pageWrapper} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className={styles.loadingBox}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingLabel}>Verifying credentials...</p>
        </div>
      </main>
    );
  }

  // Prevents UI flashing while router.push executes
  if (!user) return null;

  return (
    <main className={styles.pageWrapper}>
      <div className={styles.inner}>

        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.badge}>
            F=ma and Physics Bowl
          </div>
          <h1 className={styles.title}>
            Select Training <span className={styles.titleAccent}>Module</span>
          </h1>
          <p className={styles.subtitle}>
            Choose a specific sub-domain below to initialize your diagnostic quiz. Parameters will scale dynamically based on your performance.
          </p>
        </div>

        {/* The Module Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className={styles.grid}
        >
          {topics.map((topic) => (
            <Link href={`/fmapb/${topic.slug}`} key={topic.slug} style={{ display: 'block', textDecoration: 'none' }}>
              <motion.div
                variants={itemVariants}
                className={styles.card}
              >
                {/* Visual Dot Indicator */}
                <div className={styles.dotWrapper}>
                  <div className={styles.dot}></div>
                </div>

                <div className={styles.cardId}>
                  SYS_// {topic.code}
                </div>

                <h2 className={styles.cardTitle}>
                  {topic.name}
                </h2>

                {/* Footer with animated Emerald Arrow */}
                <div className={styles.cardFooter}>
                  <span>Initialize</span>
                  <svg className={styles.arrowIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>

              </motion.div>
            </Link>
          ))}
        </motion.div>

      </div>
    </main>
  );
}