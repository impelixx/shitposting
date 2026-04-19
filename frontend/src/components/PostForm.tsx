"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";
import { Post } from "@/lib/types";
import { MarkdownEditor } from "./MarkdownEditor";

const MONO = "var(--font-mono)";
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const fieldStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: "6px",
  padding: "6px 10px",
  fontSize: "12px",
  fontFamily: MONO,
  background: "var(--bg)",
  color: "var(--fg)",
  outline: "none",
  width: "100%",
};

const labelStyle: React.CSSProperties = {
  fontSize: "10px",
  color: "var(--fg-faint)",
  textTransform: "uppercase",
  letterSpacing: "1px",
  marginBottom: "4px",
  display: "block",
};

interface Props {
  initialPost?: Post;
}

export function PostForm({ initialPost }: Props) {
  const router = useRouter();
  const token = auth.getToken() ?? undefined;
  const coverRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? "");
  const [tags, setTags] = useState(initialPost?.tags.join(", ") ?? "");
  const [body, setBody] = useState(initialPost?.body ?? "");
  const [coverImage, setCoverImage] = useState(initialPost?.cover_image ?? "");
  const [published, setPublished] = useState(initialPost?.published ?? false);
  const [loading, setLoading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [error, setError] = useState("");

  const handleCoverUpload = async (file: File) => {
    if (!token) return;
    setCoverUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${BASE}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      setCoverImage(url);
    } catch {
      setError("Ошибка загрузки обложки");
    } finally {
      setCoverUploading(false);
    }
  };

  const handleCoverUploadRef = useRef(handleCoverUpload);
  useEffect(() => { handleCoverUploadRef.current = handleCoverUpload; });

  useEffect(() => {
    if (!token) return;
    const handlePaste = async (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".w-md-editor")) return;

      const items = Array.from(e.clipboardData?.items ?? []);
      const imageItem = items.find((it) => it.type.startsWith("image/"));
      if (!imageItem) return;

      e.preventDefault();
      const file = imageItem.getAsFile();
      if (!file) return;

      await handleCoverUploadRef.current(file);
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!token) { router.push("/login"); return; }
    const data = {
      title, slug, excerpt, body, cover_image: coverImage,
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
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)", fontFamily: MONO }}
    >
      {/* Sticky top bar */}
      <div style={{
        background: "var(--bg-dark, oklch(0.18 0.012 60))",
        borderBottom: "1px solid oklch(0.3 0.015 60)",
        padding: "0 24px",
        height: "52px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <Link href="/admin" style={{ color: "var(--fg-dark-mute)", fontSize: "12px", textDecoration: "none", flexShrink: 0 }}>
          ← назад
        </Link>
        <span style={{ color: "var(--fg-dark-mute)", fontSize: "12px" }}>|</span>
        <span style={{ color: "var(--fg-dark-mute)", fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {initialPost ? `admin / posts / ${initialPost.slug} / edit` : "admin / posts / new"}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
          {error && <span style={{ color: "#f87171", fontSize: "12px" }}>{error}</span>}
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#a8a29e", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              style={{ accentColor: "var(--accent)", cursor: "pointer" }}
            />
            опубликовать
          </label>
          {slug && (
            <Link
              href={`/r/${slug}`}
              target="_blank"
              style={{ fontSize: "12px", color: "var(--fg-dark-mute)", textDecoration: "none", border: "1px solid oklch(0.3 0.015 60)", borderRadius: "4px", padding: "4px 10px" }}
            >
              читалка ↗
            </Link>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "var(--fg-mute)" : "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "6px 18px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: MONO,
            }}
          >
            {loading ? "сохранение..." : "сохранить"}
          </button>
        </div>
      </div>

      {/* Cover image zone */}
      <input
        ref={coverRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.gif"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleCoverUpload(f);
          e.target.value = "";
        }}
      />
      <div
        onClick={() => coverRef.current?.click()}
        style={{
          position: "relative",
          width: "100%",
          height: coverImage ? "260px" : "80px",
          background: coverImage ? "transparent" : "var(--bg-sunken, oklch(0.96 0.014 80))",
          borderBottom: "1px solid var(--border)",
          cursor: "pointer",
          overflow: "hidden",
          transition: "height 0.2s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {coverImage ? (
          <>
            <img
              src={coverImage}
              alt="обложка"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(28,25,23,0.6) 0%, transparent 60%)",
              display: "flex", alignItems: "flex-end", justifyContent: "space-between",
              padding: "16px 24px",
            }}>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px" }}>нажмите чтобы сменить обложку</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setCoverImage(""); }}
                style={{
                  background: "rgba(28,25,23,0.7)", border: "none", color: "#a8a29e",
                  fontSize: "11px", padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontFamily: MONO,
                }}
              >
                убрать
              </button>
            </div>
          </>
        ) : (
          <span style={{ color: "#a8a29e", fontSize: "12px" }}>
            {coverUploading ? "загружаю..." : "+ добавить обложку"}
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, maxWidth: "960px", width: "100%", margin: "0 auto", padding: "28px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Заголовок статьи..."
          style={{
            border: "none",
            borderBottom: "2px solid var(--border)",
            background: "transparent",
            fontSize: "26px",
            fontWeight: 600,
            color: "var(--fg)",
            fontFamily: "var(--font-serif)",
            outline: "none",
            padding: "8px 0 12px",
            width: "100%",
          }}
          onFocus={(e) => (e.target.style.borderBottomColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderBottomColor = "var(--border)")}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: "14px" }}>
          <div>
            <label style={labelStyle}>slug</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="moya-statya" style={fieldStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
          </div>
          <div>
            <label style={labelStyle}>теги</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="rust, личное" style={fieldStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
          </div>
          <div>
            <label style={labelStyle}>описание</label>
            <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Краткое описание для карточки и Telegram" style={fieldStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
          </div>
        </div>

        <MarkdownEditor value={body} onChange={setBody} token={token} />
      </div>
    </form>
  );
}
