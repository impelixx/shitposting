"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";
import { Post } from "@/lib/types";
import { PostBody } from "@/components/PostBody";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// ── helpers ──────────────────────────────────────────────────────────────────

function wordCount(text: string) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

function readMin(wc: number) {
  return Math.max(1, Math.round(wc / 200));
}

// ── sub-components ────────────────────────────────────────────────────────────

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontSize: 11,
      color: "var(--fg-mute)",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      fontWeight: 600,
      marginBottom: 6,
    }}
  >
    {children}
  </div>
);

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background: "var(--bg-elev)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  color: "var(--fg)",
  fontFamily: "var(--font-sans)",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const Divider = () => (
  <div style={{ width: 1, height: 20, background: "var(--border)", flexShrink: 0 }} />
);

interface ToolbarButtonProps {
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}
const ToolbarButton = ({ onClick, title, children }: ToolbarButtonProps) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 32,
        height: 32,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 4,
        fontSize: 13,
        color: hovered ? "var(--accent)" : "var(--fg-mute)",
        background: hovered ? "var(--bg-sunken)" : "transparent",
        border: "none",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
};

// ── main component ─────────────────────────────────────────────────────────────

interface Props {
  initialPost?: Post;
}

type TabKey = "markdown" | "split" | "preview";

export function PostForm({ initialPost }: Props) {
  const router = useRouter();
  const token = auth.getToken() ?? undefined;
  const coverRef = useRef<HTMLInputElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // ── state ──
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? "");
  const [tags, setTags] = useState<string[]>(
    (initialPost?.tags ?? []).filter(Boolean).map((t) => t.startsWith("#") ? t.slice(1) : t)
  );
  const [tagInput, setTagInput] = useState("");
  const [allTags, setAllTags] = useState<string[]>([]);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [body, setBody] = useState(initialPost?.body ?? "");
  const [coverImage, setCoverImage] = useState(initialPost?.cover_image ?? "");
  const [published, setPublished] = useState(initialPost?.published ?? false);
  const [loading, setLoading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [bodyUploading, setBodyUploading] = useState(false);
  const [editorDragging, setEditorDragging] = useState(false);
  const [coverDragging, setCoverDragging] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("split");

  // ── load existing tags ──
  useEffect(() => {
    api.listTags().then((ts) => setAllTags(ts.map((t) => t.slug))).catch(() => {});
  }, []);

  // ── cover upload ──
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

  // ── drop image: instant blob preview → upload → replace URL ──
  const dropImages = async (files: File[], insertAt: number) => {
    for (const file of files) {
      // 1. show instantly via blob URL
      const blobUrl = URL.createObjectURL(file);
      const snippet = `\n![](${blobUrl})\n`;
      setBody((prev) => prev.slice(0, insertAt) + snippet + prev.slice(insertAt));

      if (!token) continue;
      // 2. upload in background
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch(`${BASE}/api/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
        if (!res.ok) throw new Error(`${res.status}`);
        const { url } = await res.json();
        // 3. swap blob URL for real URL
        setBody((prev) => prev.replace(blobUrl, url));
        URL.revokeObjectURL(blobUrl);
      } catch (err) {
        setError(`Ошибка загрузки: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  };

  const handleCoverUploadRef = useRef(handleCoverUpload);
  useEffect(() => {
    handleCoverUploadRef.current = handleCoverUpload;
  });

  const dropImagesRef = useRef(dropImages);
  useEffect(() => { dropImagesRef.current = dropImages; });

  // ── paste listener ──
  useEffect(() => {
    if (!token) return;
    const handlePaste = async (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items ?? []);
      const imageItem = items.find((it) => it.type.startsWith("image/"));
      if (!imageItem) return;
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (!file) return;
      const target = e.target as HTMLElement;
      if (target.closest("textarea") === taRef.current) {
        // paste inside editor → insert at cursor with instant preview
        const insertAt = taRef.current?.selectionStart ?? 0;
        await dropImagesRef.current([file], insertAt);
      } else {
        // paste anywhere else → set as cover
        await handleCoverUploadRef.current(file);
      }
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [token]);

  // ── submit ──
  const handleSave = async (publishedValue: boolean) => {
    setLoading(true);
    setError("");
    if (!token) {
      router.push("/login");
      return;
    }
    const data = {
      title,
      slug,
      excerpt,
      body,
      cover_image: coverImage,
      tags: tags.map((t) => t.trim()).filter(Boolean),
      published: publishedValue,
    };
    try {
      if (initialPost) {
        await api.updatePost(token, initialPost.slug, data);
      } else {
        await api.createPost(token, data);
      }
      setPublished(publishedValue);
      router.push("/admin");
    } catch {
      setError("Ошибка при сохранении");
    } finally {
      setLoading(false);
    }
  };

  // keep old handleSubmit wired to form to prevent accidental native submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // ── tags ──
  const addTag = (raw: string) => {
    const trimmed = raw.trim().replace(/,+$/, "").trim();
    if (!trimmed) return;
    const tag = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
    }
    setTagInput("");
    setTagDropdownOpen(false);
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  // ── toolbar ops ──
  const wrapSelection = (before: string, after?: string) => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = ta.value.slice(start, end);
    const closeWith = after ?? before;
    const newValue =
      ta.value.slice(0, start) +
      before +
      selected +
      closeWith +
      ta.value.slice(end);
    setBody(newValue);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(
        start + before.length,
        start + before.length + selected.length
      );
    }, 0);
  };

  const insertLine = (prefix: string) => {
    const ta = taRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const lineStart = ta.value.lastIndexOf("\n", pos - 1) + 1;
    const newValue =
      ta.value.slice(0, lineStart) + prefix + ta.value.slice(lineStart);
    setBody(newValue);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(pos + prefix.length, pos + prefix.length);
    }, 0);
  };

  // ── derived ──
  const wc = wordCount(body);
  const rm = readMin(wc);
  const breadcrumb = slug ? `nano ${slug}.md` : "nano article.md";

  const tabs: { key: TabKey; label: string }[] = [
    { key: "markdown", label: "Markdown" },
    { key: "split", label: "Split" },
    { key: "preview", label: "Preview" },
  ];

  const showEdit = activeTab === "markdown" || activeTab === "split";
  const showPreview = activeTab === "preview" || activeTab === "split";

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--fg)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* ── TOP BAR ── */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: "var(--bg-elev)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        {/* left */}
        <Link
          href="/admin"
          style={{
            display: "flex",
            gap: 8,
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "var(--fg-mute)",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          ← назад
        </Link>
        <Divider />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <span style={{ color: "var(--accent)" }}>&gt;</span> {breadcrumb}
        </span>

        {/* right */}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: "var(--fg-faint)",
              fontFamily: "var(--font-mono)",
              whiteSpace: "nowrap",
            }}
          >
            {wc} слов · {rm} мин чтения
          </span>

          <span
            style={{
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              color: published
                ? "oklch(0.6 0.14 145)"
                : "oklch(0.72 0.12 80)",
              whiteSpace: "nowrap",
            }}
          >
            ● {published ? "опубликовано" : "черновик"}
          </span>

          {error && (
            <span style={{ color: "#f87171", fontSize: 12 }}>{error}</span>
          )}

          <Divider />

          <button
            type="button"
            disabled={loading}
            onClick={() => handleSave(false)}
            style={{
              padding: "8px 14px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              fontSize: 13,
              color: "var(--fg)",
              background: "transparent",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "var(--font-sans)",
              whiteSpace: "nowrap",
            }}
          >
            Сохранить черновик
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleSave(true)}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              background: loading ? "var(--fg-mute)" : "var(--accent)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "var(--font-sans)",
              whiteSpace: "nowrap",
            }}
          >
            {loading ? "сохраняю..." : published ? "Сохранить" : "Опубликовать →"}
          </button>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          minHeight: 0,
        }}
      >
        {/* ── LEFT META SIDEBAR ── */}
        <div
          style={{
            borderRight: "1px solid var(--border)",
            padding: 24,
            overflowY: "auto",
            background: "var(--bg-elev)",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* 1. ЗАГОЛОВОК */}
          <div>
            <FieldLabel>Заголовок</FieldLabel>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Заголовок статьи"
              style={inputStyle}
            />
          </div>

          {/* 2. SLUG */}
          <div>
            <FieldLabel>Slug</FieldLabel>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "var(--bg-elev)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--fg-faint)",
                  paddingLeft: 10,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                /r/
              </span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="moya-statya"
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: "var(--fg)",
                  padding: "10px 10px 10px 4px",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* 3. ОПИСАНИЕ (excerpt) */}
          <div>
            <FieldLabel>Описание</FieldLabel>
            <input
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Краткое описание для карточки"
              style={inputStyle}
            />
          </div>

          {/* 4. ОБЛОЖКА */}
          <div>
            <FieldLabel>Обложка</FieldLabel>
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
            {coverImage ? (
              <div style={{ position: "relative", borderRadius: 6, overflow: "hidden" }}>
                <img
                  src={coverImage}
                  alt="обложка"
                  style={{ width: "100%", display: "block", borderRadius: 6 }}
                />
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    background: "rgba(0,0,0,0.55)",
                    border: "none",
                    color: "#fff",
                    fontSize: 14,
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setCoverDragging(true); }}
                onDragEnter={(e) => { e.preventDefault(); setCoverDragging(true); }}
                onDragLeave={() => setCoverDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setCoverDragging(false);
                  const file = Array.from(e.dataTransfer.files).find((f) =>
                    f.type.startsWith("image/")
                  );
                  if (file) handleCoverUpload(file);
                }}
                onClick={() => coverRef.current?.click()}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: "24px 16px",
                  border: `2px dashed ${coverDragging ? "var(--accent)" : "var(--border-strong, oklch(0.82 0.015 65))"}`,
                  borderRadius: 6,
                  background: coverDragging ? "var(--accent-bg)" : "var(--bg-sunken, oklch(0.96 0.014 80))",
                  fontSize: 12,
                  color: coverDragging ? "var(--rust)" : "var(--fg-mute)",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.1s",
                }}
              >
                {coverUploading ? (
                  <span>загружаю...</span>
                ) : coverDragging ? (
                  <>
                    <span style={{ fontSize: 24 }}>📎</span>
                    <span style={{ fontWeight: 600 }}>отпусти чтобы загрузить</span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 24 }}>📎</span>
                    <span>перетащи файл или клик</span>
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: "var(--font-mono)",
                        color: "var(--fg-faint)",
                      }}
                    >
                      jpg / png / webp
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 5. ТЕГИ */}
          <div>
            <FieldLabel>Теги</FieldLabel>
            {tags.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                {tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: "var(--accent-bg)",
                      color: "var(--rust)",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 500,
                      padding: "2px 8px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      style={{
                        color: "var(--rust)",
                        fontSize: 12,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div style={{ position: "relative" }}>
              <input
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  setTagDropdownOpen(e.target.value.length > 0);
                }}
                placeholder="новый тег + Enter"
                style={{ ...inputStyle, fontSize: 12 }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                  if (e.key === "Escape") setTagDropdownOpen(false);
                }}
                onFocus={() => setTagDropdownOpen(tagInput.length > 0)}
                onBlur={() => setTimeout(() => setTagDropdownOpen(false), 150)}
              />
              {tagDropdownOpen && (() => {
                const q = tagInput.toLowerCase().replace(/^#/, "");
                const matches = allTags.filter(
                  (t) => t.toLowerCase().includes(q) && !tags.includes(t)
                );
                const showCreate = q && !allTags.some((t) => t.toLowerCase() === q) && !tags.includes(q);
                if (matches.length === 0 && !showCreate) return null;
                return (
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    marginTop: 4,
                    background: "var(--bg-elev)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    zIndex: 20,
                    overflow: "hidden",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                  }}>
                    {matches.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onMouseDown={() => addTag(t)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "8px 12px",
                          background: "transparent",
                          border: "none",
                          borderBottom: "1px solid var(--border)",
                          fontSize: 12,
                          color: "var(--fg)",
                          cursor: "pointer",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        #{t}
                      </button>
                    ))}
                    {showCreate && (
                      <button
                        type="button"
                        onMouseDown={() => addTag(q)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "8px 12px",
                          background: "transparent",
                          border: "none",
                          fontSize: 12,
                          color: "var(--accent)",
                          cursor: "pointer",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        + создать «{q}»
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* 6. СТАТУС */}
          <div>
            <FieldLabel>Статус</FieldLabel>
            <div style={{ display: "flex", gap: 6 }}>
              {(
                [
                  { label: "Черновик", value: false },
                  { label: "Опубликовано", value: true },
                ] as const
              ).map(({ label, value }) => {
                const active = published === value;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setPublished(value)}
                    style={{
                      flex: 1,
                      padding: 8,
                      borderRadius: 6,
                      fontSize: 12,
                      border: active
                        ? "1px solid var(--accent)"
                        : "1px solid var(--border)",
                      background: active ? "var(--accent-bg)" : "transparent",
                      color: active ? "var(--rust)" : "var(--fg-mute)",
                      fontWeight: active ? 600 : 400,
                      cursor: "pointer",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* File info block */}
          <div
            style={{
              marginTop: 24,
              padding: 12,
              background: "var(--bg-sunken, oklch(0.96 0.014 80))",
              borderRadius: 6,
              fontSize: 11,
              color: "var(--fg-faint)",
              fontFamily: "var(--font-mono)",
              lineHeight: 1.6,
            }}
          >
            <div>📁 posts/{slug || "untitled"}.md</div>
            <div>↳ status: {published ? "published" : "draft"}</div>
          </div>
        </div>

        {/* ── MAIN EDITOR AREA ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          {/* Tabs + toolbar row */}
          <div
            style={{
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              gap: 8,
              background: "var(--bg-elev)",
              flexWrap: "wrap",
            }}
          >
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                style={{
                  padding: "12px 14px",
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  color:
                    activeTab === key ? "var(--accent)" : "var(--fg-mute)",
                  borderBottom: `2px solid ${
                    activeTab === key ? "var(--accent)" : "transparent"
                  }`,
                  background: "none",
                  border: "none",
                  borderBottomWidth: 2,
                  borderBottomStyle: "solid",
                  borderBottomColor:
                    activeTab === key ? "var(--accent)" : "transparent",
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}

            <Divider />

            <ToolbarButton title="Bold" onClick={() => wrapSelection("**")}>
              <strong>B</strong>
            </ToolbarButton>
            <ToolbarButton title="Italic" onClick={() => wrapSelection("*")}>
              <em>I</em>
            </ToolbarButton>
            <ToolbarButton
              title="Inline code"
              onClick={() => wrapSelection("`")}
            >
              &lt;&gt;
            </ToolbarButton>
            <ToolbarButton
              title="Link"
              onClick={() => wrapSelection("[", "](url)")}
            >
              🔗
            </ToolbarButton>

            <Divider />

            <ToolbarButton
              title="H1"
              onClick={() => insertLine("# ")}
            >
              H1
            </ToolbarButton>
            <ToolbarButton
              title="H2"
              onClick={() => insertLine("## ")}
            >
              H2
            </ToolbarButton>
            <ToolbarButton
              title="Blockquote"
              onClick={() => insertLine("> ")}
            >
              ❝
            </ToolbarButton>
            <ToolbarButton
              title="List item"
              onClick={() => insertLine("- ")}
            >
              ≡
            </ToolbarButton>
            <ToolbarButton
              title="Code block"
              onClick={() => wrapSelection("\n```\n", "\n```")}
            >
              &#123;&#125;
            </ToolbarButton>
            <ToolbarButton
              title="Image"
              onClick={() => wrapSelection("![", "](url)")}
            >
              🖼
            </ToolbarButton>
          </div>

          {/* Editor pane */}
          <div
            style={{
              flex: 1,
              display: "grid",
              gridTemplateColumns:
                activeTab === "split" ? "1fr 1fr" : "1fr",
              minHeight: 500,
            }}
          >
            {/* Edit pane */}
            {showEdit && (
              <div style={{ position: "relative", display: "flex", flexDirection: "column" }}>
                <textarea
                  ref={taRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  spellCheck={false}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.dataTransfer.dropEffect = "copy";
                    setEditorDragging(true);
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Focus so browser updates selectionStart as cursor moves over textarea
                    taRef.current?.focus();
                    setEditorDragging(true);
                  }}
                  onDragLeave={(e) => { e.preventDefault(); setEditorDragging(false); }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditorDragging(false);
                    const imgs = Array.from(e.dataTransfer.files).filter((f) =>
                      f.type.startsWith("image/")
                    );
                    if (!imgs.length) return;
                    const insertAt = taRef.current?.selectionStart ?? body.length;
                    await dropImages(imgs, insertAt);
                  }}
                  style={{
                    flex: 1,
                    width: "100%",
                    height: "100%",
                    padding: "24px 32px",
                    border: "none",
                    outline: "none",
                    resize: "none",
                    background: editorDragging ? "var(--accent-bg)" : "var(--bg)",
                    color: "var(--fg)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 14,
                    lineHeight: 1.7,
                    borderRight:
                      activeTab === "split"
                        ? "1px solid var(--border)"
                        : undefined,
                    boxSizing: "border-box",
                    transition: "background 0.1s",
                  }}
                />
                {editorDragging && (
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                    borderRight: activeTab === "split" ? "1px solid var(--border)" : undefined,
                  }}>
                    <div style={{
                      padding: "16px 28px",
                      background: "var(--accent)",
                      color: "#fff",
                      borderRadius: 8,
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      fontWeight: 600,
                    }}>
                      📎 отпусти чтобы вставить
                    </div>
                  </div>
                )}
                {bodyUploading && (
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(0,0,0,0.08)",
                    pointerEvents: "none",
                  }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)" }}>
                      загружаю...
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Preview pane */}
            {showPreview && (
              <div
                style={{
                  overflowY: "auto",
                  padding: "24px 32px",
                  background: "var(--bg)",
                }}
              >
                <div style={{ maxWidth: 680, margin: "0 auto" }}>
                  {title && (
                    <h1
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: 36,
                        margin: "0 0 8px",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.15,
                        color: "var(--fg)",
                      }}
                    >
                      {title}
                    </h1>
                  )}
                  {tags.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        marginBottom: 16,
                        flexWrap: "wrap",
                      }}
                    >
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            background: "var(--accent-bg)",
                            color: "var(--rust)",
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 500,
                            padding: "2px 8px",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {coverImage && (
                    <img
                      src={coverImage}
                      alt="обложка"
                      style={{
                        width: "100%",
                        borderRadius: 8,
                        marginBottom: 24,
                        display: "block",
                      }}
                    />
                  )}
                  <PostBody body={body} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
