"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getConsent, setConsent, type ConsentChoice } from "@/lib/consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getConsent() === null);
  }, []);

  function choose(choice: ConsentChoice) {
    setConsent(choice);
    setVisible(false);
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
          onPointerDown={() => choose("essential")}
          onClick={() => choose("essential")}
        >
          Decline
        </button>
        <button
          type="button"
          className="cookie-btn cookie-btn-ok"
          onPointerDown={() => choose("all")}
          onClick={() => choose("all")}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
