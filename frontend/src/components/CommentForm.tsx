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
    <form onSubmit={handleSubmit} className="mt-4 space-y-2">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <input
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Ваше имя"
        className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Написать комментарий..."
        rows={3}
        className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
      >
        {loading ? "Отправка..." : "Отправить"}
      </button>
    </form>
  );
}
