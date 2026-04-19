import Link from "next/link";
import { Post } from "@/lib/types";
import { DateBadge } from "./DateBadge";
import { TagPill } from "./TagPill";

interface Props {
  post: Post;
  commentCount?: number;
  featured?: boolean;
}

function readingTime(body: string) {
  return Math.max(1, Math.ceil(body.split(/\s+/).length / 200));
}

export function PostCard({ post, commentCount = 0, featured = false }: Props) {
  const href = `/r/${post.slug}`;
  const coverHeight = featured ? 320 : 150;

  return (
    <article style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {post.cover_image ? (
        <Link href={href} style={{ display: "block", borderRadius: 8, overflow: "hidden", lineHeight: 0, marginBottom: featured ? 20 : 0 }}>
          <img
            src={post.cover_image}
            alt={post.title}
            style={{ width: "100%", height: coverHeight, objectFit: "cover", display: "block" }}
          />
        </Link>
      ) : (
        <Link href={href} style={{ display: "block", borderRadius: 8, overflow: "hidden", lineHeight: 0, marginBottom: featured ? 20 : 0 }}>
          <div style={{
            width: "100%",
            height: coverHeight,
            background: "repeating-linear-gradient(135deg, oklch(0.92 0.04 65) 0 6px, oklch(0.94 0.03 65) 6px 12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--fg-faint)",
            letterSpacing: "0.05em",
          }}>
            cover · 16:9
          </div>
        </Link>
      )}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {post.tags.map((t, i) => (
          <TagPill key={t} tag={t} href={`/tags/${t}`} variant={i % 2 === 1 ? "amber" : "orange"} />
        ))}
      </div>

      <div style={{ display: "flex", gap: featured ? 16 : 12 }}>
        <DateBadge dateStr={post.created_at} size={featured ? "lg" : "md"} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link href={href} style={{ display: "block", textDecoration: "none" }}>
            <h2 style={{
              margin: 0,
              fontFamily: "var(--font-serif)",
              fontSize: featured ? 34 : 20,
              fontWeight: 600,
              letterSpacing: featured ? "-0.02em" : "-0.01em",
              lineHeight: 1.15,
              color: "var(--fg)",
            }}>
              {post.title}
            </h2>
          </Link>
          {post.excerpt && (
            <p style={{
              margin: "6px 0 0",
              fontSize: featured ? 15 : 13,
              color: "var(--fg-mute)",
              lineHeight: 1.55,
              maxWidth: featured ? 620 : undefined,
            }}>
              {post.excerpt}
            </p>
          )}
          <div style={{
            marginTop: 8,
            fontSize: 11,
            color: "var(--fg-faint)",
            display: "flex",
            gap: 12,
            fontFamily: "var(--font-mono)",
          }}>
            <span>{readingTime(post.body)} мин чтения</span>
            <span>💬 {commentCount}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
