import { z } from "zod";

/**
 * The agent-editable contract. Every MDX file's frontmatter is validated against
 * one of these at build time, so a malformed post fails the build loudly instead
 * of rendering broken. To add a field an agent can set, add it here.
 */

const seo = z
  .object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    canonical: z.string().optional(),
    noindex: z.boolean().optional(),
  })
  .optional();

const imageRef = z
  .object({
    src: z.string(),
    alt: z.string().default(""),
    width: z.number().optional(),
    height: z.number().optional(),
  })
  .optional();

export const blogSchema = z.object({
  type: z.literal("blog").default("blog"),
  title: z.string(),
  slug: z.string(),
  date: z.string(), // ISO
  updated: z.string().optional(),
  excerpt: z.string().default(""),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  heroImage: imageRef,
  author: z.string().default("Dr. James Krystosik"),
  seo,
  draft: z.boolean().default(false),
});

export const podcastSchema = z.object({
  type: z.literal("podcast").default("podcast"),
  title: z.string(),
  slug: z.string(),
  date: z.string(),
  excerpt: z.string().default(""),
  audioUrl: z.string().default(""), // Libsyn enclosure URL — never self-hosted; "" if missing
  duration: z.string().optional(),
  episodeImage: imageRef,
  seo,
});

// Generic marketing/landing pages, plus the condition + lab-test variants which
// share the page shape but route under their own collections for clarity.
export const pageSchema = z.object({
  type: z.enum(["page", "condition", "labtest"]).default("page"),
  title: z.string(),
  slug: z.string(),
  date: z.string().optional(),
  excerpt: z.string().default(""),
  heroImage: imageRef,
  seo,
  draft: z.boolean().default(false),
});

export type BlogFrontmatter = z.infer<typeof blogSchema>;
export type PodcastFrontmatter = z.infer<typeof podcastSchema>;
export type PageFrontmatter = z.infer<typeof pageSchema>;

export const schemaByCollection = {
  blog: blogSchema,
  podcast: podcastSchema,
  conditions: pageSchema,
  labtests: pageSchema,
  pages: pageSchema,
} as const;

export type Collection = keyof typeof schemaByCollection;
