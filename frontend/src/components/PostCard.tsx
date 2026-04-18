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
    <article className="pb-5 mb-5 border-b border-stone-100 last:border-0 last:mb-0 last:pb-0">
      <div className="flex gap-1.5 mb-2 flex-wrap">
        {post.tags.map((t) => (
          <TagPill key={t} tag={t} href={`/tags/${t}`} />
        ))}
      </div>
      <div className="flex gap-3.5 items-start">
        <DateBadge dateStr={post.created_at} />
        <div>
          <Link href={`/posts/${post.slug}`} className="font-serif text-[17px] font-bold text-stone-900 leading-snug hover:text-orange-600 transition-colors">
            {post.title}
          </Link>
          <p className="text-sm text-stone-500 mt-1.5 leading-relaxed">{post.excerpt}</p>
          <div className="flex gap-3 mt-2 text-xs text-stone-400">
            <span>{readingTime(post.body)} мин чтения</span>
            <span>💬 {commentCount}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
