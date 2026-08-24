"use client";

import { useEffect } from "react";

const IDLE_MS = 8 * 60 * 1000;

/**
 * After eight minutes with no input, drop screen brightness so a static
 * dashboard or marketing page does not sit at full OLED drive.
 */
export function IdleDim() {
  useEffect(() => {
    let timer = 0;
    let moveQueued = false;

    const wake = () => {
      document.documentElement.classList.remove("is-idle");
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        document.documentElement.classList.add("is-idle");
      }, IDLE_MS);
    };

    const onMove = () => {
      if (moveQueued) return;
      moveQueued = true;
      requestAnimationFrame(() => {
        moveQueued = false;
        wake();
      });
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") wake();
    };

    const opts: AddEventListenerOptions = { passive: true };
    wake();
    window.addEventListener("pointerdown", wake, opts);
    window.addEventListener("keydown", wake, opts);
    window.addEventListener("scroll", wake, opts);
    window.addEventListener("wheel", wake, opts);
    window.addEventListener("touchstart", wake, opts);
    window.addEventListener("pointermove", onMove, opts);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearTimeout(timer);
      document.documentElement.classList.remove("is-idle");
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("keydown", wake);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("wheel", wake);
      window.removeEventListener("touchstart", wake);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return <div className="idle-veil" aria-hidden="true" />;
}
