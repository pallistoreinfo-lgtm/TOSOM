import type { Metadata } from "next";
import { site } from "@/config/site";

type SeoInput = {
  title: string;
  description?: string;
  slug: string;
  image?: string;
  seo?: { metaTitle?: string; metaDescription?: string; canonical?: string; noindex?: boolean };
};

/**
 * Build Next Metadata from frontmatter. Strips the live site's all-caps brand
 * suffix from captured titles (the audit's finding #2) and falls back sensibly.
 */
export function buildMetadata(input: SeoInput): Metadata {
  const rawTitle = input.seo?.metaTitle ?? input.title;
  const title = rawTitle.replace(/\s*[-|]\s*THE OTHER SIDE OF MEDICINE\s*$/i, "").trim();
  const description = input.seo?.metaDescription ?? input.description ?? site.description;
  const canonical = input.seo?.canonical ?? `${site.url}/${input.slug}/`;
  const image = input.image ? new URL(input.image, site.url).toString() : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    robots: input.seo?.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      images: image ? [{ url: image }] : undefined,
    },
  };
}
