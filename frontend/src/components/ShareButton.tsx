"use client";
import { useState } from "react";

export function ShareButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const url = `${window.location.origin}/r/${slug}`;
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      style={{
        fontSize: "12px",
        color: copied ? "var(--accent)" : "var(--fg-faint)",
        background: "none",
        border: "1px solid var(--border)",
        borderRadius: "4px",
        padding: "4px 10px",
        cursor: "pointer",
        fontFamily: "var(--font-mono)",
        transition: "color 0.15s, border-color 0.15s",
        borderColor: copied ? "var(--accent-bg)" : "var(--border)",
      }}
    >
      {copied ? "скопировано ✓" : "поделиться →"}
    </button>
  );
}
