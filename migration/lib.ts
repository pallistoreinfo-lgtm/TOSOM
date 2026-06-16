/**
 * Shared migration helpers: WP REST fetch, HTML cleaning, HTML->Markdown,
 * media URL collection, and frontmatter emission. Used by extract.ts,
 * podcast.ts, and media.ts. NOT part of the Next build.
 */
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import matter from "gray-matter";

export const SITE = "https://theothersideofmedicine.com";
// tsx runs these as CJS where import.meta.dirname is undefined; derive from cwd
// (migration scripts are always run from the repo root via npm scripts).
export const ROOT = process.cwd();
export const CONTENT_DIR = path.join(ROOT, "content");
export const IMAGES_DIR = path.join(ROOT, "src", "assets", "images");

// ---- polite fetch (retry on 429/5xx with backoff) ---------------------------

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function politeFetch(url: string, attempt = 0): Promise<Response> {
  const res = await fetch(url, { headers: { "User-Agent": "tosm-migration/1.0" } });
  if ((res.status === 429 || res.status >= 500) && attempt < 5) {
    const wait = Math.min(2000 * 2 ** attempt, 20000);
    await sleep(wait);
    return politeFetch(url, attempt + 1);
  }
  return res;
}

// ---- WP REST ----------------------------------------------------------------

export async function fetchJson<T>(url: string): Promise<{ data: T; total: number; totalPages: number }> {
  const res = await politeFetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  const total = Number(res.headers.get("x-wp-total") ?? 0);
  const totalPages = Number(res.headers.get("x-wp-totalpages") ?? 1);
  return { data: (await res.json()) as T, total, totalPages };
}

/** Page through a WP REST collection (posts/pages) with _embed. */
export async function fetchAll<T>(endpoint: string): Promise<T[]> {
  const first = await fetchJson<T[]>(`${SITE}/wp-json/wp/v2/${endpoint}?per_page=100&page=1&_embed`);
  let all = [...first.data];
  for (let page = 2; page <= first.totalPages; page++) {
    const next = await fetchJson<T[]>(`${SITE}/wp-json/wp/v2/${endpoint}?per_page=100&page=${page}&_embed`);
    all = all.concat(next.data);
  }
  return all;
}

// ---- SEO meta from the rendered page <head> --------------------------------
// Rank Math doesn't expose its head over REST here, so read the live page.
export async function fetchSeoHead(
  url: string,
): Promise<{ metaTitle?: string; metaDescription?: string; canonical?: string }> {
  try {
    const res = await politeFetch(url);
    if (!res.ok) return {};
    const html = await res.text();
    const $ = cheerio.load(html);
    return {
      metaTitle: $("title").first().text().trim() || undefined,
      metaDescription: $('meta[name="description"]').attr("content")?.trim() || undefined,
      canonical: $('link[rel="canonical"]').attr("href")?.trim() || undefined,
    };
  } catch {
    return {};
  }
}

// ---- Image URL helpers ------------------------------------------------------

/** Strip WordPress' `-WxH` size suffix to get the original upload URL. */
export function toOriginalImageUrl(url: string): string {
  return url.replace(/-\d+x\d+(\.(?:jpe?g|png|gif|webp|avif))$/i, "$1");
}

/** Map a WP uploads URL to its committed local path under src/assets/images. */
export function localImagePath(url: string): { abs: string; importPath: string } | null {
  const m = url.match(/wp-content\/uploads\/(.+)$/i);
  if (!m) return null;
  const rel = toOriginalImageUrl(m[1]);
  return {
    abs: path.join(IMAGES_DIR, rel),
    importPath: `@/assets/images/${rel}`,
  };
}

// ---- HTML cleaning + Markdown conversion ------------------------------------

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});
turndown.use(gfm);

// Convert known embeds to MDX component tags instead of raw iframes.
turndown.addRule("embeds", {
  filter: (node) => node.nodeName === "IFRAME",
  replacement: (_content, node) => {
    const src = (node as HTMLElement).getAttribute("src") ?? "";
    if (/calendly\.com/i.test(src)) return `\n<CalendlyEmbed />\n`;
    if (/jotform\.com/i.test(src)) return `\n<GutQuiz />\n`;
    const yt = src.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([\w-]+)/i);
    if (yt) return `\n<YouTube id="${yt[1]}" />\n`;
    return `\n<iframe src="${src}" />\n`;
  },
});

/**
 * Clean Elementor/Gutenberg rendered HTML, rewrite image srcs to local imports,
 * and return Markdown plus the set of original image URLs that were referenced.
 */
export function htmlToMarkdown(html: string): { markdown: string; images: Set<string> } {
  const $ = cheerio.load(html, undefined, false);
  const images = new Set<string>();

  // Strip script/style and noise attributes.
  $("script, style, link, noscript").remove();
  $("[style]").removeAttr("style");
  $("*").each((_, el) => {
    if (el.type !== "tag") return;
    for (const attr of Object.keys(el.attribs)) {
      if (/^(data-|aria-|role$)/i.test(attr) && attr !== "data-src") delete el.attribs[attr];
      if (/^(class|id)$/i.test(attr)) delete el.attribs[attr];
    }
  });

  // Rewrite images to their original URL; collect for download.
  $("img").each((_, el) => {
    const $el = $(el);
    let src = $el.attr("src") || $el.attr("data-src") || "";
    if (!src) return;
    if (src.startsWith("/")) src = SITE + src;
    const original = toOriginalImageUrl(src);
    if (/wp-content\/uploads/i.test(original)) {
      images.add(original);
      const local = localImagePath(original);
      if (local) $el.attr("src", "/" + path.relative(ROOT, local.abs).replace(/^src\/assets\//, "assets/"));
    }
    $el.removeAttr("srcset").removeAttr("sizes").removeAttr("loading").removeAttr("decoding");
  });

  // Drop empty wrapper divs/spans (Elementor leaves many).
  $("div, span, section").each((_, el) => {
    const $el = $(el);
    if ($el.children().length === 0 && $el.text().trim() === "") $el.remove();
  });

  const cleaned = $.html();
  const markdown = turndown
    .turndown(cleaned)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { markdown, images };
}

// ---- Frontmatter emission ---------------------------------------------------

export function writeMdx(
  collection: string,
  slug: string,
  frontmatter: Record<string, unknown>,
  body: string,
): string {
  const dir = path.join(CONTENT_DIR, collection);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${slug}.mdx`);
  // gray-matter stringify drops undefined; clean it.
  const fm = JSON.parse(JSON.stringify(frontmatter));
  fs.writeFileSync(file, matter.stringify("\n" + body + "\n", fm));
  return file;
}

export function decodeEntities(s: string): string {
  return cheerio.load(`<x>${s}</x>`)("x").text();
}
