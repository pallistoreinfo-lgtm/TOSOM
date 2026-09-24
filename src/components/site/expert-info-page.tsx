import Link from "next/link";
import {
  Activity,
  Apple,
  ArrowRight,
  Beaker,
  Microscope,
  Scale,
  ShieldCheck,
  Stethoscope,
  TestTubes,
  type LucideIcon,
} from "lucide-react";
import type { PageFrontmatter } from "@/lib/schemas";
import { Prose } from "./mdx";

type ExpertProfile = {
  eyebrow: string;
  icon: LucideIcon;
  accent: string;
  soft: string;
  focus: string[];
  note: string;
};

const profiles: Record<string, ExpertProfile> = {
  "digestive-illness": {
    eyebrow: "Digestive health",
    icon: Stethoscope,
    accent: "from-emerald-700 to-teal-500",
    soft: "bg-emerald-50 text-emerald-800",
    focus: ["Symptoms and patterns", "Appropriate testing", "Food, stress, sleep, and habits"],
    note: "Digestive symptoms can have several causes. My goal is to build a focused evaluation—not to force every patient into the same protocol.",
  },
  "autoimmune-disease": {
    eyebrow: "Immune health",
    icon: ShieldCheck,
    accent: "from-sky-800 to-cyan-500",
    soft: "bg-sky-50 text-sky-900",
    focus: ["Diagnosis and current care", "Digestive and nutrition factors", "Sustainable supportive habits"],
    note: "Nutrition and lifestyle may support wellbeing, but they do not replace disease-specific medical treatment or guarantee remission.",
  },
  "metabolic-disorder": {
    eyebrow: "Metabolic health",
    icon: Activity,
    accent: "from-amber-600 to-orange-500",
    soft: "bg-amber-50 text-amber-900",
    focus: ["Blood pressure and labs", "Energy, appetite, and sleep", "Practical cardiometabolic habits"],
    note: "Metabolic syndrome is identified from measurable risk factors. Progress should be tracked with objective follow-up—not promises or guesswork.",
  },
  "sibo-specialist": {
    eyebrow: "Small-intestinal health",
    icon: Microscope,
    accent: "from-violet-700 to-fuchsia-500",
    soft: "bg-violet-50 text-violet-900",
    focus: ["Symptom pattern", "Breath testing when appropriate", "Contributors and recurrence risk"],
    note: "Bloating alone does not prove SIBO. A careful history and appropriate testing help separate it from other digestive conditions.",
  },
  "weight-loss": {
    eyebrow: "Sustainable weight care",
    icon: Scale,
    accent: "from-rose-700 to-orange-500",
    soft: "bg-rose-50 text-rose-900",
    focus: ["Metabolic and medical context", "Nutrition you can sustain", "Strength, sleep, and recovery"],
    note: "Weight is influenced by biology, medications, sleep, stress, access, and environment. Good care is individualized and free of shame.",
  },
  "comprehensive-stool-analysis-test": {
    eyebrow: "Digestive testing",
    icon: TestTubes,
    accent: "from-teal-700 to-emerald-500",
    soft: "bg-teal-50 text-teal-900",
    focus: ["When testing may help", "What markers can show", "How results fit the full picture"],
    note: "A stool panel is one source of information. It should not be interpreted in isolation or treated as proof of every symptom’s cause.",
  },
  "comprehensive-stool-analysis-test-2": {
    eyebrow: "Food-reaction evaluation",
    icon: Apple,
    accent: "from-red-700 to-amber-500",
    soft: "bg-red-50 text-red-900",
    focus: ["Allergy versus intolerance", "Evidence-based testing", "Safe elimination and reintroduction"],
    note: "Food-specific IgG panels are not recommended by major allergy organizations for diagnosing food allergy or intolerance.",
  },
  "micronutrient-test": {
    eyebrow: "Nutrient assessment",
    icon: Beaker,
    accent: "from-indigo-800 to-blue-500",
    soft: "bg-indigo-50 text-indigo-900",
    focus: ["Symptoms and dietary history", "Validated targeted labs", "Food-first correction and follow-up"],
    note: "More testing is not always better. I choose nutrient tests only when the result is likely to change a patient’s care.",
  },
};

