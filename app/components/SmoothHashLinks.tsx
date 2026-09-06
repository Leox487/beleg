"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

function hashId(href: string | null): string | null {
  if (!href) return null;
  if (href.startsWith("/#")) return decodeURIComponent(href.slice(2));
  if (href.startsWith("#") && href.length > 1) {
    return decodeURIComponent(href.slice(1));
  }
  return null;
}

function prefersSmooth() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollToId(id: string, smooth: boolean) {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({
    behavior: smooth ? "smooth" : "auto",
    block: "start",
  });
  return true;
}

export function SmoothHashLinks() {
  const pathname = usePathname();

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor || anchor.target === "_blank") return;

      const id = hashId(anchor.getAttribute("href"));
      if (!id) return;
      if (!document.getElementById(id)) return;

      event.preventDefault();
      history.pushState(null, "", `/#${id}`);
      scrollToId(id, prefersSmooth());
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const frame = window.requestAnimationFrame(() => {
      scrollToId(id, prefersSmooth());
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
