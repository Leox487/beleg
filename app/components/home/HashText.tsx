"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "0123456789abcdef";

export function HashText({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [text, setText] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(value);
      return;
    }

    let frame = 0;
    let timer = 0;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.unobserve(el);
        const steps = 14;
        const tick = () => {
          frame += 1;
          if (frame >= steps) {
            setText(value);
            return;
          }
          setText(
            value
              .split("")
              .map((ch, i) =>
                i < Math.floor((frame / steps) * value.length)
                  ? ch
                  : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
              )
              .join(""),
          );
          timer = window.setTimeout(tick, 38);
        };
        tick();
      },
      { threshold: 0.6 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      window.clearTimeout(timer);
    };
  }, [value]);

  return (
    <span ref={ref} className={`bh-hash ${className}`.trim()}>
      {text}
    </span>
  );
}
