import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
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

export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await api.getPost(slug).catch(() => null);
  if (!post) return {};

  const images = post.cover_image ? [{ url: post.cover_image, width: 1200, height: 630 }] : [];

  return {
    title: post.title,
    description: post.excerpt || post.body.slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.body.slice(0, 160),
      type: "article",
      images,
    },
    twitter: {
      card: post.cover_image ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt || post.body.slice(0, 160),
      images: post.cover_image ? [post.cover_image] : [],
    },
  };
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

      {post.cover_image && (
        <div style={{ width: "100%", height: "340px", overflow: "hidden", position: "relative" }}>
          <img
            src={post.cover_image}
            alt={post.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, transparent 40%, rgba(250,250,249,0.95) 100%)",
          }} />
        </div>
      )}

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: post.cover_image ? "0 24px 40px" : "40px 24px" }}>
        <Link href="/" style={{ fontSize: "14px", color: "#f97316", textDecoration: "none", display: "block", marginBottom: "24px", marginTop: post.cover_image ? "0" : undefined }}>
          ← Все статьи
        </Link>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
          {post.tags.map((t) => <TagPill key={t} tag={t} href={`/tags/${t}`} />)}
        </div>

        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "20px" }}>
          <DateBadge dateStr={post.created_at} />
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#1c1917", lineHeight: 1.3 }}>
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
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#1c1917", marginBottom: "16px" }}>
            Комментарии ({comments.length})
          </h2>
          <CommentList comments={comments} />
          <CommentForm slug={slug} />
        </section>
      </div>
    </>
  );
}
