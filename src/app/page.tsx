'use client';
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAuth,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

import { app } from "../firebase";
import { motion } from "framer-motion";
const auth = getAuth(app);
export default function Home() {
  const wordVariants = {
    hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring" as const, stiffness: 100, damping: 10 }
    },
  } satisfies import("framer-motion").Variants;
  const titleVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3, // Waits 0.3 seconds between each word
      },
    },
  };
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [user, setUser] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Header hide/show on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPosition = window.scrollY;
      if (currentScrollPosition > lastScrollPosition && currentScrollPosition > 50) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      setLastScrollPosition(currentScrollPosition);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollPosition]);


  return (
    <div>
      {/* main-area */}
      <main className="main-area fix">

        {/* banner-area */}
        <div className="banner__content">

          {/* The Sequenced Title Reveal */}
          <motion.h2
            className="title flex flex-wrap gap-x-4" // Tailwind flex spacing
            variants={titleVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.span variants={wordVariants} className="inline-block">Physics</motion.span>
            <motion.span variants={wordVariants} className="inline-block">Olympiad</motion.span>
            <motion.span variants={wordVariants} className="inline-block">Guide</motion.span>
          </motion.h2>

          {/* The Scroll-Revealed Subsequent Content */}
          {/* whileInView ensures this waits for scroll interaction */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }} // Change 0.5 → 0.1
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              marginLeft: "calc(2rem + 10em)",
              marginTop: "20px",
              display: "flex",
              fontSize: "clamp(1rem, 1.6vw, 1.35rem)",
              lineHeight: "1.7",
              flexDirection: "column",
            }}>
            <p>
              An AI-Human hybrid-powered database to improve your physics to the Olympics level.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                marginTop: "1.8rem",
              }}
            >
              <Link href="/rout">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="tg-btn"
                >
                  Get Started
                </motion.button>
              </Link>

              <Link
                href="https://docs.google.com/forms/d/e/1FAIpQLSflTs0ozLAA9kpegXVZtVitpatSoHpGaI2Gqe6AFgxUvCeErg/viewform?usp=dialog"
                target="_blank"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="tg-btn"
                >
                  We need your contribution! Apply now
                </motion.button>
              </Link>
            </div>
          </motion.div>



        </div>
        {/* banner-area-end */}
        {/* =========================================
            FEATURES AREA (About Us Section)
            ========================================= */}
        <section id="features" className="section-shell border-b border-zinc-900/50">
          <div className="section-container"
            style={{

              marginLeft: "calc(2rem + 10em)",
            }}>

            {/* Section Header */}
            <div className="mb-16 text-center md:text-left">
              <span className="section-label">Institutional Framework</span>
              <h2 className="section-title">About <span>Us</span></h2>
            </div>

            {/* Grid Layout Container */}
            {/* Using a custom responsive CSS grid that perfectly matches a 1100px chassis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

              {/* Card 1: Who are "we"? */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ type: "spring", stiffness: 80, damping: 14 }}
                className="feature-card"
              >
                <div className="feature-content">
                  <h4 className="feature-title">Who are "we"?</h4>
                  <p className="feature-desc">
                    We are current high school students who share a deep passion for advanced theoretical physics, and hope to share our structural insights with those aiming to excel in this amazing subject.
                    The greater our collaborative network, the more formidable our combined framework becomes. If you are driven to join and build this project together, please connect with us.
                  </p>
                </div>
              </motion.div>

              {/* Card 2: How is PHO-Guide special? */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ type: "spring", stiffness: 80, damping: 14, delay: 0.15 }}
                className="feature-card"
              >
                <div className="feature-content">
                  <h4 className="feature-title">How is PHO-Guide special?</h4>
                  <p className="feature-desc">
                    This analytical space compiles high-level insights from physics Olympiads across different global sectors, categorized explicitly by problem archetypes encountered in competitive contexts.
                    Additionally, it provisions essential foundational core physics vectors for high school and middle school tracks to stabilize their developmental path toward modern research mechanics.
                  </p>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* GitHub Contact Section */}
        <div className="github-section-wrapper">
          <Link
            target="_blank"
            href="https://github.com/sherlockdong/newpho"
            className="github-card"
          >
            {/* Logo */}
            <img
              src="/assets/img/icon/GitHub_Logo_White.png"
              alt="GitHub Logo"
              className="github-logo"
            />

            {/* Title */}
            <h4 className="github-title">View on GitHub</h4>

            {/* Subtitle */}
            <p className="github-subtitle">sherlockdong/newpho</p>

            {/* Placeholder contact fields */}
            <div className="github-form-container">
              <input
                type="text"
                placeholder="Your name"
                onClick={(e) => e.preventDefault()}
                className="github-input"
              />
              <input
                type="email"
                placeholder="Your email"
                onClick={(e) => e.preventDefault()}
                className="github-input"
              />
              <textarea
                placeholder="Your message"
                rows={3}
                onClick={(e) => e.preventDefault()}
                className="github-input"
              />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}