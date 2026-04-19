import { notFound } from "next/navigation";
import { Metadata } from "next";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import { api } from "@/lib/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 0;

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://impelix.dev";
const MONO = "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace";

async function mdToHtml(md: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(md);
  return String(result);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await api.getPost(slug).catch(() => null);
  if (!post) return {};

  const desc = post.excerpt || post.body.replace(/[#*`\[\]_~>]/g, "").slice(0, 200);
  const images = post.cover_image
    ? [{ url: post.cover_image, width: 1200, height: 630, alt: post.title }]
    : [];

  return {
    title: post.title,
    description: desc,
    alternates: { canonical: `${SITE}/r/${slug}` },
    openGraph: {
      title: post.title,
      description: desc,
      type: "article",
      url: `${SITE}/r/${slug}`,
      siteName: "impelix blog",
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
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

export default async function ReaderPage({ params }: Props) {
  const { slug } = await params;
  const post = await api.getPost(slug).catch(() => null);
  if (!post) notFound();

  const contentHtml = await mdToHtml(post.body);
  const readMin = Math.max(1, Math.ceil(post.body.split(/\s+/).length / 200));
  const date = new Date(post.created_at).toLocaleDateString("ru-RU", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { background: #fff; font-family: ${MONO}; }

          img.cover {
            width: 100%;
            max-height: 480px;
            object-fit: cover;
            display: block;
          }

          article {
            max-width: 660px;
            margin: 0 auto;
            padding: 40px 24px 80px;
          }

          .tags {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 16px;
          }
          .tags a {
            font-size: 11px;
            color: #f97316;
            background: #fff7ed;
            border: 1px solid #fed7aa;
            border-radius: 20px;
            padding: 2px 10px;
            text-decoration: none;
            font-family: ${MONO};
          }

          h1 {
            font-size: 32px;
            font-weight: 700;
            color: #1c1917;
            line-height: 1.25;
            margin-bottom: 20px;
            letter-spacing: -0.5px;
            font-family: ${MONO};
          }

          address {
            font-style: normal;
            font-size: 12px;
            color: #a8a29e;
            margin-bottom: 24px;
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            font-family: ${MONO};
          }

          hr { border: none; border-top: 1px solid #e7e5e4; margin-bottom: 32px; }

          .content { font-size: 17px; line-height: 1.85; color: #1c1917; font-family: ${MONO}; }
          .content p { margin-bottom: 1.2em; }
          .content h1, .content h2, .content h3, .content h4 {
            font-family: ${MONO};
            border-bottom: 1px solid #e7e5e4;
            padding-bottom: 6px;
            margin: 1.6em 0 0.8em;
            line-height: 1.3;
          }
          .content h2 { font-size: 22px; }
          .content h3 { font-size: 18px; }
          .content img { max-width: 100%; border-radius: 6px; margin: 16px 0; display: block; }
          .content a { color: #f97316; }
          .content code {
            background: #f5f5f4;
            color: #c2410c;
            border-radius: 3px;
            padding: 2px 6px;
            font-size: 15px;
            font-family: ${MONO};
          }
          .content pre {
            background: #1c1917;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            overflow-x: auto;
          }
          .content pre code {
            background: transparent;
            color: #e7e5e4;
            font-size: 14px;
            padding: 0;
          }
          .content blockquote {
            border-left: 3px solid #f97316;
            padding-left: 16px;
            color: #78716c;
            margin: 16px 0;
          }
          .content ul, .content ol { padding-left: 24px; margin-bottom: 1.2em; }
          .content li { margin-bottom: 4px; }
          .content table { border-collapse: collapse; width: 100%; margin: 16px 0; }
          .content th, .content td { border: 1px solid #e7e5e4; padding: 8px 12px; text-align: left; }
          .content th { background: #f5f5f4; font-weight: 600; }

          footer {
            margin-top: 48px;
            padding-top: 24px;
            border-top: 1px solid #e7e5e4;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
            font-family: ${MONO};
          }
          footer a { font-size: 13px; color: #f97316; text-decoration: none; }
          footer span { font-size: 12px; color: #a8a29e; }
        `}</style>
      </head>
      <body>
        {post.cover_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="cover" src={post.cover_image} alt={post.title} />
        )}

        <article>
          {post.tags.length > 0 && (
            <div className="tags">
              {post.tags.map((t) => (
                <a key={t} href={`/tags/${t}`}>#{t}</a>
              ))}
            </div>
          )}

          <h1>{post.title}</h1>

          <address>
            <time dateTime={post.created_at}>{date}</time>
            <span>{readMin} мин чтения</span>
            <a href={`/posts/${slug}`} style={{ color: "#a8a29e" }}>impelix blog</a>
          </address>

          <hr />

          <div
            className="content"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          <footer>
            <a href="/">← Все статьи</a>
            <span>impelix.dev/r/{slug}</span>
          </footer>
        </article>
      </body>
    </html>
  );
}
