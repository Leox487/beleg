"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "beleg-beta-dismissed";

let dismissed = false;

function wasDismissed(): boolean {
  if (dismissed) return true;
  try {
    return (
      window.sessionStorage.getItem(KEY) === "1" ||
      window.localStorage.getItem(KEY) === "1"
    );
  } catch {
    return false;
  }
}

export function BetaNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!wasDismissed());
  }, []);

  function dismiss() {
    dismissed = true;
    setVisible(false);
    try {
      window.sessionStorage.setItem(KEY, "1");
      window.localStorage.setItem(KEY, "1");
    } catch {
      /* private mode */
    }
  }

  if (!visible) return null;

  return (
    <div className="beta-notice" role="note">
      <p>
        Public beta. Beleg records what you type. It does not guarantee funding,
        legal accuracy, or that an event is true. Optional inbound email may
        draft a title with a model — check that draft.{" "}
        <Link href="/terms">Terms</Link>
        {" · "}
        <Link href="/privacy">Privacy</Link>
      </p>
      <button
        type="button"
        className="beta-notice-close"
        aria-label="Dismiss beta notice"
        onPointerDown={dismiss}
        onClick={dismiss}
      >
        ×
      </button>
    </div>
  );
}
