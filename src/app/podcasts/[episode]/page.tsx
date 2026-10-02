import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock3, Headphones } from "lucide-react";
import { getPodcastEpisodes } from "@/lib/content";
import { getLibsynFeed } from "@/lib/libsyn-feed";
import { buildMetadata } from "@/lib/seo";
import { Prose } from "@/components/site/mdx";
import { JsonLd, breadcrumbSchema } from "@/components/site/json-ld";
import { site } from "@/config/site";
import { findPublishedEntry } from "@/lib/runtime-content";
import type { ContentEntry } from "@/lib/content";
import type { PodcastFrontmatter } from "@/lib/schemas";

export const dynamic = "force-dynamic";

type ResolvedEpisode = {
  entry: ContentEntry<PodcastFrontmatter>;
  remoteDescription?: string;
};

async function resolveEpisode(slug: string): Promise<ResolvedEpisode | undefined> {
  const published = await findPublishedEntry(slug);
  if (published?.collection === "podcast") {
    return { entry: published.entry as unknown as ContentEntry<PodcastFrontmatter> };
  }

  const feed = await getLibsynFeed();
  const remote = feed?.episodes.find((entry) => entry.slug === slug);
  if (remote) {
    return {
      entry: {
        slug: remote.slug,
        body: "",
        frontmatter: {
          type: "podcast",
          title: remote.title,
          slug: remote.slug,
          date: remote.date,
          excerpt: remote.description,
          audioUrl: remote.audioUrl,
          duration: remote.duration,
          episodeImage: remote.image ? { src: remote.image, alt: `Artwork for ${remote.title}` } : undefined,
        },
      },
      remoteDescription: remote.description,
    };
  }

  const local = getPodcastEpisodes().find((entry) => entry.slug === slug);
  return local ? { entry: local } : undefined;
}

export function generateStaticParams() {
  return getPodcastEpisodes().map((ep) => ({ episode: ep.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ episode: string }> }): Promise<Metadata> {
  const { episode } = await params;
  const resolved = await resolveEpisode(episode);
  if (!resolved) return {};
  const ep = resolved.entry;
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
  const resolved = await resolveEpisode(episode);
  if (!resolved) notFound();
  const { entry: ep, remoteDescription } = resolved;

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
      <article className="bg-[#f6faf9] pb-16">
        <div className="bg-[linear-gradient(135deg,#062f4f,#087a63)] py-12 text-white sm:py-16">
          <div className="container max-w-6xl">
            <Link href="/podcasts/" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-100 hover:text-white"><ArrowLeft className="h-4 w-4" /> All episodes</Link>
            <div className="mt-8 grid items-center gap-9 lg:grid-cols-[.8fr_1.2fr]">
              <div className="relative aspect-square overflow-hidden rounded-3xl bg-white/10 shadow-2xl">
                {fm.episodeImage?.src ? (
                  <Image src={fm.episodeImage.src} alt={fm.episodeImage.alt || `Artwork for ${fm.title}`} fill priority className="object-cover" sizes="(max-width: 1024px) 90vw, 440px" />
                ) : (
                  <div className="flex h-full items-center justify-center"><Headphones className="h-24 w-24 text-emerald-100" /></div>
                )}
              </div>
              <div>
                <div className="flex flex-wrap gap-4 text-sm font-bold text-emerald-100">
                  <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(fm.date))}</span>
                  {fm.duration && <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" /> {fm.duration}</span>}
                </div>
                <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl">{fm.title}</h1>
                {fm.audioUrl ? (
                  <audio controls preload="metadata" className="mt-8 w-full" src={fm.audioUrl}>Your browser does not support audio playback.</audio>
                ) : (
                  <p className="mt-6 text-sm text-emerald-100">Audio for this episode is unavailable.</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="container max-w-3xl pt-10">
          {remoteDescription && <p className="text-lg leading-8 text-slate-700">{remoteDescription}</p>}
          {ep.body.trim() && <Prose source={ep.body} />}
        </div>
      </article>
    </>
  );
}
