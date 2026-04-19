"use client";
import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { SearchResult } from "@/lib/types";
import Link from "next/link";

const MONO = "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace";

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
    <div style={{ position: "relative", marginTop: "12px" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        borderBottom: `1px solid ${focused ? "#f97316" : "#3f3f46"}`,
        paddingBottom: "6px",
        transition: "border-color 0.2s",
      }}>
        <span style={{ fontFamily: MONO, color: "#f97316", fontSize: "14px", userSelect: "none" }}>{">"}</span>
        <input
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); setTimeout(() => setOpen(false), 150); }}
          placeholder="поиск по статьям..."
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            fontFamily: MONO,
            fontSize: "14px",
            color: "#e4e4e7",
            width: "300px",
            letterSpacing: "0.02em",
          }}
        />
      </div>
      {open && results.length > 0 && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          marginTop: "8px",
          backgroundColor: "#18181b",
          border: "1px solid #3f3f46",
          borderRadius: "4px",
          zIndex: 50,
          minWidth: "340px",
          maxHeight: "256px",
          overflowY: "auto",
        }}>
          {results.map((r) => (
            <Link key={r.id} href={`/posts/${r.slug}`} style={{ display: "block", padding: "8px 12px", borderBottom: "1px solid #27272a", textDecoration: "none" }}>
              <div style={{ fontFamily: MONO, fontSize: "13px", color: "#f97316" }}>{"// "}{r.title}</div>
              {r.excerpt && <div style={{ fontFamily: MONO, fontSize: "11px", color: "#71717a", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.excerpt}</div>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
