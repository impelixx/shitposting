"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface Props {
  slug: string;
}

export function CommentForm({ slug }: Props) {
  const router = useRouter();
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !body.trim()) {
      setError("Заполните имя и комментарий");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.createComment(slug, author.trim(), body.trim());
      setAuthor("");
      setBody("");
      router.refresh();
    } catch {
      setError("Не удалось отправить комментарий");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "var(--bg-elev)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: 16,
        marginBottom: 32,
      }}
    >
      {error && (
        <p style={{ color: "var(--rust)", fontSize: 13, marginBottom: 8, fontFamily: "var(--font-mono)" }}>
          {error}
        </p>
      )}
      <input
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Ваше имя"
        style={{
          display: "block",
          width: "100%",
          border: "none",
          borderBottom: "1px solid var(--border)",
          background: "transparent",
          fontSize: 14,
          color: "var(--fg)",
          padding: "6px 0",
          marginBottom: 10,
          outline: "none",
          fontFamily: "var(--font-sans)",
        }}
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Написать комментарий..."
        rows={3}
        style={{
          display: "block",
          width: "100%",
          border: "none",
          background: "transparent",
          fontSize: 14,
          color: "var(--fg)",
          padding: "6px 0",
          outline: "none",
          resize: "vertical",
          fontFamily: "var(--font-sans)",
          lineHeight: 1.5,
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 12,
        }}
      >
        <span style={{ fontSize: 12, color: "var(--fg-faint)", fontFamily: "var(--font-mono)" }}>
          без аккаунтов
        </span>
        <button
          type="submit"
          disabled={loading}
          style={{
            background: "var(--accent)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            padding: "6px 16px",
            border: "none",
            borderRadius: 6,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            fontFamily: "var(--font-sans)",
          }}
        >
          {loading ? "Отправка..." : "Отправить"}
        </button>
      </div>
    </form>
  );
}
