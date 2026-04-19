"use client";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useState } from "react";

export function RandomPostButton() {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  const handleClick = async () => {
    const posts = await api.listPosts(undefined, 50, 0).catch(() => []);
    if (posts.length === 0) return;
    const post = posts[Math.floor(Math.random() * posts.length)];
    router.push(`/r/${post.slug}`);
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "12px 14px",
        background: "transparent",
        border: `1px solid ${hovered ? "var(--accent)" : "var(--border)"}`,
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 13,
        color: hovered ? "var(--accent)" : "var(--fg)",
        cursor: "pointer",
        transition: "all 0.15s",
        fontFamily: "var(--font-sans)",
      }}
    >
      <span>🎲 показать наугад</span>
      <span style={{ fontFamily: "var(--font-mono)" }}>→</span>
    </button>
  );
}
