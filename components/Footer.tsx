"use client";

import { useEffect, useState } from "react";

export default function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <span>© {year ?? ""} · All artwork is the artist&apos;s own.</span>
        <a href="#top" style={{ textDecoration: "none" }}>
          Back to top
        </a>
      </div>
    </footer>
  );
}
