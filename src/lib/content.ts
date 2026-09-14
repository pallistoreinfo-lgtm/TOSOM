import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  schemaByCollection,
  type Collection,
  type BlogFrontmatter,
  type PodcastFrontmatter,
  type PageFrontmatter,
} from "./schemas";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type ContentEntry<T> = {
  frontmatter: T;
  body: string; // raw MDX body (compiled by the page via next-mdx-remote)
  slug: string;
};

function readCollection<T>(collection: Collection): ContentEntry<T>[] {
  const dir = path.join(CONTENT_DIR, collection);
  if (!fs.existsSync(dir)) return [];
  const schema = schemaByCollection[collection];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data, content } = matter(raw);
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        throw new Error(
          `Invalid frontmatter in content/${collection}/${file}:\n` +
            JSON.stringify(parsed.error.format(), null, 2),
        );
      }
      return {
        frontmatter: parsed.data as T,
        body: content,
        slug: (parsed.data as { slug: string }).slug,
      };
    });
}

export function getBlogPosts(): ContentEntry<BlogFrontmatter>[] {
  return readCollection<BlogFrontmatter>("blog")
    .filter((p) => !p.frontmatter.draft)
    .sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1));
}

export function getPodcastEpisodes(): ContentEntry<PodcastFrontmatter>[] {
  return readCollection<PodcastFrontmatter>("podcast").sort((a, b) => {
    const newestFirst = Date.parse(b.frontmatter.date) - Date.parse(a.frontmatter.date);
    return newestFirst || a.frontmatter.title.localeCompare(b.frontmatter.title);
  });
}

/** Pages, conditions, and lab tests are routed together by flat slug. */
export function getAllPages(): ContentEntry<PageFrontmatter>[] {
  return [
    ...readCollection<PageFrontmatter>("pages"),
    ...readCollection<PageFrontmatter>("conditions"),
    ...readCollection<PageFrontmatter>("labtests"),
  ].filter((p) => !p.frontmatter.draft);
}

export function getBySlug<T extends { slug: string }>(
  entries: ContentEntry<T>[],
  slug: string,
): ContentEntry<T> | undefined {
  return entries.find((e) => e.slug === slug);
}
