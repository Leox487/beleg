"use client";

import { useState } from "react";

export function CopyText({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      const full =
        typeof window !== "undefined"
          ? new URL(value, window.location.origin).toString()
          : value;
      await navigator.clipboard.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button type="button" className="copy-text" onClick={copy} title="Copy link">
      <span className="mono">{value}</span>
      <span className="copy-hint">{copied ? "copied" : "copy"}</span>
    </button>
  );
}
