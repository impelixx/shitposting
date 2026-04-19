"use client";
import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { SearchResult } from "@/lib/types";
import Link from "next/link";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);

  const handleChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const data = await api.search(q).catch(() => []);
    setResults(data);
    setOpen(true);
  }, []);

  return (
    <div style={{ position: "relative", marginTop: "8px" }}>
      <div style={{
        backgroundColor: "#0c0a09",
        borderRadius: "6px",
        padding: "7px 12px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}>
        <span style={{ color: "#52525b", fontSize: "13px" }}>🔍</span>
        <input
          value={query}
          onChange={handleChange}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Поиск по статьям..."
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: "13px",
            color: "#a1a1aa",
            width: "220px",
          }}
        />
      </div>
      {open && results.length > 0 && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          marginTop: "4px",
          backgroundColor: "#fff",
          border: "1px solid #e7e5e4",
          borderRadius: "6px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          zIndex: 50,
          maxHeight: "256px",
          overflowY: "auto",
        }}>
          {results.map((r) => (
            <Link
              key={r.id}
              href={`/posts/${r.slug}`}
              style={{
                display: "block",
                padding: "8px 12px",
                borderBottom: "1px solid #f5f5f4",
                textDecoration: "none",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: 500, color: "#1c1917" }}>{r.title}</div>
              {r.excerpt && (
                <div style={{ fontSize: "12px", color: "#a8a29e", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.excerpt}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
