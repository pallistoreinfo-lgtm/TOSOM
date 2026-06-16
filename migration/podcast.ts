/**
 * Extract podcast episodes from the WP `podcast` post type (Seriously Simple
 * Podcasting) into MDX. The RSS feed only exposes ~10 recent items; the REST
 * endpoint carries the full archive (73). Audio stays on Libsyn (audio_file URL
 * in frontmatter); we never download mp3s.
 *
 *   npm run extract:podcast
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT, fetchAll, htmlToMarkdown, toOriginalImageUrl, writeMdx, decodeEntities } from "./lib";

type WpPodcast = {
  slug: string;
  date: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  meta?: {
    audio_file?: string;
    duration?: string;
    cover_image?: string;
  };
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url?: string; alt_text?: string }>;
  };
};

async function run() {
  const episodes = await fetchAll<WpPodcast>("podcast");
  console.log(`Fetched ${episodes.length} podcast episodes from REST`);

  const imageManifest = new Set<string>();
  let written = 0;
  let missingAudio = 0;

  for (const ep of episodes) {
    const title = decodeEntities(ep.title.rendered);
    const audioUrl = ep.meta?.audio_file;
    if (!audioUrl) {
      console.warn(`  ! no audio_file for "${title}" (${ep.slug}) — writing without audio`);
      missingAudio++;
    }

    const { markdown, images } = htmlToMarkdown(ep.content.rendered || "");
    images.forEach((im) => imageManifest.add(im));

    // Episode art: featured media, else cover_image meta.
    let episodeImage;
    const cover = ep._embedded?.["wp:featuredmedia"]?.[0]?.source_url || ep.meta?.cover_image;
    if (cover && /wp-content\/uploads/i.test(cover)) {
      const original = toOriginalImageUrl(cover);
      imageManifest.add(original);
      const m = original.match(/wp-content\/uploads\/(.+)$/i);
      if (m) episodeImage = { src: `/assets/images/${toOriginalImageUrl(m[1])}`, alt: title };
    }

    writeMdx("podcast", ep.slug, {
      type: "podcast",
      title,
      slug: ep.slug,
      date: ep.date,
      excerpt: decodeEntities(ep.excerpt.rendered.replace(/<[^>]+>/g, "").trim()).slice(0, 200),
      audioUrl: audioUrl ?? "",
      duration: ep.meta?.duration || undefined,
      episodeImage,
    }, markdown);
    written++;
  }

  // Merge into the shared image manifest.
  const cacheDir = path.join(ROOT, "migration", ".cache");
  fs.mkdirSync(cacheDir, { recursive: true });
  const manifestPath = path.join(cacheDir, "image-manifest.json");
  const existing: string[] = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
    : [];
  const merged = [...new Set([...existing, ...imageManifest])];
  fs.writeFileSync(manifestPath, JSON.stringify(merged, null, 2));

  console.log(`Wrote ${written} podcast episodes (${missingAudio} without audio). Manifest now ${merged.length} images.`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
