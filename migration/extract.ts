/**
 * Extract all WordPress posts and pages from the live REST API and write them as
 * clean MDX with validated frontmatter. Body images are collected into a manifest
 * that media.ts downloads. Re-runnable: overwrites existing MDX.
 *
 *   npm run extract
 */
import fs from "node:fs";
import path from "node:path";
import {
  SITE,
  ROOT,
  fetchAll,
  fetchSeoHead,
  htmlToMarkdown,
  toOriginalImageUrl,
  writeMdx,
  decodeEntities,
} from "./lib";

type WpRendered = { rendered: string };
type WpPost = {
  id: number;
  slug: string;
  date: string;
  modified: string;
  link: string;
  title: WpRendered;
  content: WpRendered;
  excerpt: WpRendered;
  categories?: number[];
  tags?: number[];
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url?: string;
      alt_text?: string;
      media_details?: { width?: number; height?: number; sizes?: { full?: { source_url?: string } } };
    }>;
    "wp:term"?: Array<Array<{ taxonomy: string; name: string; slug: string }>>;
  };
};

// Pages that are really condition / lab-test landing pages route under their own
// collections (same shape, clearer organization for editors).
const CONDITION_SLUGS = new Set([
  "digestive-illness",
  "autoimmune-disease",
  "metabolic-disorder",
  "sibo-specialist",
  "weight-loss",
]);
const LABTEST_SLUGS = new Set([
  "comprehensive-stool-analysis-test",
  "comprehensive-stool-analysis-test-2",
  "micronutrient-test",
]);

function featured(post: WpPost) {
  const fm = post._embedded?.["wp:featuredmedia"]?.[0];
  if (!fm) return undefined;
  const src = fm.media_details?.sizes?.full?.source_url ?? fm.source_url;
  if (!src) return undefined;
  const original = toOriginalImageUrl(src);
  const m = original.match(/wp-content\/uploads\/(.+)$/i);
  return {
    original,
    ref: m ? { src: `/assets/images/${toOriginalImageUrl(m[1])}`, alt: fm.alt_text ?? "", width: fm.media_details?.width, height: fm.media_details?.height } : undefined,
  };
}

function primaryCategory(post: WpPost): string | undefined {
  const terms = post._embedded?.["wp:term"]?.flat() ?? [];
  const cat = terms.find((t) => t.taxonomy === "category" && t.slug !== "uncategorized");
  return cat?.name;
}

function tagNames(post: WpPost): string[] {
  const terms = post._embedded?.["wp:term"]?.flat() ?? [];
  return terms.filter((t) => t.taxonomy === "post_tag").map((t) => t.name);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function run() {
  const imageManifest = new Set<string>();
  const seoReport: Array<{ slug: string; metaTitle?: string; metaDescription?: string; weak: boolean }> = [];

  // ---- Posts ----
  const posts = await fetchAll<WpPost>("posts");
  console.log(`Fetched ${posts.length} posts`);
  for (const post of posts) {
    const { markdown, images } = htmlToMarkdown(post.content.rendered);
    images.forEach((i) => imageManifest.add(i));
    const fImg = featured(post);
    if (fImg) imageManifest.add(fImg.original);

    const seo = await fetchSeoHead(post.link);
    await sleep(250); // be polite to the live host between page fetches
    const excerpt = decodeEntities(post.excerpt.rendered.replace(/<[^>]+>/g, "").trim());
    const metaDesc = seo.metaDescription;
    const weak = !metaDesc || metaDesc.length < 80 || metaDesc.toLowerCase() === decodeEntities(post.title.rendered).toLowerCase();
    seoReport.push({ slug: post.slug, metaTitle: seo.metaTitle, metaDescription: metaDesc, weak });

    writeMdx("blog", post.slug, {
      type: "blog",
      title: decodeEntities(post.title.rendered),
      slug: post.slug,
      date: post.date,
      updated: post.modified,
      excerpt,
      category: primaryCategory(post),
      tags: tagNames(post),
      heroImage: fImg?.ref,
      author: "Dr. James Krystosik",
      seo: { metaTitle: seo.metaTitle, metaDescription: metaDesc, canonical: seo.canonical },
    }, markdown);
  }

  // ---- Pages ----
  const pages = await fetchAll<WpPost>("pages");
  console.log(`Fetched ${pages.length} pages`);
  for (const page of pages) {
    const { markdown, images } = htmlToMarkdown(page.content.rendered);
    images.forEach((i) => imageManifest.add(i));
    const fImg = featured(page);
    if (fImg) imageManifest.add(fImg.original);

    const seo = await fetchSeoHead(page.link);
    await sleep(250);
    const collection = CONDITION_SLUGS.has(page.slug) ? "conditions" : LABTEST_SLUGS.has(page.slug) ? "labtests" : "pages";
    const type = collection === "conditions" ? "condition" : collection === "labtests" ? "labtest" : "page";
    const weak = !seo.metaDescription || seo.metaDescription.length < 80;
    seoReport.push({ slug: page.slug, metaTitle: seo.metaTitle, metaDescription: seo.metaDescription, weak });

    writeMdx(collection, page.slug, {
      type,
      title: decodeEntities(page.title.rendered),
      slug: page.slug,
      date: page.date,
      excerpt: decodeEntities(page.excerpt.rendered.replace(/<[^>]+>/g, "").trim()),
      heroImage: fImg?.ref,
      seo: { metaTitle: seo.metaTitle, metaDescription: seo.metaDescription, canonical: seo.canonical },
    }, markdown);
  }

  // ---- Manifests ----
  fs.mkdirSync(path.join(ROOT, "migration", ".cache"), { recursive: true });
  fs.writeFileSync(
    path.join(ROOT, "migration", ".cache", "image-manifest.json"),
    JSON.stringify([...imageManifest], null, 2),
  );
  fs.writeFileSync(
    path.join(ROOT, "migration", ".cache", "seo-report.json"),
    JSON.stringify(seoReport, null, 2),
  );

  const weakCount = seoReport.filter((s) => s.weak).length;
  console.log(`\nWrote ${posts.length} posts + ${pages.length} pages.`);
  console.log(`Image manifest: ${imageManifest.size} unique originals.`);
  console.log(`SEO: ${weakCount} pages have weak/missing meta descriptions (flagged in seo-report.json for rewrite).`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