export function ExpertInfoPage({ frontmatter, body, slug }: { frontmatter: PageFrontmatter; body: string; slug: string }) {
  const profile = profiles[slug];
  if (!profile) return <Prose source={body} />;
  const Icon = profile.icon;

  return (
    <main className="overflow-hidden bg-[#f7faf9]">
      <section className="relative border-b border-emerald-100 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(16,185,129,0.13),transparent_28%),radial-gradient(circle_at_18%_100%,rgba(14,116,144,0.08),transparent_34%)]" />
        <div className="container relative grid items-center gap-10 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#07835e]">Expert Info · {profile.eyebrow}</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.08] text-[#082a55] sm:text-5xl lg:text-6xl">{frontmatter.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{frontmatter.excerpt}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/consultation-with-dr-krystosik/" className="inline-flex items-center gap-2 rounded-full bg-[#07835e] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#066b4e]">Discuss your concerns <ArrowRight className="h-4 w-4" /></Link>
              <Link href="#learn" className="inline-flex items-center rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-[#082a55] transition hover:border-[#07835e] hover:text-[#07835e]">Learn what I evaluate</Link>
            </div>
          </div>
          <div className={`relative mx-auto flex aspect-square w-full max-w-[410px] items-center justify-center overflow-hidden rounded-[2.75rem] bg-gradient-to-br ${profile.accent} shadow-[0_28px_70px_rgba(8,42,85,0.18)]`}>
            <div className="absolute -right-14 -top-14 h-52 w-52 rounded-full border-[34px] border-white/10" />
            <div className="absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-white/10" />
            <div className="relative flex h-44 w-44 items-center justify-center rounded-full border border-white/25 bg-white/15 backdrop-blur"><Icon className="h-24 w-24 text-white" strokeWidth={1.35} /></div>
            <div className="absolute bottom-7 left-7 right-7 rounded-2xl bg-white/95 px-5 py-4 text-sm font-semibold leading-6 text-[#082a55] shadow-lg">Clear information. Individual context. Responsible next steps.</div>
          </div>
        </div>
      </section>

      <section id="learn" className="container max-w-5xl py-8 sm:py-12 lg:py-14">
          <div className="flex min-w-0 flex-col">
            <div className="order-2 mt-6 grid gap-4 sm:order-1 sm:mt-0 sm:grid-cols-3">
              {profile.focus.map((item, index) => <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${profile.soft}`}>{index + 1}</span><p className="mt-4 font-semibold leading-6 text-[#0b355d]">{item}</p></div>)}
            </div>
            <article className="order-1 rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:order-2 sm:mt-6 sm:px-10 sm:py-10">
              <Prose source={body} className="[&_h2]:scroll-mt-24 [&_h2]:border-t [&_h2]:border-slate-100 [&_h2]:pt-9 [&_h2:first-child]:mt-0 [&_h2:first-child]:border-0 [&_h2:first-child]:pt-0 [&_h3]:text-lg [&_li]:pl-1" />
            </article>
            <div className={`order-3 mt-6 rounded-2xl border border-current/10 p-5 text-sm leading-7 ${profile.soft}`}><strong>My clinical perspective:</strong> {profile.note}</div>
            <div className="order-4 mt-8 rounded-3xl bg-[#082a55] px-7 py-8 text-white sm:flex sm:items-center sm:justify-between sm:gap-8 sm:px-9">
              <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">A thoughtful first step</p><h2 className="mt-2 text-2xl font-bold">Let’s review your full health story.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-white/75">A consultation helps determine what deserves attention, what testing may be useful, and what can safely wait.</p></div>
              <Link href="/consultation-with-dr-krystosik/" className="mt-5 inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#082a55] transition hover:bg-emerald-50 sm:mt-0">Book a consultation <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <p className="order-5 mt-6 text-xs leading-5 text-slate-500">This page is educational and does not replace diagnosis or individualized medical care. Seek urgent medical attention for severe, sudden, or rapidly worsening symptoms.</p>
          </div>
      </section>
    </main>
  );
}
