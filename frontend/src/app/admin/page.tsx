"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";
import { Post } from "@/lib/types";
import { Navbar } from "@/components/Navbar";

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
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1
            style={{
              color: "var(--fg)",
              fontFamily: "var(--font-serif)",
              fontSize: "28px",
              fontWeight: 600,
            }}
          >
            Все статьи
          </h1>
          <Link
            href="/admin/posts/new"
            style={{
              background: "var(--accent)",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              padding: "8px 16px",
              borderRadius: "8px",
              textDecoration: "none",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            + Новая статья
          </Link>
        </div>
        <ul className="space-y-2">
          {posts.map((post) => (
            <li
              key={post.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--bg-elev, oklch(0.975 0.012 80))",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "12px 16px",
              }}
            >
              <div>
                <span style={{ fontWeight: 500, color: "var(--fg)" }}>{post.title}</span>
                <span
                  className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                    post.published ? "bg-green-100 text-green-700" : "bg-stone-200 text-stone-500"
                  }`}
                >
                  {post.published ? "Опубликовано" : "Черновик"}
                </span>
              </div>
              <div className="flex gap-3">
                <Link
                  href={`/admin/posts/${post.slug}/edit`}
                  style={{ fontSize: "14px", color: "var(--accent)", textDecoration: "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  Изменить
                </Link>
                <button
                  onClick={() => handleDelete(post.slug)}
                  className="text-sm text-red-400 hover:underline"
                >
                  Удалить
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
