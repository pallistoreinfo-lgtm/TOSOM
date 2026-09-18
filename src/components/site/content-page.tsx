import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { PageFrontmatter } from "@/lib/schemas";
import { Prose } from "./mdx";

const courseValues: Record<string, { value?: string; note: string }> = {
  "dr-krystosiks-90-days-gut-health-program": { value: "$399 regular value", note: "The step-by-step foundation included in the Gut Restoration packages" },
  "gut-community": { value: "$177 yearly value", note: "Community support is included in the Jump Start Plan" },
  "carbs-from-heaven-carbs-from-hell": { value: "$39", note: "Included in both Gut Restoration Roadmap packages" },
  "the-7-causes-of-illness": { value: "$119", note: "Included in both Gut Restoration Roadmap packages" },
  "stool-transit-time-course": { value: "$139", note: "Included in both Gut Restoration Roadmap packages" },
  "supernatural-morning": { value: "$199", note: "Included with the Root Cause Solution" },
  "blue-zone-diet-course": { note: "Practical longevity nutrition for lasting gut health" },
  "7-day-poop-challenge": { note: "A practical seven-day digestive health reset" },
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function cleanExcerpt(excerpt: string, title: string) {
  const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return excerpt
    .replace(/\s+/g, " ")
    .replace(new RegExp(`^${escapedTitle}\\s*[:—–-]?\\s*`, "i"), "")
    .trim()
    .slice(0, 260);
}

function prepareBody(source: string, title: string) {
  const imageMatch = source.match(/!\[([^\]]*)\]\(([^)]+)\)/);
  let body = imageMatch ? source.replace(imageMatch[0], "") : source;
  const lines = body.split("\n");
  const first = lines.findIndex((line) => line.trim());
  if (first >= 0) {
    const candidate = normalize(lines[first].replace(/^#+\s*/, ""));
    const expected = normalize(title);
    if (candidate === expected || candidate.includes(expected) || expected.includes(candidate)) lines.splice(first, 1);
  }
  return { body: body = lines.join("\n").trim(), image: imageMatch ? { alt: imageMatch[1] || title, src: imageMatch[2] } : null };
}

export function ContentPage({ frontmatter, body, slug, isCourse = false }: { frontmatter: PageFrontmatter; body: string; slug: string; isCourse?: boolean }) {
  const prepared = prepareBody(body, frontmatter.title);
  const hero = frontmatter.heroImage || prepared.image;
  const value = courseValues[slug];
  return (
    <article className="bg-gradient-to-b from-[#edf9f7] via-white to-white pb-16">
      <header className="border-b border-emerald-100 bg-[radial-gradient(circle_at_top_right,_#d8f5eb,_transparent_42%)]">
        <div className="container max-w-5xl py-10 text-center sm:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">{isCourse ? "Learn · Apply · Transform" : "Root-cause health guidance"}</p>
          <h1 className="mx-auto mt-3 max-w-4xl text-4xl font-extrabold leading-tight text-[#082f52] sm:text-5xl">{frontmatter.title}</h1>
          {frontmatter.excerpt && <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">{cleanExcerpt(frontmatter.excerpt, frontmatter.title)}</p>}
        </div>
      </header>
      <div className="container max-w-5xl pt-8 sm:pt-10">
        {hero && <div className="relative mx-auto mb-8 aspect-[16/9] w-full overflow-hidden rounded-3xl bg-slate-100 shadow-[0_20px_60px_rgba(8,47,82,.12)]"><Image src={hero.src} alt={hero.alt || frontmatter.title} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 1024px" /></div>}
        {isCourse && value && <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row sm:items-center"><div className="flex gap-3"><CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700" /><div><p className="font-bold text-[#083b59]">{value.value ? `Course value: ${value.value}` : "Practical course value"}</p><p className="text-sm text-slate-600">{value.note}</p></div></div><Link href="/jump-start-plan/" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white">View packages <ArrowRight className="h-4 w-4" /></Link></div>}
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_14px_45px_rgba(8,47,82,.06)] sm:p-10"><Prose source={prepared.body} /></div>
      </div>
    </article>
  );
}
