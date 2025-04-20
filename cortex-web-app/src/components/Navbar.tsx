'use client'

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

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
      className={`header d-flex align-items-center position-fixed w-100 ${scrolled ? 'scrolled' : ''}`}
      style={{
        boxShadow: '0 2px 15px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#ffffff',
        transition: 'all 0.3s ease-in-out',
        zIndex: 1000,
        top: 0,
        left: 0
      }}
    >
      <div className="container-fluid container-xl position-relative d-flex align-items-center">

      <Link href="/" className="logo d-flex align-items-center me-auto">
        <Image 
          src="/assets/img/logo.svg" 
          alt="" 
          width={100} 
          height={100} 
          className="img-fluid" 
          style={{ marginRight: '-15px', marginBottom: '10px' }} 
        />
        <h1 className="sitename">Cortex</h1>
      </Link>

      <nav id="navmenu" className="navmenu">
        <ul>
          <li><Link href="/" className={pathname === '/' ? 'active' : ''}>Home</Link></li>
          <li><Link href="/lab" className={pathname === '/lab' ? 'active' : ''}>The Lab</Link></li>
          <li><Link href="/scoreboard" className={pathname === '/scoreboard' ? 'active' : ''}>The Scoreboard</Link></li>
        </ul>
        <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
      </nav>

      {/* <a className="btn-getstarted flex-md-shrink-0" href="index.html#about">Upload Stimuli</a> */}

    </div>
  </header>
  );
}