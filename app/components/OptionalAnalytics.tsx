"use client";

import { Analytics } from "@vercel/analytics/next";
import { useEffect, useState } from "react";

import { CONSENT_EVENT, getConsent } from "@/lib/consent";

export function OptionalAnalytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAllowed(getConsent() === "all");
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  if (!allowed) return null;
  return <Analytics />;
}
