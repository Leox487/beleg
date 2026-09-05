"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Adds `is-visible` once the element scrolls into view, so CSS can run the
 * entrance animation. Uses IntersectionObserver rather than a scroll library
 * so this stays dependency-free, and only fires once per element.
 */
export function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Anything already on screen at mount (or if the API is missing) should
    // just show, never sit invisible.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${className}${visible ? " is-visible" : ""}`}>
      {children}
    </div>
  );
}
