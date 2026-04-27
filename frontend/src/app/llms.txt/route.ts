import { NextResponse } from "next/server";
import { api } from "@/lib/api";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://impelix.dev";

export const revalidate = 3600;

export async function GET() {
  const posts = await api.listPosts(undefined, 1000, 0).catch(() => []);

  const lines = [
    "# impelix blog",
    "> То, что не поместилось в канал знатока, но написать надо",
    "",
    "Personal technical blog by impelix. Articles about programming, tools, and guides.",
    `Site: ${SITE}`,
    "",
    "## Articles",
    "",
    ...posts.map((p) =>
      `- [${p.title}](${SITE}/posts/${p.slug})${p.excerpt ? ": " + p.excerpt : ""}`
    ),
    "",
    "## Navigation",
    "",
    `- [All posts](${SITE})`,
    `- [About](${SITE}/about)`,
    `- [Sitemap](${SITE}/sitemap.xml)`,
  ];

  return new NextResponse(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
