import type { MetadataRoute } from "next";
import { getAllPages, getBlogPosts, getPodcastEpisodes } from "@/lib/content";
import { site } from "@/config/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = ["", "articles", "podcasts"].map((r) => ({
    url: `${site.url}/${r ? r + "/" : ""}`,
    lastModified: now,
  }));

  const pages = getAllPages().map((p) => ({ url: `${site.url}/${p.slug}/`, lastModified: now }));
  const posts = getBlogPosts().map((p) => ({
    url: `${site.url}/${p.slug}/`,
    lastModified: new Date(p.frontmatter.updated ?? p.frontmatter.date),
  }));
  const episodes = getPodcastEpisodes().map((e) => ({
    url: `${site.url}/podcasts/${e.slug}/`,
    lastModified: new Date(e.frontmatter.date),
  }));

  return [...staticRoutes, ...pages, ...posts, ...episodes];
}
