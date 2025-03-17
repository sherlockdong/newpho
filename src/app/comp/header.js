"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../../firebase"; // Adjust the path based on your project structure

const auth = getAuth(app);

const Header = () => {
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
    <header className={`header ${showHeader ? "visible" : "hidden"}`} style={{ display: "flex", alignItems: "center", padding: "1rem" }}>
      <Link id="home" href="/" style={{ fontWeight: "bold", fontSize: "1.5rem" }}>
        PHO - GUIDE
      </Link>
 <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
        {user ? (     <Link href="../user">
          <span style={{ marginRight: "1rem" }}>{user.email}</span>
          </Link> ) : (
          <Link href="/auth">
            <button style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>Login / Register</button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
