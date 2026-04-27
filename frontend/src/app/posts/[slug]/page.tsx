import { notFound } from "next/navigation";
import { Metadata } from "next";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { ArticleView } from "@/components/ArticleView";

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
  const postUrl = `${SITE}/posts/${slug}`;
  const images = post.cover_image ? [{ url: post.cover_image, width: 1200, height: 630 }] : [];

  return {
    title: post.title,
    description: desc,
    alternates: { canonical: postUrl },
    openGraph: {
      title: post.title,
      description: desc,
      type: "article",
      url: postUrl,
      images,
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      authors: ["impelix"],
      tags: post.tags,
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

  const [post, comments, allPosts] = await Promise.all([
    api.getPost(slug).catch(() => null),
    api.listComments(slug).catch(() => []),
    api.listPosts(undefined, 50, 0).catch(() => []),
  ]);

  if (!post) notFound();

  // Find next post: the post immediately after current in sorted list
  const sortedPosts = [...allPosts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const currentIndex = sortedPosts.findIndex((p) => p.slug === slug);
  const nextPost =
    currentIndex !== -1 && currentIndex + 1 < sortedPosts.length
      ? sortedPosts[currentIndex + 1]
      : null;

  // Find related posts: same first tag, exclude current, take up to 3
  let relatedPosts: typeof allPosts = [];
  if (post.tags.length > 0) {
    const firstTag = post.tags[0];
    const taggedPosts = await api.listPosts(firstTag, 5, 0).catch(() => []);
    relatedPosts = taggedPosts.filter((p) => p.slug !== slug).slice(0, 3);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || post.body.slice(0, 160),
    datePublished: post.created_at,
    dateModified: post.updated_at,
    author: { "@type": "Person", name: "impelix", url: SITE },
    publisher: { "@type": "Person", name: "impelix", url: SITE },
    url: `${SITE}/posts/${slug}`,
    ...(post.cover_image ? { image: post.cover_image } : {}),
    ...(post.tags.length > 0 ? { keywords: post.tags.join(", ") } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <ArticleView
        post={post}
        comments={comments}
        nextPost={nextPost}
        relatedPosts={relatedPosts}
      />
    </>
  );
}
