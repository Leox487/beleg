"use client";

import { useState } from "react";

function clipboardText(value: string): string {
  // Paths like /p/slug → absolute URL for sharing. Emails and other raw
  // strings must be copied verbatim (URL() would treat them as relative).
  if (value.startsWith("/") && typeof window !== "undefined") {
    return new URL(value, window.location.origin).toString();
  }
  return value;
}

export function CopyText({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(clipboardText(value));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button type="button" className="copy-text" onClick={copy} title="Copy">
      <span className="mono">{value}</span>
      <span className="copy-hint">{copied ? "copied" : "copy"}</span>
    </button>
  );
}
