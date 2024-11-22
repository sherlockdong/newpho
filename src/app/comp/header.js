'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
const Header =()=>{
    const [showHeader, setShowHeader] = useState(true);
    const [lastScrollPosition, setLastScrollPosition] = useState(0);
  
    useEffect(() => {
      const handleScroll = () => {
        const currentScrollPosition = window.scrollY;
  
        if (currentScrollPosition > lastScrollPosition && currentScrollPosition > 50) {
          setShowHeader(false);
        } else {
          // Show header when scrolling up
          setShowHeader(true);
        }
  
        setLastScrollPosition(currentScrollPosition);
      };
  
      window.addEventListener("scroll", handleScroll);
  
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }, [lastScrollPosition]);
    return( 
        <header className={`header ${showHeader ? "visible" : "hidden"}`    }>
      <Link id="home" href="/">PHO - GUIDE</Link>
      </header>
)
}
export default Header;