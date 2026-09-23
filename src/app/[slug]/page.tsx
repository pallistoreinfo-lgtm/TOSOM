import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllPages, getBlogPosts } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { Prose } from "@/components/site/mdx";
import { ConsultationCTA } from "@/components/site/sections";
import { DoctorBio } from "@/components/site/doctor-bio";
import { ConsultationPage } from "@/components/site/consultation-page";
import { JsonLd, breadcrumbSchema, personSchema, articleSchema } from "@/components/site/json-ld";
import { site } from "@/config/site";
import { ContentPage } from "@/components/site/content-page";
import { CoursesIndex } from "@/components/site/courses-index";
import { PackagePage } from "@/components/site/package-page";
import { findPublishedEntry } from "@/lib/runtime-content";
import type { BlogFrontmatter, PageFrontmatter } from "@/lib/schemas";
import type { ContentEntry } from "@/lib/content";

export const dynamic = "force-dynamic";

// Blog posts and WP pages share the flat `/slug/` namespace, so one route
// resolves both. Blog slugs win if there's ever a collision.
async function resolve(slug: string) {
  const published = await findPublishedEntry(slug);
  if (published?.collection === "blog") return { kind: "post" as const, entry: published.entry as unknown as ContentEntry<BlogFrontmatter> };
  if (published && published.collection !== "podcast") return { kind: "page" as const, entry: published.entry as unknown as ContentEntry<PageFrontmatter> };
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
  const found = await resolve(slug);
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
  const found = await resolve(slug);
  if (!found) notFound();

  const { entry } = found;
  const fm = entry.frontmatter;
  const url = `${site.url}/${entry.slug}/`;

  if (found.kind === "post") {
    const post = entry as typeof found.entry & { frontmatter: { date: string; updated?: string; category?: string } };
    const relatedPosts = getBlogPosts()
      .filter((candidate) => candidate.slug !== entry.slug && candidate.frontmatter.category === post.frontmatter.category)
      .slice(0, 3);
    const publishedDate = new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date(post.frontmatter.date));
    const updatedDate = post.frontmatter.updated
      ? new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date(post.frontmatter.updated))
      : null;
    return (
      <>
        <JsonLd
          data={articleSchema({
            title: fm.title,
            description: fm.seo?.metaDescription ?? fm.excerpt,
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
          <p className="mt-3 text-sm text-muted-foreground">
            Written by <Link href="/about/" className="font-medium text-primary hover:underline">{site.doctor.name}</Link>
            {` · Published ${publishedDate}`}
            {updatedDate && updatedDate !== publishedDate ? ` · Updated ${updatedDate}` : ""}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{site.doctor.credentials} · In practice since {site.doctor.practicingSince}</p>
          {fm.heroImage && (
            <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-surface shadow-sm">
              <Image
                src={fm.heroImage.src}
                alt={fm.heroImage.alt || fm.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          )}
          <Prose source={entry.body} className="mt-8" />
          <aside className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-slate-700">
            <strong className="text-slate-900">Medical information note:</strong> This article is educational and does not replace a diagnosis or individualized medical care. Symptoms can have more than one cause. Seek urgent care for severe, sudden, or worsening symptoms, and discuss major diet, supplement, medication, or exercise changes with a qualified healthcare professional.
          </aside>
          <DoctorBio />
          {relatedPosts.length > 0 && (
            <section className="mt-12 border-t pt-8" aria-labelledby="related-reading">
              <h2 id="related-reading" className="text-2xl font-bold text-secondary">Related reading</h2>
              <ul className="mt-4 space-y-3">
                {relatedPosts.map((related) => (
                  <li key={related.slug}>
                    <Link href={`/${related.slug}/`} className="font-medium text-primary hover:underline">
                      {related.frontmatter.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
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

  if (entry.slug === "courses") return <CoursesIndex />;
  if (entry.slug === "jump-start-plan" || entry.slug === "root-cause-solution") return <PackagePage slug={entry.slug} />;

  // Page / condition / lab test
  const pageFrontmatter = fm as PageFrontmatter;
  const showCta = pageFrontmatter.type === "condition" || pageFrontmatter.type === "labtest";
  const courseSlugs = new Set(["7-day-poop-challenge", "blue-zone-diet-course", "carbs-from-heaven-carbs-from-hell", "stool-transit-time-course", "supernatural-morning", "the-7-causes-of-illness", "gut-community", "dr-krystosiks-90-days-gut-health-program"]);
  return (
    <>
      <JsonLd data={personSchema} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: `${site.url}/` },
          { name: pageFrontmatter.title, url },
        ])}
      />
      <ContentPage frontmatter={pageFrontmatter} body={entry.body} slug={entry.slug} isCourse={courseSlugs.has(entry.slug)} />
      {showCta && <ConsultationCTA />}
    </>
  );
}
