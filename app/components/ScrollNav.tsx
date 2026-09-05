"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Wraps the sticky navbar and toggles `.nav-scrolled` after the page has
 * moved past 20px. Scroll handler is coalesced with requestAnimationFrame.
 */
export function ScrollNav({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      setScrolled(window.scrollY > 20);
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`nav-wrap${scrolled ? " nav-scrolled" : ""}`}>{children}</div>
  );
}
