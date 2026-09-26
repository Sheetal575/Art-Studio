"use client";

import { useEffect, useRef, useState } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const mqRef = useRef<MediaQueryList | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    mqRef.current = window.matchMedia("(prefers-color-scheme: dark)");

    const computeIsDark = () =>
      root.dataset.theme ? root.dataset.theme === "dark" : mqRef.current!.matches;

    const sync = () => {
      const dark = computeIsDark();
      setIsDark(dark);
      root.classList.toggle("theme-dark", dark);
    };

    sync();
    mqRef.current.addEventListener?.("change", sync);
    return () => mqRef.current?.removeEventListener?.("change", sync);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const currentlyDark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : mqRef.current?.matches ?? false;
    const next = currentlyDark ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* ignore */
    }
    const dark = next === "dark";
    setIsDark(dark);
    root.classList.toggle("theme-dark", dark);
  };

  return (
    <header className={`site-header${scrolled ? " scrolled" : ""}`} id="header">
      <div className="wrap header-inner">
        <nav className="nav" aria-label="Main">
          <div className="nav-brand">Sheetal's studio</div>
          <div className="nav-links">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <button
            className={`theme-toggle${isDark ? " is-dark" : ""}`}
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          >
            <svg
              className="icon-moon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
            </svg>
            <svg
              className="icon-sun"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
            </svg>
          </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
