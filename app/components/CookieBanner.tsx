"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getConsent, setConsent, type ConsentChoice } from "@/lib/consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getConsent() === null) setVisible(true);
  }, []);

  function choose(choice: ConsentChoice) {
    setVisible(false);
    setConsent(choice);
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookies">
      <p>
        We use cookies.{" "}
        <Link href="/privacy#cookies">Privacy</Link>
      </p>
      <div className="cookie-banner-actions">
        <button
          type="button"
          className="cookie-btn cookie-btn-quiet"
          onClick={() => choose("essential")}
        >
          Decline
        </button>
        <button
          type="button"
          className="cookie-btn cookie-btn-ok"
          onClick={() => choose("all")}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
