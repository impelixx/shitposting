import { Comment, Post, SearchResult, Tag } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  // public
  listPosts: (tag?: string, limit = 20, offset = 0) => {
    const q = new URLSearchParams();
    if (tag) q.set("tag", tag);
    q.set("limit", String(limit));
    q.set("offset", String(offset));
    return apiFetch<Post[]>(`/api/posts?${q}`);
  },
  getPost: (slug: string) => apiFetch<Post>(`/api/posts/${slug}`),
  listComments: (slug: string) => apiFetch<Comment[]>(`/api/posts/${slug}/comments`),
  listTags: () => apiFetch<Tag[]>("/api/tags"),
  search: (q: string) => apiFetch<SearchResult[]>(`/api/search?q=${encodeURIComponent(q)}`),

  // auth
  login: (username: string, password: string) =>
    apiFetch<{ token: string }>("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }),

  // protected (pass token)
  listAllPosts: (token: string) =>
    apiFetch<Post[]>("/api/admin/posts", { headers: { Authorization: `Bearer ${token}` } }),

  createPost: (token: string, data: Omit<Post, "id" | "created_at" | "updated_at">) =>
    apiFetch<Post>("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),

  updatePost: (token: string, slug: string, data: Omit<Post, "id" | "created_at" | "updated_at">) =>
    apiFetch<Post>(`/api/posts/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),

  deletePost: (token: string, slug: string) =>
    fetch(`${BASE}/api/posts/${slug}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),

  createComment: (slug: string, author: string, body: string) =>
    apiFetch<Comment>(`/api/posts/${slug}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, body }),
    }),

  uploadImage: async (token: string, file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${BASE}/api/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) throw new Error("upload failed");
    const data = await res.json();
    return data.url as string;
  },
};
