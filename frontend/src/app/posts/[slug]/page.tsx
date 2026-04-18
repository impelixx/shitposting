import { notFound } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { DateBadge } from "@/components/DateBadge";
import { TagPill } from "@/components/TagPill";
import { PostBody } from "@/components/PostBody";
import { CommentList } from "@/components/CommentList";
import { CommentForm } from "@/components/CommentForm";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await api.getPost(slug).catch(() => null);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const [post, comments] = await Promise.all([
    api.getPost(slug).catch(() => null),
    api.listComments(slug).catch(() => []),
  ]);

  if (!post) notFound();

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/" className="text-sm text-orange-500 hover:underline mb-6 block">
        ← Все статьи
      </Link>

      <div className="flex gap-2 mb-4 flex-wrap">
        {post.tags.map((t) => <TagPill key={t} tag={t} href={`/tags/${t}`} />)}
      </div>

      <div className="flex gap-4 items-start mb-5">
        <DateBadge dateStr={post.created_at} />
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 leading-snug">{post.title}</h1>
          <div className="flex gap-4 mt-2 text-xs text-stone-400">
            <span>{Math.max(1, Math.ceil(post.body.split(/\s+/).length / 200))} мин чтения</span>
            <span>💬 {comments.length}</span>
          </div>
        </div>
      </div>

      <hr className="border-stone-200 mb-6" />

      <PostBody body={post.body} />

      <section className="mt-10 pt-6 border-t-2 border-orange-500">
        <h2 className="font-serif text-base font-bold text-stone-900 mb-4">
          Комментарии ({comments.length})
        </h2>
        <CommentList comments={comments} />
        <CommentForm slug={slug} />
      </section>
    </div>
  );
}
