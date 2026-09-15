import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPages, getBlogPosts } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { Prose } from "@/components/site/mdx";
import { ConsultationCTA } from "@/components/site/sections";
import { DoctorBio } from "@/components/site/doctor-bio";
import { ConsultationPage } from "@/components/site/consultation-page";
import { JsonLd, breadcrumbSchema, personSchema, articleSchema } from "@/components/site/json-ld";
import { site } from "@/config/site";

// Blog posts and WP pages share the flat `/slug/` namespace, so one route
// resolves both. Blog slugs win if there's ever a collision.
function resolve(slug: string) {
  const post = getBlogPosts().find((p) => p.slug === slug);
  if (post) return { kind: "post" as const, entry: post };
  const page = getAllPages().find((p) => p.slug === slug);
  if (page) return { kind: "page" as const, entry: page };
  return null;
}

export function generateStaticParams() {
  const slugs = new Set<string>();
  getBlogPosts().forEach((p) => slugs.add(p.slug));
  getAllPages().forEach((p) => slugs.add(p.slug));
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = resolve(slug);
  if (!found) return {};
  const fm = found.entry.frontmatter;
  return buildMetadata({
    title: fm.title,
    description: fm.excerpt,
    slug: found.entry.slug,
    image: fm.heroImage?.src,
    seo: fm.seo,
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = resolve(slug);
  if (!found) notFound();

  const { entry } = found;
  const fm = entry.frontmatter;
  const url = `${site.url}/${entry.slug}/`;

  if (found.kind === "post") {
    const post = entry as typeof found.entry & { frontmatter: { date: string; updated?: string; category?: string } };
    return (
      <>
        <JsonLd
          data={articleSchema({
            title: fm.title,
            description: fm.excerpt,
            url,
            datePublished: post.frontmatter.date,
            dateModified: post.frontmatter.updated,
            image: fm.heroImage?.src,
          })}
        />
        <JsonLd
          data={breadcrumbSchema([
            { name: "Home", url: `${site.url}/` },
            { name: "Articles", url: `${site.url}/articles/` },
            { name: fm.title, url },
          ])}
        />
        <article className="container max-w-3xl py-12">
          {post.frontmatter.category && (
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              {post.frontmatter.category}
            </p>
          )}
          <h1 className="mt-1 text-4xl font-bold leading-tight text-secondary">{fm.title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">By {site.doctor.name}</p>
          <Prose source={entry.body} className="mt-8" />
          <DoctorBio />
        </article>
      </>
    );
  }

  if (entry.slug === "consultation-with-dr-krystosik") {
    return (
      <>
        <JsonLd data={personSchema} />
        <JsonLd
          data={breadcrumbSchema([
            { name: "Home", url: `${site.url}/` },
            { name: fm.title, url },
          ])}
        />
        <ConsultationPage />
      </>
    );
  }

  // Page / condition / lab test
  const showCta = fm.type === "condition" || fm.type === "labtest";
  return (
    <>
      <JsonLd data={personSchema} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: `${site.url}/` },
          { name: fm.title, url },
        ])}
      />
      <article className="container max-w-3xl py-12">
        <h1 className="text-4xl font-bold text-secondary">{fm.title}</h1>
        <Prose source={entry.body} className="mt-6" />
      </article>
      {showCta && <ConsultationCTA />}
    </>
  );
}
