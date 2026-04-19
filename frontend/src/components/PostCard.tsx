import Link from "next/link";
import { Post } from "@/lib/types";
import { DateBadge } from "./DateBadge";
import { TagPill } from "./TagPill";

interface Props {
  post: Post;
  commentCount?: number;
}

function readingTime(body: string) {
  return Math.max(1, Math.ceil(body.split(/\s+/).length / 200));
}

export function PostCard({ post, commentCount = 0 }: Props) {
  const href = `/r/${post.slug}`;

  return (
    <article style={{ paddingBottom: "24px", marginBottom: "24px", borderBottom: "1px solid #f5f5f4" }}>
      {post.cover_image && (
        <Link href={href} style={{ display: "block", marginBottom: "14px", borderRadius: "8px", overflow: "hidden", lineHeight: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover_image}
            alt={post.title}
            style={{ width: "100%", height: "180px", objectFit: "cover", display: "block", transition: "opacity 0.15s" }}
          />
        </Link>
      )}

      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
        {post.tags.map((t) => (
          <TagPill key={t} tag={t} href={`/tags/${t}`} />
        ))}
      </div>

      <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
        <DateBadge dateStr={post.created_at} />
        <div style={{ flex: 1 }}>
          <Link
            href={href}
            style={{
              fontSize: "17px",
              fontWeight: 700,
              color: "#1c1917",
              lineHeight: 1.35,
              textDecoration: "none",
              display: "block",
              marginBottom: "5px",
            }}
          >
            {post.title}
          </Link>
          {post.excerpt && (
            <p style={{ fontSize: "13px", color: "#57534e", lineHeight: 1.6 }}>
              {post.excerpt}
            </p>
          )}
          <div style={{ display: "flex", gap: "12px", marginTop: "6px", fontSize: "11px", color: "#a8a29e" }}>
            <span>{readingTime(post.body)} мин чтения</span>
            <span>💬 {commentCount}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
