import { NextResponse } from "next/server";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypePrism from "rehype-prism-plus";
import rehypeStringify from "rehype-stringify";
import { api } from "@/lib/api";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://impelix.dev";
const MONO = "ui-monospace,'Cascadia Code','Source Code Pro',Menlo,Consolas,monospace";

async function mdToHtml(md: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypePrism, { ignoreMissing: true })
    .use(rehypeStringify)
    .process(md);
  let html = String(result);
  // Telegram IV: unwrap <img> from <p>
  html = html.replace(/<p>(<img[^>]*\/>)<\/p>/g, "$1");
  // Add data-language attribute for the language badge
  html = html.replace(/<pre><code class="language-(\w+)"/g,
    (_, lang) => `<pre data-language="${lang}"><code class="language-${lang}"`);
  return html;
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = await api.getPost(slug).catch(() => null);
  if (!post) return new NextResponse("Not Found", { status: 404 });

  const contentHtml = await mdToHtml(post.body);
  const readMin = Math.max(1, Math.ceil(post.body.split(/\s+/).length / 200));
  const desc = esc(post.excerpt || post.body.replace(/[#*`\[\]_~>]/g, "").slice(0, 200));
  const title = esc(post.title);
  const date = new Date(post.created_at).toLocaleDateString("ru-RU", {
    day: "numeric", month: "long", year: "numeric",
  });
  const canonicalUrl = `${SITE}/r/${slug}`;
  const coverImg = post.cover_image
    ? `<img class="cover" src="${esc(post.cover_image)}" alt="${title}" />`
    : "";
  const ogImage = post.cover_image
    ? `<meta property="og:image" content="${esc(post.cover_image)}" />
       <meta name="twitter:image" content="${esc(post.cover_image)}" />
       <meta name="twitter:card" content="summary_large_image" />`
    : `<meta name="twitter:card" content="summary" />`;
  const tags = post.tags
    .map((t) => `<a href="/tags/${esc(t)}">#${esc(t)}</a>`)
    .join("");

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="${desc}" />
  <link rel="canonical" href="${canonicalUrl}" />

  <meta property="og:type" content="article" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:site_name" content="impelix blog" />
  <meta property="article:published_time" content="${post.created_at}" />
  <meta property="article:modified_time" content="${post.updated_at}" />
  ${ogImage}
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />

  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body{background:#fff;font-family:${MONO}}
    img.cover{width:100%;max-height:480px;object-fit:cover;display:block}
    article{max-width:660px;margin:0 auto;padding:40px 24px 80px}
    .tags{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
    .tags a{font-size:11px;color:#f97316;background:#fff7ed;border:1px solid #fed7aa;border-radius:20px;padding:2px 10px;text-decoration:none}
    h1{font-size:32px;font-weight:700;color:#1c1917;line-height:1.25;margin-bottom:20px;letter-spacing:-.5px;font-family:${MONO}}
    address{font-style:normal;font-size:12px;color:#a8a29e;margin-bottom:24px;display:flex;gap:16px;flex-wrap:wrap}
    address a{color:#a8a29e;text-decoration:none}
    hr{border:none;border-top:1px solid #e7e5e4;margin-bottom:32px}
    .content{font-size:17px;line-height:1.85;color:#1c1917;font-family:${MONO}}
    .content p{margin-bottom:1.2em}
    .content h1,.content h2,.content h3,.content h4{font-family:${MONO};border-bottom:1px solid #e7e5e4;padding-bottom:6px;margin:1.6em 0 .8em;line-height:1.3}
    .content h2{font-size:22px}.content h3{font-size:18px}
    .content img{max-width:100%;border-radius:6px;margin:16px 0;display:block}
    .content a{color:#f97316}
    .content code{background:#f5f5f4;color:#c2410c;border-radius:3px;padding:2px 6px;font-size:15px;font-family:${MONO}}
    .content pre{background:#1c1917;border-radius:8px;padding:20px;margin:20px 0;overflow-x:auto;position:relative}
    .content pre code{background:transparent;color:#e7e5e4;font-size:14px;padding:0;border-radius:0}
    /* language badge */
    .content pre[class*="language-"]::before{content:attr(data-language);position:absolute;top:10px;right:14px;font-size:10px;color:#57534e;text-transform:uppercase;letter-spacing:.08em;font-family:${MONO}}
    /* Prism tokens — dark theme */
    .token.comment,.token.prolog,.token.doctype,.token.cdata{color:#6b7280;font-style:italic}
    .token.punctuation{color:#9ca3af}
    .token.namespace{opacity:.7}
    .token.property,.token.tag,.token.boolean,.token.number,.token.constant,.token.symbol,.token.deleted{color:#f87171}
    .token.selector,.token.attr-name,.token.string,.token.char,.token.builtin,.token.inserted{color:#86efac}
    .token.operator,.token.entity,.token.url,.language-css .token.string,.style .token.string{color:#fcd34d}
    .token.atrule,.token.attr-value,.token.keyword{color:#93c5fd}
    .token.function,.token.class-name{color:#fb923c}
    .token.regex,.token.important,.token.variable{color:#fde68a}
    .token.important,.token.bold{font-weight:700}
    .token.italic{font-style:italic}
    .token.entity{cursor:help}
    /* line numbers */
    .code-line{display:block;padding-left:0}
    .line-number::before{display:inline-block;width:1.5rem;margin-right:1rem;text-align:right;color:#4b5563;content:attr(line);font-size:13px}
    .content blockquote{border-left:3px solid #f97316;padding-left:16px;color:#78716c;margin:16px 0}
    .content ul,.content ol{padding-left:24px;margin-bottom:1.2em}
    .content li{margin-bottom:4px}
    .content table{border-collapse:collapse;width:100%;margin:16px 0}
    .content th,.content td{border:1px solid #e7e5e4;padding:8px 12px;text-align:left}
    .content th{background:#f5f5f4;font-weight:600}
    footer{margin-top:48px;padding-top:24px;border-top:1px solid #e7e5e4;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-family:${MONO}}
    footer a{font-size:13px;color:#f97316;text-decoration:none}
    footer span{font-size:12px;color:#a8a29e}
  </style>
</head>
<body>
  ${coverImg}
  <article>
    ${tags ? `<div class="tags">${tags}</div>` : ""}
    <h1>${title}</h1>
    <address>
      <time datetime="${post.created_at}">${date}</time>
      <span>${readMin} мин чтения</span>
      <a href="/posts/${slug}">impelix blog</a>
    </address>
    <hr />
    <div class="content">${contentHtml}</div>

    <footer>
      <a href="/">← Все статьи</a>
      <span>impelix.dev/r/${slug}</span>
    </footer>
  </article>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
