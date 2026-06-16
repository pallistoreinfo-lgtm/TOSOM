import Link from "next/link";
import type { Metadata } from "next";
import { getPodcastEpisodes } from "@/lib/content";
import { Card, CardContent } from "@/components/ui/card";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Podcast",
  description:
    "The Other Side of Medicine podcast with Dr. James Krystosik — conversations on gut health, functional medicine, and root-cause healing.",
  alternates: { canonical: "https://theothersideofmedicine.com/podcasts/" },
};

export default function PodcastsPage() {
  const episodes = getPodcastEpisodes();
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-4xl font-bold text-secondary">Podcast</h1>
      <p className="mt-3 text-muted-foreground">
        {episodes.length} episodes with {site.doctor.name}.{" "}
        <a href={site.integrations.podcastRssUrl} className="text-primary hover:underline" target="_blank" rel="noopener">
          Subscribe via RSS
        </a>
        .
      </p>
      <div className="mt-10 space-y-4">
        {episodes.map((ep) => (
          <Link key={ep.slug} href={`/podcasts/${ep.slug}/`}>
            <Card className="transition hover:shadow-md">
              <CardContent className="flex items-center justify-between gap-4 py-5">
                <div>
                  <h2 className="font-semibold text-secondary">{ep.frontmatter.title}</h2>
                  {ep.frontmatter.excerpt && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{ep.frontmatter.excerpt}</p>
                  )}
                </div>
                {ep.frontmatter.duration && (
                  <span className="shrink-0 text-xs text-muted-foreground">{ep.frontmatter.duration}</span>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
