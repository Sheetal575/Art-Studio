"use client";

import { useEffect } from "react";

export default function Hero() {
  useEffect(() => {
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        document.documentElement.classList.add("is-loaded");
      });
      return () => cancelAnimationFrame(raf2);
    });
    return () => cancelAnimationFrame(raf1);
  }, []);

  return (
    <section className="hero">
      <div className="wrap">
        <p className="hero-kicker">Pencil, charcoal &amp; acrylic</p>
        <h1 className="hero-statement">
          I draw what stays still long enough to be looked at.
        </h1>
        <a href="#work" className="hero-cue" aria-label="Scroll to the work">
          <span>See the work</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M6 13l6 6 6-6" />
          </svg>
        </a>
      </div>
    </section>
  );
}
