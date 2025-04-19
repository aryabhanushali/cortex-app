'use client'

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Clean up the event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header 
      id="header" 
      className={`header d-flex align-items-center fixed-top ${scrolled ? 'scrolled' : ''}`}
      style={{
        boxShadow: scrolled ? '0 2px 15px rgba(0, 0, 0, 0.1)' : 'none',
        backgroundColor: scrolled ? '#ffffff' : 'transparent',
        transition: 'all 0.3s ease-in-out'
      }}
    >
      <div className="container-fluid container-xl position-relative d-flex align-items-center">

      <Link href="/" className="logo d-flex align-items-center me-auto">
        <Image src="/assets/img/logo.svg" alt="" width={100} height={100} />
        <h1 className="sitename">Cortex</h1>
      </Link>

      <nav id="navmenu" className="navmenu">
        <ul>
          <li><a href="#hero" className="active">Home</a></li>
          <li><a href="lab-page.html">The Lab</a></li>
          <li><a href="scoreboard-page.html">The Scoreboard</a></li>
        </ul>
        <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
      </nav>

      {/* <a className="btn-getstarted flex-md-shrink-0" href="index.html#about">Upload Stimuli</a> */}

    </div>
  </header>
  );
}