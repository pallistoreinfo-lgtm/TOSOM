import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPodcastEpisodes } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { Prose } from "@/components/site/mdx";
import { JsonLd, breadcrumbSchema } from "@/components/site/json-ld";
import { site } from "@/config/site";
import { findPublishedEntry } from "@/lib/runtime-content";
import type { ContentEntry } from "@/lib/content";
import type { PodcastFrontmatter } from "@/lib/schemas";

export const dynamic = "force-dynamic";

async function resolveEpisode(slug: string) {
  const published = await findPublishedEntry(slug);
  if (published?.collection === "podcast") return published.entry as unknown as ContentEntry<PodcastFrontmatter>;
  return getPodcastEpisodes().find((entry) => entry.slug === slug);
}

export function generateStaticParams() {
  return getPodcastEpisodes().map((ep) => ({ episode: ep.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ episode: string }> }): Promise<Metadata> {
  const { episode } = await params;
  const ep = await resolveEpisode(episode);
  if (!ep) return {};
  return buildMetadata({
    title: ep.frontmatter.title,
    description: ep.frontmatter.excerpt,
    slug: `podcasts/${ep.slug}`,
    image: ep.frontmatter.episodeImage?.src,
    seo: ep.frontmatter.seo,
  });
}

export default async function EpisodePage({ params }: { params: Promise<{ episode: string }> }) {
  const { episode } = await params;
  const ep = await resolveEpisode(episode);
  if (!ep) notFound();

  const fm = ep.frontmatter;
  const url = `${site.url}/podcasts/${ep.slug}/`;

  const audioObject = fm.audioUrl
    ? {
        "@context": "https://schema.org",
        "@type": "PodcastEpisode",
        name: fm.title,
        datePublished: fm.date,
        associatedMedia: { "@type": "MediaObject", contentUrl: fm.audioUrl },
        partOfSeries: { "@type": "PodcastSeries", name: site.name },
      }
    : null;

  return (
    <>
      {audioObject && <JsonLd data={audioObject} />}
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: `${site.url}/` },
          { name: "Podcast", url: `${site.url}/podcasts/` },
          { name: fm.title, url },
        ])}
      />
      <article className="container max-w-3xl py-12">
        <h1 className="text-4xl font-bold leading-tight text-secondary">{fm.title}</h1>
        {fm.audioUrl ? (
          <audio controls preload="none" className="mt-6 w-full" src={fm.audioUrl}>
            Your browser does not support audio playback.
          </audio>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">Audio for this episode is unavailable.</p>
        )}
        {ep.body.trim() && <Prose source={ep.body} className="mt-8" />}
      </article>
    </>
  );
}
