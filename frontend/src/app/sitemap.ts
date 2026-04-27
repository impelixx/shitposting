import { MetadataRoute } from "next";
import { api } from "@/lib/api";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://impelix.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await api.listPosts(undefined, 1000, 0).catch(() => []);

  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE}/posts/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    { url: SITE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/about`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    ...postEntries,
  ];
}
