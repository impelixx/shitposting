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
    <div className="relative mt-2.5">
      <div className="bg-stone-900 rounded-md px-3 py-2 flex items-center gap-2">
        <span className="text-stone-600 text-sm">🔍</span>
        <input
          value={query}
          onChange={handleChange}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Поиск по статьям..."
          className="bg-transparent text-sm text-stone-400 placeholder-stone-600 outline-none w-56"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
          {results.map((r) => (
            <Link
              key={r.id}
              href={`/posts/${r.slug}`}
              className="block px-3 py-2 hover:bg-orange-50 border-b border-stone-100 last:border-0"
            >
              <div className="text-sm font-medium text-stone-800">{r.title}</div>
              {r.excerpt && <div className="text-xs text-stone-400 mt-0.5 truncate">{r.excerpt}</div>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
