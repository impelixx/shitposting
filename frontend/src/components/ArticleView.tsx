"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://impelix.dev";
import { Post, Comment } from "@/lib/types";
import { TagPill } from "@/components/TagPill";
import { PostBody } from "@/components/PostBody";
import { CommentForm } from "@/components/CommentForm";
import { CommentList } from "@/components/CommentList";
import { api } from "@/lib/api";

// ─── TOC helpers ─────────────────────────────────────────────────────────────

interface TocEntry {
  level: number;
  text: string;
  id: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-zа-яё\s]/gi, "")
    .replace(/\s+/g, "-");
}

function parseToc(body: string): TocEntry[] {
  const headingRe = /^(#{1,4})\s+(.+)/gm;
  const entries: TocEntry[] = [];
  let match: RegExpExecArray | null;
  while ((match = headingRe.exec(body)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    entries.push({ level, text, id: slugify(text) });
  }
  return entries;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function readMinutes(body: string) {
  return Math.max(1, Math.ceil(body.split(/\s+/).length / 200));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LabelCap({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        color: "var(--fg-faint)",
        fontWeight: 600,
        fontFamily: "var(--font-mono)",
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

function TocSidebar({ toc, activeId }: { toc: TocEntry[]; activeId: string }) {
  if (toc.length === 0) return null;

  return (
    <aside
      style={{
        position: "sticky",
        top: 80,
        alignSelf: "start",
        maxHeight: "calc(100vh - 100px)",
        overflowY: "auto",
      }}
    >
      <LabelCap>содержание</LabelCap>
      <nav
        style={{
          borderLeft: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          fontSize: 13,
        }}
      >
        {toc.map((item) => {
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(item.id);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              style={{
                display: "block",
                paddingLeft: 12 + (item.level - 1) * 12,
                paddingTop: 4,
                paddingBottom: 4,
                marginLeft: -1,
                borderLeft: `2px solid ${isActive ? "var(--accent)" : "transparent"}`,
                color: isActive ? "var(--accent)" : "var(--fg-mute)",
                fontWeight: isActive ? 600 : 400,
                textDecoration: "none",
                transition: "all 0.15s",
                lineHeight: 1.35,
              }}
            >
              {item.text}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}

function RightRail({
  nextPost,
  relatedPosts,
  firstTag,
}: {
  nextPost: Post | null;
  relatedPosts: Post[];
  firstTag: string;
}) {
  return (
    <aside
      style={{
        position: "sticky",
        top: 80,
        alignSelf: "start",
        display: "flex",
        flexDirection: "column",
        gap: 32,
      }}
    >
      {nextPost && (
        <div>
          <LabelCap>следующая</LabelCap>
          <div
            style={{
              padding: 14,
              background: "var(--bg-elev)",
              border: "1px solid var(--border)",
              borderRadius: 8,
            }}
          >
            <Link
              href={`/posts/${nextPost.slug}`}
              style={{ textDecoration: "none", display: "block" }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "var(--fg-faint)",
                  fontFamily: "var(--font-mono)",
                  marginBottom: 4,
                }}
              >
                {formatDate(nextPost.created_at)}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 15,
                  fontWeight: 600,
                  lineHeight: 1.25,
                  color: "var(--fg)",
                }}
              >
                {nextPost.title}
              </div>
            </Link>
          </div>
        </div>
      )}

      {relatedPosts.length > 0 && (
        <div>
          <LabelCap>по тегу {firstTag}</LabelCap>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {relatedPosts.map((p) => (
              <Link
                key={p.slug}
                href={`/posts/${p.slug}`}
                style={{
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  fontSize: 13,
                  color: "var(--fg-mute)",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--fg-faint)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {formatDate(p.created_at)}
                </span>
                <span style={{ marginTop: 2 }}>{p.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  post: Post;
  comments: Comment[];
  nextPost: Post | null;
  relatedPosts: Post[];
}

export function ArticleView({ post, comments, nextPost, relatedPosts }: Props) {
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState("");
  const [copied, setCopied] = useState(false);
  const [views, setViews] = useState(post.views);
  const articleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.trackView(post.slug).then((r) => setViews(r.views)).catch(() => {});
  }, [post.slug]);

  const toc = parseToc(post.body);
  const firstTag = post.tags[0] ?? "";

  const handleScroll = useCallback(() => {
    const el = articleRef.current;
    if (!el) return;

    // Progress bar
    const top = el.offsetTop;
    const height = el.offsetHeight;
    const scrolled = window.scrollY - top;
    const available = height - window.innerHeight;
    setProgress(available > 0 ? Math.min(1, Math.max(0, scrolled / available)) : 0);

    // Active TOC heading
    let active = "";
    for (const item of toc) {
      const headingEl = document.getElementById(item.id);
      if (headingEl && headingEl.getBoundingClientRect().top < 120) {
        active = item.id;
      }
    }
    setActiveId(active);
  }, [toc]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/r/${post.slug}`
    : `${SITE}/r/${post.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const shareButtonStyle: React.CSSProperties = {
    padding: "6px 12px",
    border: "1px solid var(--border)",
    borderRadius: 4,
    fontSize: 12,
    color: "var(--fg-mute)",
    fontFamily: "var(--font-mono)",
    background: "transparent",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
  };

  return (
    <>
      {/* Fixed progress bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          zIndex: 50,
          background: "transparent",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: "var(--accent)",
            transition: "width 0.05s",
          }}
        />
      </div>

      {/* Cover image */}
      {post.cover_image && (
        <div style={{ width: "100%", height: 340, overflow: "hidden", position: "relative" }}>
          <img
            src={post.cover_image}
            alt={post.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, transparent 40%, oklch(0.985 0.008 80 / 0.95) 100%)",
            }}
          />
        </div>
      )}

      {/* 3-column grid */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "40px 24px",
          display: "grid",
          gridTemplateColumns: "220px 1fr 220px",
          gap: 40,
          alignItems: "start",
        }}
      >
        {/* Left: TOC */}
        <TocSidebar toc={toc} activeId={activeId} />

        {/* Center: Article */}
        <main>
          {/* Tags */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {post.tags.map((t, i) => (
              <TagPill
                key={t}
                tag={t}
                href={`/tags/${t}`}
                variant={i % 2 === 1 ? "amber" : "orange"}
              />
            ))}
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 42,
              fontWeight: 600,
              letterSpacing: "-0.025em",
              lineHeight: 1.12,
              margin: "0 0 16px",
              textWrap: "balance",
              color: "var(--fg)",
            } as React.CSSProperties}
          >
            {post.title}
          </h1>

          {/* Meta */}
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "var(--fg-faint)",
              paddingBottom: 24,
              borderBottom: "1px solid var(--border)",
              marginBottom: 32,
            }}
          >
            impelix · {formatDate(post.created_at)} · {readMinutes(post.body)} мин чтения · 👁 {views}
          </div>

          {/* Body */}
          <div ref={articleRef}>
            <PostBody body={post.body} />
          </div>

          {/* Footer actions */}
          <div
            style={{
              marginTop: 48,
              borderTop: "1px solid var(--border)",
              borderBottom: "1px solid var(--border)",
              padding: "24px 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            {/* Tags */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {post.tags.map((t, i) => (
                <TagPill
                  key={t}
                  tag={t}
                  href={`/tags/${t}`}
                  variant={i % 2 === 1 ? "amber" : "orange"}
                />
              ))}
            </div>

            {/* Share buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--fg-faint)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                поделиться:
              </span>
              <button onClick={handleCopyLink} style={shareButtonStyle}>
                {copied ? "✓ скопировано" : "скопировать"}
              </button>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(
                  shareUrl
                )}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={shareButtonStyle}
                onClick={(e) => {
                  e.preventDefault();
                  window.open(
                    `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`,
                    "_blank"
                  );
                }}
              >
                TG
              </a>
              <a
                href={`https://x.com/intent/tweet?url=${encodeURIComponent(
                  shareUrl
                )}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={shareButtonStyle}
                onClick={(e) => {
                  e.preventDefault();
                  window.open(
                    `https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`,
                    "_blank"
                  );
                }}
              >
                X
              </a>
            </div>
          </div>

          {/* Comments */}
          <section style={{ marginTop: 48 }}>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 24,
                margin: "0 0 24px",
                fontWeight: 600,
                color: "var(--fg)",
              }}
            >
              💬 Комментарии{" "}
              <span
                style={{
                  color: "var(--fg-faint)",
                  fontWeight: 400,
                  fontSize: 16,
                }}
              >
                · {comments.length}
              </span>
            </h2>
            <CommentList comments={comments} />
            <CommentForm slug={post.slug} />
          </section>
        </main>

        {/* Right: Rail */}
        <RightRail nextPost={nextPost} relatedPosts={relatedPosts} firstTag={firstTag} />
      </div>
    </>
  );
}
