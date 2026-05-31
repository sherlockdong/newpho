// app/components/Header.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../../firebase";

const auth = getAuth(app);

export default function Header() {
  const [user, setUser] = useState(null);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const headerRef = useRef(null);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Hide/show header on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setShowHeader(false); // Scrolling down
      } else if (currentScrollY < lastScrollY) {
        setShowHeader(true); // Scrolling up
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Set --header-h CSS variable dynamically
  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty("--header-h", `${height}px`);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [showHeader]); // Re-run if visibility affects height

  return (
    <header
      ref={headerRef}
      className={`tg-header__area transparent-header fixed top-0 left-0 w-full z-50 transition-transform duration-300 ${
        showHeader ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="tgmenu__wrap">
              <nav className="tgmenu__nav">
                {/* Logo / Brand */}
                <div className="logo">
                  <Link href="/" className="text-2xl font-bold text-white">
                    PHO-Guide
                  </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="tgmenu__navbar-wrap tgmenu__main-menu d-none d-lg-flex">
                  <ul className="navigation">
                    <li>
                      <Link href="/highschoolquiz" className="section-link">
                        Sections
                      </Link>
                      <ul className="sub-menu">
                      <li><Link href="/highschoolquiz">High School Physics(regular, IB, AP, etc.)</Link></li>
                        <li><Link href="/fmapb">F=ma / Physics Bowl Preparation</Link></li>
                        <li><Link href="/usapho">USAPhO</Link></li>
                        <li><Link href="/olymco">IPhO</Link></li>
                      </ul>
                    </li>
                    <li><Link href="/quiz-history" className="section-link">Logs</Link></li>
                    <li><Link href="./insights" className="section-link">Insights</Link></li>
                    <li><Link href="./roadmap" className="section-link">Roadmap</Link></li>
                    <li>
                      <Link href="/aboutus">About Us</Link>
                      <ul className="sub-menu">
                        <li><Link href="/aboutus">Meet the Team</Link></li>
                        <li><Link href="/contact">Contact Us</Link></li>
                      </ul>
                    </li>
                  </ul>
                </div>

                {/* Auth & Actions */}
                <div className="tgmenu__action">
                  <ul className="list-wrap">
                    <li className="header-btn">
                      {user ? (
                        <Link
                          href="/user"
                          className="flex items-center gap-3 text-white hover:text-primary transition"
                        >
                          {user.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt="Profile"
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-dark font-bold">
                              {user.displayName?.[0]?.toUpperCase() || "U"}
                            </div>
                          )}
                          <span>{user.displayName || "User"}</span>
                        </Link>
                      ) : (
                        <Link href="/auth">
                          <button className="tg-btn">Login / Register</button>
                        </Link>
                      )}
                    </li>
                  </ul>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="mobile-nav-toggler d-lg-none">
                  <i className="tg-flaticon-menu-1" />
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}