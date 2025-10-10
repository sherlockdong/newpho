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

  // auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsub();
  }, []);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastScrollY && y > 50) setShowHeader(false);
      else setShowHeader(true);
      setLastScrollY(y);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastScrollY]);
  useEffect(() => {
    const setHeightVar = () => {
      if (headerRef.current) {
        const h = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty("--header-h", `${h}px`);
      }
    };
    setHeightVar();
    window.addEventListener("resize", setHeightVar);
    return () => window.removeEventListener("resize", setHeightVar);
  }, []);

  return (
    <header id="home" ref={headerRef}>
      <div
        id="sticky-header"
        className={`tg-header__area transparent-header ${showHeader ? "sticky-visible" : "sticky-hidden"}`}
      >
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="tgmenu__wrap">
                <nav className="tgmenu__nav">
                  <div className="tgmenu__navbar-wrap tgmenu__main-menu d-none d-lg-flex">
                    <ul className="navigation">
                      <li><Link href="/" className="section-link">PHO  - Guide</Link></li>
                      <li className="menu-item-has-children">
                        <Link href="../highschoolquiz">Highschool Quiz</Link>
                        <ul className="sub-menu">
                          <li><Link href="../highschoolquiz/kinematics">Kinematics</Link></li>
                          <li><Link href="../highschoolquiz/induction">Induction</Link></li>
                          <li><Link href="../highschoolquiz/electricity">Electricity</Link></li>
                          <li><Link href="../highschoolquiz/relativity">Relativity</Link></li>
                        </ul>
                      </li>
                      <li><Link href="#token" className="section-link">Logs</Link></li>
                      <li><Link href="#work" className="section-link">Plans</Link></li>
                      <li><Link href="#roadmap" className="section-link">roadmap</Link></li>
                      <li className="menu-item-has-children">
                        <Link href="../aboutus">About Us</Link>
                        <ul className="sub-menu">
                          <li><Link href="../aboutus">Meet the Team</Link></li>
                          <li><Link href="blog-details.html">Blog Details</Link></li>
                        </ul>
                      </li>
                    </ul>
                  </div>

                  <div className="tgmenu__action">
                    <ul className="list-wrap">
                      <li className="header-btn">
                        <div>
                          {user ? (
                            <Link href="/user">
                              <span>{user.displayName}</span>
                            </Link>
                          ) : (
                            <Link href="/auth">
                              <button style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
                                Login / Register
                              </button>
                            </Link>
                          )}
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="mobile-nav-toggler">
                    <i className="tg-flaticon-menu-1" />
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
