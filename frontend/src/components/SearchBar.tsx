"use client";
import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { SearchResult } from "@/lib/types";
import Link from "next/link";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    const data = await api.search(q).catch(() => []);
    setResults(data);
    setOpen(true);
  }, []);

  return (
    <div style={{ position: "relative", marginTop: 14, maxWidth: 540 }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        paddingBottom: 8,
        borderBottom: `1px solid ${focused ? "var(--accent)" : "oklch(0.3 0.015 60)"}`,
        transition: "border-color 0.2s",
      }}>
        <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)", marginRight: 10, fontSize: 13, userSelect: "none" }}>{">"}</span>
        <input
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); setTimeout(() => setOpen(false), 150); }}
          placeholder="поиск по статьям..."
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--fg-dark-mute)",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
          }}
        />
      </div>
      {open && results.length > 0 && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          marginTop: 8,
          backgroundColor: "oklch(0.22 0.014 60)",
          border: "1px solid oklch(0.3 0.015 60)",
          borderRadius: 6,
          zIndex: 50,
          minWidth: 360,
          maxHeight: 256,
          overflowY: "auto",
        }}>
          {results.map((r) => (
            <Link key={r.id} href={`/posts/${r.slug}`} style={{ display: "block", padding: "10px 14px", borderBottom: "1px solid oklch(0.28 0.014 60)", textDecoration: "none" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)" }}>{"// "}{r.title}</div>
              {r.excerpt && <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-dark-mute)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.excerpt}</div>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
