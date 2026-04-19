"use client";
import { useState } from "react";

const MONO = "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace";

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
        color: copied ? "#f97316" : "#a8a29e",
        background: "none",
        border: "1px solid #e7e5e4",
        borderRadius: "4px",
        padding: "4px 10px",
        cursor: "pointer",
        fontFamily: MONO,
        transition: "color 0.15s, border-color 0.15s",
        borderColor: copied ? "#fed7aa" : "#e7e5e4",
      }}
    >
      {copied ? "скопировано ✓" : "поделиться →"}
    </button>
  );
}
