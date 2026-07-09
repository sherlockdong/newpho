"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  getAuth,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

import { app } from "../../firebase";
import { motion, useScroll, useMotionValueEvent } from "motion/react";

const auth = getAuth(app);

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  // Handle Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Handle Scroll Direction using Motion
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;

    // If we are near the top of the page, always show the header
    if (latest <= 50) {
      setHidden(false);
      return;
    }
    if (latest > previous) {
      setHidden(true); // Scrolling down
    } else {
      setHidden(false); // Scrolling up
    }
  });

  return (
    <motion.header
      className="fixed left-1/2 top-4 z-50 w-max site-header-floating"
      style={{ x: "-50%" }}
      variants={{
        visible: { y: 0 },
        hidden: { y: -150 }, // Pushes the header exactly 150px up and out of frame
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="flex items-center gap-8 md:gap-12 px-8 h-14 rounded-full bg-[#0A0A18]/80 backdrop-blur-md border border-zinc-800 shadow-2xl nav-pill-container">

        {/* 1. BRAND / LOGO (Left Side) */}
        <div className="nav-brand-container">
          <Link href="/" className="shrink-0 text-white font-bold text-sm tracking-tight hover:text-[#4f8ef7] transition-colors whitespace-nowrap pr-6 border-r border-zinc-700">
            PHO-Guide
          </Link>
        </div>

        {/* 2. NAVIGATION LINKS (Center) */}
        <nav className="flex items-center text-sm font-medium text-zinc-300 main-nav-list">

          <div className="relative group cursor-pointer nav-dropdown">
            <span className="hover:text-[#4f8ef7] transition-colors nav-trigger">Sections</span>
            <ul className="absolute left-1/2 -translate-x-1/2 top-full w-56 bg-[#0A0A18] border border-zinc-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col dropdown-menu">
              <li><Link href="/highschoolquiz" className="block rounded-lg hover:bg-white/5 hover:text-[#4f8ef7] transition-colors dropdown-item">High School Physics</Link></li>
              <li><Link href="/fmapb" className="block rounded-lg hover:bg-white/5 hover:text-[#4f8ef7] transition-colors dropdown-item">F=ma / Physics Bowl</Link></li>
              <li><Link href="/usapho" className="block rounded-lg hover:bg-white/5 hover:text-[#4f8ef7] transition-colors dropdown-item">USAPhO</Link></li>
            </ul>
          </div>

          <Link href="/quiz-history" className="hover:text-[#4f8ef7] transition-colors nav-link">Logs</Link>
          <Link href="/insights" className="hover:text-[#4f8ef7] transition-colors nav-link">Insights</Link>
          <Link href="/roadmap" className="hover:text-[#4f8ef7] transition-colors nav-link">Roadmap</Link>

          <div className="relative group cursor-pointer nav-dropdown">
            <span className="hover:text-[#4f8ef7] transition-colors nav-trigger">About Us</span>
            <ul className="absolute left-1/2 -translate-x-1/2 top-full w-48 bg-[#0A0A18] border border-zinc-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col dropdown-menu">
              <li><Link href="/aboutus" className="block rounded-lg hover:bg-white/5 hover:text-[#4f8ef7] transition-colors dropdown-item">Meet the Team</Link></li>
              <li><Link href="/contact" className="block rounded-lg hover:bg-white/5 hover:text-[#4f8ef7] transition-colors dropdown-item">Contact Us</Link></li>
            </ul>
          </div>

        </nav>

        <div className="nav-auth-container flex items-center pl-6 border-l border-zinc-700">
          {user ? (
            <Link href="/user" className="flex items-center text-zinc-300 hover:text-white transition-colors user-profile-link">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="rounded-full object-cover border border-[#4f8ef7]/50 user-avatar h-8 w-8"
                />
              ) : (
                <div className="rounded-full h-8 w-8 bg-[#4f8ef7]/20 border border-[#4f8ef7]/50 flex items-center justify-center text-[#4f8ef7] font-bold user-avatar-placeholder">
                  {user.displayName?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </Link>
          ) : (
            <Link href="/auth" className="text-sm font-medium hover:text-[#4f8ef7] transition-colors nav-login-btn">
              Login / Sign Up
            </Link>
          )}
        </div>

      </div>
    </motion.header>
  );
}