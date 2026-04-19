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
  return (
    <article style={{ paddingBottom: "20px", marginBottom: "20px", borderBottom: "1px solid #f5f5f4" }}>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
        {post.tags.map((t) => (
          <TagPill key={t} tag={t} href={`/tags/${t}`} />
        ))}
      </div>
      <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
        <DateBadge dateStr={post.created_at} />
        <div>
          <Link
            href={`/posts/${post.slug}`}
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "17px",
              fontWeight: 700,
              color: "#1c1917",
              lineHeight: 1.35,
              textDecoration: "none",
              display: "block",
              marginBottom: "5px",
            }}
            className="hover:text-orange-600 transition-colors"
          >
            {post.title}
          </Link>
          <p style={{ fontSize: "13px", color: "#57534e", lineHeight: 1.6 }}>
            {post.excerpt}
          </p>
          <div style={{ display: "flex", gap: "12px", marginTop: "6px", fontSize: "11px", color: "#a8a29e" }}>
            <span>{readingTime(post.body)} мин чтения</span>
            <span>💬 {commentCount}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
