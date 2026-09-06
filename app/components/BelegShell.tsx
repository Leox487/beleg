"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { isBelegShellPath } from "@/lib/beleg-shell";

export function BelegShell() {
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    document.documentElement.classList.toggle("beleg", isBelegShellPath(pathname));
  }, [pathname]);

  return null;
}
