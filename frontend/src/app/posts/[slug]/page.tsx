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
import { ShareButton } from "@/components/ShareButton";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://impelix.dev";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await api.getPost(slug).catch(() => null);
  if (!post) return {};

  const desc = post.excerpt || post.body.slice(0, 160);
  const readerUrl = `${SITE}/r/${slug}`;
  const images = post.cover_image ? [{ url: post.cover_image, width: 1200, height: 630 }] : [];

  return {
    title: post.title,
    description: desc,
    alternates: { canonical: readerUrl },
    openGraph: {
      title: post.title,
      description: desc,
      type: "article",
      url: readerUrl,
      images,
    },
    twitter: {
      card: post.cover_image ? "summary_large_image" : "summary",
      title: post.title,
      description: desc,
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
            background: "linear-gradient(to bottom, transparent 40%, oklch(0.985 0.008 80 / 0.95) 100%)",
          }} />
        </div>
      )}

      <div style={{ maxWidth: 680, margin: "0 auto", padding: post.cover_image ? "0 24px 64px" : "40px 24px 64px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Link href="/" style={{ fontSize: 13, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
            ← все статьи
          </Link>
          <ShareButton slug={post.slug} />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {post.tags.map((t, i) => <TagPill key={t} tag={t} href={`/tags/${t}`} variant={i % 2 === 1 ? "amber" : "orange"} />)}
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
          <DateBadge dateStr={post.created_at} size="lg" />
          <div>
            <h1 style={{
              fontSize: 30,
              fontWeight: 600,
              fontFamily: "var(--font-serif)",
              color: "var(--fg)",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              margin: 0,
            }}>
              {post.title}
            </h1>
            <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 12, color: "var(--fg-faint)", fontFamily: "var(--font-mono)" }}>
              <span>{Math.max(1, Math.ceil(post.body.split(/\s+/).length / 200))} мин чтения</span>
              <span>💬 {comments.length}</span>
            </div>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid var(--border)", marginBottom: 24 }} />

        <PostBody body={post.body} />

        <section style={{ marginTop: 48, paddingTop: 24, borderTop: "2px solid var(--accent)" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--fg)", marginBottom: 16, fontFamily: "var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Комментарии ({comments.length})
          </h2>
          <CommentList comments={comments} />
          <CommentForm slug={slug} />
        </section>
      </div>
    </>
  );
}
