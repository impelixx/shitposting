"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";
import { Post } from "@/lib/types";
import { MarkdownEditor } from "./MarkdownEditor";

interface Props {
  initialPost?: Post;
}

export function PostForm({ initialPost }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? "");
  const [tags, setTags] = useState(initialPost?.tags.join(", ") ?? "");
  const [body, setBody] = useState(initialPost?.body ?? "");
  const [published, setPublished] = useState(initialPost?.published ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const token = auth.getToken();
    if (!token) { router.push("/login"); return; }
    const data = {
      title, slug, excerpt, body,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      published,
    };
    try {
      if (initialPost) {
        await api.updatePost(token, initialPost.slug, data);
      } else {
        await api.createPost(token, data);
      }
      router.push("/admin");
    } catch {
      setError("Ошибка при сохранении");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl mx-auto px-6 py-8">
      <h1 className="font-serif text-2xl font-bold text-stone-900 mb-4">
        {initialPost ? "Редактировать" : "Новая статья"}
      </h1>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Заголовок"
        className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400" />
      <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug (напр. moya-statya)"
        className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400" />
      <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Краткое описание"
        className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400" />
      <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Теги через запятую: rust, личное"
        className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400" />
      <MarkdownEditor value={body} onChange={setBody} />
      <label className="flex items-center gap-2 text-sm text-stone-600">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        Опубликовать
      </label>
      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="bg-orange-500 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors">
          {loading ? "Сохранение..." : "Сохранить"}
        </button>
        <button type="button" onClick={() => router.push("/admin")}
          className="text-sm text-stone-500 hover:underline">Отмена</button>
      </div>
    </form>
  );
}
