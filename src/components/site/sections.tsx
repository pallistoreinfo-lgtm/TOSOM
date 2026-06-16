import Link from "next/link";
import Image from "next/image";
import { ClipboardCheck, Salad, HeartPulse, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { site } from "@/config/site";

/** Full-bleed hero. Background image + overlay headline, matching the live site. */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-secondary text-white">
      <div className="container relative z-10 flex min-h-[480px] flex-col justify-center py-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/80">Evidence-Based · Online</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
          Functional Medicine for Gut Health &amp; Root-Cause Healing
        </h1>
        <p className="mt-5 max-w-xl text-lg text-white/90">
          {site.doctor.name} targets and eliminates the root cause of chronic illness — starting with the
          gut, the body&apos;s command center for health.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/consultation-with-dr-krystosik/">Book an Online Consultation</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
            <Link href="/faq/">Take the Gut Quiz</Link>
          </Button>
        </div>
      </div>
      {/* Decorative gradient stands in for the beach hero image (faithful spirit). */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand via-secondary to-navy opacity-90" />
    </section>
  );
}

const STEPS = [
  {
    icon: ClipboardCheck,
    label: "Step 1",
    title: "Evaluate",
    body: "Advanced diagnostic lab testing across 50+ biomarkers. We test — we don't guess.",
  },
  {
    icon: Salad,
    label: "Step 2",
    title: "Modify Diet & Lifestyle",
    body: "A personalized, anti-inflammatory MediterAsian diet and lifestyle plan built from your results.",
  },
  {
    icon: HeartPulse,
    label: "Step 3",
    title: "Support",
    body: "Targeted herbs, whole-food supplements, and stress management to rebuild gut health.",
  },
];

export function StepsHowItWorks() {
  return (
    <section className="bg-surface py-16">
      <div className="container">
        <SectionHeading
          eyebrow="How It Works"
          title="A proven three-step path to healing"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <Card key={s.title} className="border-none bg-white shadow-md">
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <s.icon className="h-6 w-6" />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-primary">{s.label}</p>
                <h3 className="mt-1 text-xl font-semibold text-secondary">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export type CaseStudy = {
  name: string;
  image?: string;
  symptoms: string;
  results: string;
};

export function CaseStudies({ studies }: { studies: CaseStudy[] }) {
  return (
    <section className="py-16">
      <div className="container">
        <SectionHeading eyebrow="Patient Case Studies" title="Real results, root-cause healing" />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {studies.map((c) => (
            <Card key={c.name} className="overflow-hidden">
              {c.image && (
                <div className="relative aspect-[4/3] w-full bg-surface">
                  <Image src={c.image} alt={c.name} fill className="object-cover" sizes="(max-width:1024px) 100vw, 33vw" />
                </div>
              )}
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-secondary">{c.name}</h3>
                <p className="mt-3 text-sm">
                  <span className="font-semibold text-foreground">Symptoms: </span>
                  <span className="text-muted-foreground">{c.symptoms}</span>
                </p>
                <p className="mt-2 text-sm">
                  <span className="font-semibold text-foreground">Results: </span>
                  <span className="text-muted-foreground">{c.results}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="link">
            <Link href="/videos/">
              See full testimonies <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

const CONDITIONS = [
  { label: "Digestive Illness", href: "/digestive-illness/" },
  { label: "Autoimmune Disease", href: "/autoimmune-disease/" },
  { label: "Weight Loss", href: "/weight-loss/" },
  { label: "Metabolic Disorder", href: "/metabolic-disorder/" },
];

export function ConditionGrid() {
  return (
    <section className="bg-surface py-16">
      <div className="container">
        <SectionHeading eyebrow="Expert In" title="Conditions we treat at the root" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CONDITIONS.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="group flex items-center justify-between rounded-lg border bg-white p-5 shadow-sm transition hover:border-primary hover:shadow-md"
            >
              <span className="font-medium text-secondary">{c.label}</span>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ConsultationCTA() {
  return (
    <section className="bg-secondary py-16 text-white">
      <div className="container flex flex-col items-center text-center">
        <h2 className="max-w-2xl text-3xl font-bold">
          Start with a $79 Discovery Consultation
        </h2>
        <p className="mt-4 max-w-xl text-white/90">
          Meet with {site.doctor.name} to review your history and map a root-cause plan. If it&apos;s a fit,
          we move to a comprehensive consultation.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/consultation-with-dr-krystosik/">Book Now</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
            <a href={site.contact.phoneHref}>Call {site.contact.phone}</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div className="text-center">
      {eyebrow && <p className="text-sm font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>}
      <h2 className="mt-2 text-3xl font-bold text-secondary">{title}</h2>
    </div>
  );
}
