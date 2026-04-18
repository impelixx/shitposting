"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";
import { Post } from "@/lib/types";

export default function AdminPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const token = auth.getToken();
    if (!token) { router.push("/login"); return; }
    api.listAllPosts(token).then(setPosts).catch(() => router.push("/login"));
  }, [router]);

  const handleDelete = async (slug: string) => {
    if (!confirm("Удалить статью?")) return;
    const token = auth.getToken()!;
    await api.deletePost(token, slug);
    setPosts((p) => p.filter((post) => post.slug !== slug));
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-stone-900">Все статьи</h1>
        <Link href="/admin/posts/new" className="bg-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
          + Новая статья
        </Link>
      </div>
      <ul className="space-y-2">
        {posts.map((post) => (
          <li key={post.id} className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-lg px-4 py-3">
            <div>
              <span className="font-medium text-stone-800">{post.title}</span>
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${post.published ? "bg-green-100 text-green-700" : "bg-stone-200 text-stone-500"}`}>
                {post.published ? "Опубликовано" : "Черновик"}
              </span>
            </div>
            <div className="flex gap-3">
              <Link href={`/admin/posts/${post.slug}/edit`} className="text-sm text-orange-500 hover:underline">Изменить</Link>
              <button onClick={() => handleDelete(post.slug)} className="text-sm text-red-400 hover:underline">Удалить</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
