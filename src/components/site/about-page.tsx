import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BookOpen,
  ClipboardList,
  GraduationCap,
  HeartPulse,
  Mic2,
  Search,
  Utensils,
} from "lucide-react";

const credentials = [
  { icon: GraduationCap, value: "D.C.", label: "Doctor of Chiropractic, Life University" },
  { icon: Utensils, value: "Nutrition", label: "Undergraduate education in nutrition" },
  { icon: Activity, value: "Since 1986", label: "Clinical practice in chiropractic and functional medicine" },
  { icon: BookOpen, value: "5 books", label: "Author on nutrition and natural medicine" },
];

const approach = [
  {
    icon: HeartPulse,
    title: "Listen to the whole story",
    text: "Symptoms rarely exist in isolation. Dr. J begins with health history, daily habits, previous care, and the patterns that may connect them.",
  },
  {
    icon: Search,
    title: "Look for useful evidence",
    text: "When appropriate, the evaluation may include existing records and targeted testing instead of relying on assumptions or one-size-fits-all advice.",
  },
  {
    icon: ClipboardList,
    title: "Build a practical plan",
    text: "Recommendations are personalized around food, movement, sleep, stress, and other lifestyle foundations that can be applied in everyday life.",
  },
];

export function AboutPage() {
  return (
    <article className="overflow-hidden bg-white text-[#082f52]">
      <section className="relative bg-[radial-gradient(circle_at_top_right,_#d6f3e7,_transparent_42%),linear-gradient(180deg,#edf9f7_0%,#ffffff_100%)]">
        <div className="container grid max-w-6xl items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.08fr_.92fr] lg:gap-16 lg:py-20">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">Meet Dr. J</p>
            <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-[-0.04em] text-[#082f52] sm:text-5xl lg:text-6xl">
              Dr. James D. Krystosik, D.C.
            </h1>
            <p className="mt-5 text-lg font-bold leading-7 text-emerald-700 sm:text-xl">
              Chiropractor · Functional Medicine Practitioner · Author · Podcast Host
            </p>
            <div className="mt-6 max-w-2xl space-y-4 text-base leading-8 text-slate-600 sm:text-lg">
              <p>
                Dr. James Krystosik directs The Other Side of Medicine and has worked in chiropractic and
                functional medicine since 1986. His work focuses on nutrition, digestive health, and understanding
                the factors that may sit underneath persistent symptoms.
              </p>
              <p>
                His guiding principle is simple: <strong className="text-[#082f52]">don&apos;t guess—test.</strong> The goal is
                to listen carefully, use relevant information, and create practical next steps for each individual.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/consultation-with-dr-krystosik/" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-700 px-7 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-800">
                Online consultation <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/podcasts/" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#0b4a75] bg-white px-7 text-sm font-black text-[#0b4a75] transition hover:bg-sky-50">
                Listen to the podcast <Mic2 className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[440px]">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-emerald-200/70 to-sky-200/50 blur-2xl" />
            <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] border-8 border-white bg-emerald-50 shadow-[0_28px_70px_rgba(8,47,82,.2)]">
              <Image
                src="/assets/images/2025/04/IMG_2084npic-radio-scaled.jpg"
                alt="Dr. James D. Krystosik outdoors"
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1024px) 90vw, 440px"
              />
            </div>
            <div className="absolute -bottom-5 left-1/2 w-[calc(100%-2rem)] -translate-x-1/2 rounded-2xl border border-emerald-100 bg-white/95 px-5 py-4 text-center shadow-xl backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">In clinical practice</p>
              <p className="mt-1 text-2xl font-black text-[#082f52]">Since 1986</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white py-12 sm:py-16">
        <div className="container max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Education &amp; professional work</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#082f52] sm:text-4xl">Experience you can understand at a glance</h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {credentials.map(({ icon: Icon, value, label }) => (
              <div key={value} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><Icon className="h-5 w-5" /></span>
                <p className="mt-5 text-xl font-black text-[#082f52]">{value}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f5faf9] py-14 sm:py-20">
        <div className="container max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">How Dr. J approaches care</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#082f52] sm:text-4xl">A clear process—not a quick assumption</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">The purpose of a root-cause evaluation is to understand the person behind the symptoms and decide what information is genuinely useful.</p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {approach.map(({ icon: Icon, title, text }, index) => (
              <div key={title} className="rounded-3xl border border-emerald-100 bg-white p-7 shadow-[0_14px_40px_rgba(8,47,82,.06)]">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dff4ed] text-emerald-700"><Icon className="h-6 w-6" /></span>
                  <span className="text-4xl font-black text-emerald-100">0{index + 1}</span>
                </div>
                <h3 className="mt-6 text-xl font-black text-[#082f52]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container grid max-w-6xl gap-8 lg:grid-cols-[1.25fr_.75fr]">
          <div className="rounded-3xl bg-[#082f52] p-7 text-white sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Beyond the clinic</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Making health information practical</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/75">
              Dr. J is the author of five books on nutrition and natural medicine and hosts The Other Side of
              Medicine podcast. Across his clinical work, writing, and conversations with guests, he aims to make
              complex health topics easier to understand and use in daily life.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/articles/" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-black text-[#082f52]">Read articles <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/podcasts/" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/35 px-6 text-sm font-black text-white">Explore episodes <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
          <aside className="rounded-3xl border border-amber-200 bg-amber-50 p-7 sm:p-8">
            <h2 className="text-xl font-black text-[#082f52]">A note about care</h2>
            <p className="mt-4 text-sm leading-7 text-slate-700">
              Functional-medicine education does not replace emergency care, diagnosis, or treatment from an
              appropriately licensed healthcare professional. Recommendations should be based on individual needs,
              health history, and appropriate clinical judgment.
            </p>
            <Link href="/contact/" className="mt-6 inline-flex items-center gap-2 text-sm font-black text-emerald-800 hover:underline">Contact the team <ArrowRight className="h-4 w-4" /></Link>
          </aside>
        </div>
      </section>
    </article>
  );
}
