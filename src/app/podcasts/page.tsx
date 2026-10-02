import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Clock3, Headphones, Mic2, Play, Radio, Rss } from "lucide-react";
import { getPodcastEpisodes } from "@/lib/content";
import { site } from "@/config/site";
import { applyPublishedCollection } from "@/lib/runtime-content";
import { getLibsynFeed } from "@/lib/libsyn-feed";

export const dynamic = "force-dynamic";

function formatEpisodeDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export const metadata: Metadata = {
  title: "Podcast",
  description:
    "The Other Side of Medicine podcast with Dr. James Krystosik — conversations on gut health, functional medicine, and root-cause healing.",
  alternates: { canonical: "https://theothersideofmedicine.com/podcasts/" },
};

type PodcastCardEpisode = {
  audioUrl: string;
  date: string;
  duration?: string;
  episodeNumber?: string;
  excerpt: string;
  external: boolean;
  href: string;
  image?: string;
  slug: string;
  title: string;
};

export default async function PodcastsPage() {
  const localEntries = (await applyPublishedCollection("podcast", getPodcastEpisodes()))
    .sort((a, b) => Date.parse(b.frontmatter.date) - Date.parse(a.frontmatter.date));
  const libsynFeed = await getLibsynFeed();
  const libsynEpisodes: PodcastCardEpisode[] = (libsynFeed?.episodes ?? []).map((episode) => ({
    audioUrl: episode.audioUrl,
    date: episode.date,
    duration: episode.duration,
    episodeNumber: episode.episodeNumber,
    excerpt: episode.description,
    external: true,
    href: episode.link,
    image: episode.image,
    slug: episode.slug,
    title: episode.title,
  }));
  const localEpisodes: PodcastCardEpisode[] = localEntries.map((entry, index) => ({
    audioUrl: entry.frontmatter.audioUrl,
    date: entry.frontmatter.date,
    duration: entry.frontmatter.duration,
    episodeNumber: String(localEntries.length - index),
    excerpt: entry.frontmatter.excerpt,
    external: false,
    href: `/podcasts/${entry.slug}/`,
    image: entry.frontmatter.episodeImage?.src,
    slug: entry.slug,
    title: entry.frontmatter.title,
  }));
  const episodes = libsynEpisodes.length ? libsynEpisodes : localEpisodes;
  const [latestEpisode, ...archive] = episodes;
  const platforms = [
    { label: "Podcast RSS", href: site.integrations.podcastRssUrl, icon: Rss },
    { label: "YouTube", href: site.social.youtube, icon: Play },
    { label: "Facebook", href: site.social.facebook, icon: Radio },
  ];

  return (
    <div className="overflow-hidden bg-[#f7fbfa]">
      <section className="relative border-b border-emerald-100 bg-[radial-gradient(circle_at_82%_22%,rgba(54,179,126,.22),transparent_28%),linear-gradient(135deg,#062f4f_0%,#064f57_58%,#087a63_100%)] text-white">
        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full border-[55px] border-white/5" />
        <div className="home-container relative grid min-h-[620px] items-center gap-12 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-100 backdrop-blur">
              <Mic2 className="h-4 w-4" /> The Other Side of Medicine Podcast
            </div>
            <h1 className="mt-7 text-5xl font-black leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Go beyond symptoms. <span className="text-[#8ee5be]">Find the why.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-100 sm:text-xl">
              Join {site.doctor.name} for plainspoken conversations about gut health, nutrition, chronic illness, and the root-cause questions that often get missed.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#episodes" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-[#073d55] shadow-lg transition hover:-translate-y-0.5">
                Browse episodes <ArrowRight className="h-4 w-4" />
              </a>
              <a href={site.integrations.podcastRssUrl} target="_blank" rel="noopener" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/30 px-6 text-sm font-bold text-white transition hover:bg-white/10">
                <Rss className="h-4 w-4" /> Subscribe via RSS
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[500px] lg:justify-self-end">
            <div className="absolute -inset-5 rotate-3 rounded-[2.5rem] border border-white/20 bg-white/10" />
            <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-white/20 bg-[#dff4ec] shadow-2xl">
              <Image
                src={libsynFeed?.image || "/assets/images/2025/03/podcast_thumb_new-20231110-ltxhu6bn14.jpg"}
                alt="The Other Side of Medicine podcast with Dr. James Krystosik"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 90vw, 500px"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-[#073d55] shadow-xl sm:-left-10">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Headphones className="h-5 w-5" /></span>
              <span><strong className="block text-xl leading-none">{episodes.length}</strong><span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Episodes</span></span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-emerald-100 bg-white">
        <div className="home-container flex flex-col items-center justify-between gap-6 py-7 md:flex-row">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#0a405b]">Listen and follow</p>
          <div className="flex flex-wrap justify-center gap-3">
            {platforms.map(({ label, href, icon: Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-[#153e59] shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700">
                <Icon className="h-4 w-4" /> {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {latestEpisode && (
        <section className="home-container py-16 sm:py-20">
          <div className="mb-7 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">Start here</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#082f54] sm:text-4xl">Latest episode</h2>
            </div>
            <span className="hidden text-sm font-semibold text-slate-500 sm:block">New perspectives. Practical next steps.</span>
          </div>
          <article className="grid overflow-hidden rounded-[2rem] bg-[#082f54] text-white shadow-[0_25px_70px_rgba(8,47,84,.18)] lg:grid-cols-[.78fr_1.22fr]">
            <div className="relative flex min-h-[330px] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_35%_25%,#2aa879_0%,#087260_35%,#052d4c_78%)] p-10">
              <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.25)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.25)_1px,transparent_1px)] [background-size:36px_36px]" />
              {latestEpisode.image ? (
                <>
                  <Image src={latestEpisode.image} alt={`Artwork for ${latestEpisode.title}`} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 40vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#052d4c]/75 via-transparent to-transparent" />
                  <span className="relative mt-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/40 bg-white/20 shadow-2xl backdrop-blur"><Play className="ml-1 h-8 w-8 fill-white" /></span>
                </>
              ) : (
                <div className="relative text-center">
                  <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-white/30 bg-white/15 shadow-2xl backdrop-blur"><Play className="ml-1 h-10 w-10 fill-white" /></span>
                  <p className="mt-7 text-xs font-black uppercase tracking-[0.28em] text-emerald-100">Episode {latestEpisode.episodeNumber || String(episodes.length).padStart(2, "0")}</p>
                  <p className="mt-2 text-xl font-bold">The Other Side of Medicine</p>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-11 lg:p-14">
              <time dateTime={latestEpisode.date} className="text-xs font-bold uppercase tracking-[0.18em] text-[#8ee5be]">{formatEpisodeDate(latestEpisode.date)}</time>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl">{latestEpisode.title}</h2>
              {latestEpisode.excerpt && <p className="mt-5 line-clamp-3 text-base leading-7 text-slate-200">{latestEpisode.excerpt}</p>}
              {latestEpisode.audioUrl && (
                <audio controls preload="none" className="mt-7 w-full" src={latestEpisode.audioUrl}>Your browser does not support audio playback.</audio>
              )}
              <a href={latestEpisode.href} target={latestEpisode.external ? "_blank" : undefined} rel={latestEpisode.external ? "noopener" : undefined} className="mt-7 inline-flex items-center gap-2 self-start text-sm font-black text-[#8ee5be] hover:text-white">
                {latestEpisode.external ? "View on Libsyn" : "Episode notes"} <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </article>
        </section>
      )}

      <section id="episodes" className="border-y border-emerald-100 bg-white py-16 sm:py-20">
        <div className="home-container">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">The archive</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#082f54] sm:text-4xl">All episodes</h2>
            <p className="mt-4 leading-7 text-slate-600">Explore conversations on digestive health, nutrition, functional medicine, metabolism, and living well.</p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {archive.map((ep, index) => {
              const episodeNumber = ep.episodeNumber || String(Math.max(1, episodes.length - index - 1));
              return (
                <article key={ep.slug} className="group relative flex min-h-[420px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-[#fbfdfc] transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_18px_50px_rgba(8,47,84,.1)]">
                  <div className="relative aspect-[16/9] overflow-hidden bg-[linear-gradient(135deg,#0a405b,#0a8b6d)]">
                    {ep.image && <Image src={ep.image} alt={`Artwork for ${ep.title}`} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" />}
                    <span className="absolute left-4 top-4 inline-flex h-11 min-w-11 items-center justify-center rounded-xl bg-white/95 px-3 text-sm font-black text-emerald-800 shadow-lg">{String(episodeNumber).padStart(2, "0")}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <time dateTime={ep.date} className="text-xs font-bold uppercase tracking-wider text-slate-500">{formatEpisodeDate(ep.date)}</time>
                    <h3 className="mt-3 line-clamp-3 text-xl font-black leading-snug text-[#0a3858] group-hover:text-emerald-700">{ep.title}</h3>
                    {ep.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{ep.excerpt}</p>}
                    <div className="mt-auto flex items-center justify-between gap-4 pt-6">
                    <a href={ep.href} target={ep.external ? "_blank" : undefined} rel={ep.external ? "noopener" : undefined} className="inline-flex items-center gap-2 text-sm font-black text-emerald-700 before:absolute before:inset-0">
                      Listen now <Play className="h-3.5 w-3.5 fill-current" />
                    </a>
                    {ep.duration && <span className="inline-flex items-center gap-1 text-xs text-slate-500"><Clock3 className="h-3.5 w-3.5" /> {ep.duration}</span>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="home-container py-16 sm:py-20">
        <div className="grid items-center gap-10 rounded-[2rem] bg-[#e8f5f0] p-8 sm:p-12 lg:grid-cols-[.72fr_1.28fr] lg:p-16">
          <div className="relative mx-auto aspect-square w-full max-w-[340px] overflow-hidden rounded-[2rem] bg-white shadow-xl">
            <Image src="/assets/images/2025/03/podcast_thumb_new-20231110-ltxhu6bn14.jpg" alt="Dr. James Krystosik, host of The Other Side of Medicine podcast" fill className="object-cover" sizes="340px" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">Meet the host</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#082f54] sm:text-4xl">Dr. James Krystosik</h2>
            <p className="mt-5 text-lg leading-8 text-slate-700">A functional medicine physician, chiropractor, nutritionist, author, and podcast host who has worked with patients since 1986. On the podcast, Dr. J turns complex health questions into conversations you can actually use.</p>
            <p className="mt-4 leading-7 text-slate-600">Expect honest questions, natural-health perspectives, expert guests, and a consistent focus on understanding the person—not just naming a symptom.</p>
            <Link href="/about/" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#087a63] px-6 py-3 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#06664f]">More about Dr. J <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
