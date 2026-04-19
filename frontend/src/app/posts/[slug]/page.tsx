import { notFound } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
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
    <>
      <Navbar />
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "40px 24px" }}>
        <Link href="/" style={{ fontSize: "14px", color: "#f97316", textDecoration: "none", display: "block", marginBottom: "24px" }}>
          ← Все статьи
        </Link>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
          {post.tags.map((t) => <TagPill key={t} tag={t} href={`/tags/${t}`} />)}
        </div>

        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "20px" }}>
          <DateBadge dateStr={post.created_at} />
          <div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "26px", fontWeight: 700, color: "#1c1917", lineHeight: 1.3 }}>
              {post.title}
            </h1>
            <div style={{ display: "flex", gap: "14px", marginTop: "8px", fontSize: "12px", color: "#a8a29e" }}>
              <span>{Math.max(1, Math.ceil(post.body.split(/\s+/).length / 200))} мин чтения</span>
              <span>💬 {comments.length}</span>
            </div>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #e7e5e4", marginBottom: "24px" }} />

        <PostBody body={post.body} />

        <section style={{ marginTop: "40px", paddingTop: "24px", borderTop: "2px solid #f97316" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "15px", fontWeight: 700, color: "#1c1917", marginBottom: "16px" }}>
            Комментарии ({comments.length})
          </h2>
          <CommentList comments={comments} />
          <CommentForm slug={slug} />
        </section>
      </div>
    </>
  );
}
