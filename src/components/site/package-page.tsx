import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Dna,
  FlaskConical,
  GraduationCap,
  HeartPulse,
  Leaf,
  Microscope,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UsersRound,
  X,
} from "lucide-react";

type PackageSlug = "jump-start-plan" | "root-cause-solution";

type OfferItem = {
  title: string;
  value: string;
  description: string;
  icon: typeof BookOpen;
};

const jumpStartItems: OfferItem[] = [
  { title: "Gut Restoration Roadmap", value: "$99", description: "A practical step-by-step system for understanding symptoms, supporting your microbiome, and building healthier habits.", icon: Activity },
  { title: "Stool Transit Time Course", value: "$139", description: "Learn a simple at-home way to measure digestive speed and understand what it may reveal about bowel function.", icon: Clock3 },
  { title: "30-Day Gut Health Meal Plan", value: "$129", description: "Plan balanced meals, make smarter grocery choices, and support steady energy and long-term gut health.", icon: Leaf },
  { title: "Gut Video Series", value: "$99", description: "Clear, practical video education that helps you apply the roadmap in daily life.", icon: PlayCircle },
  { title: "Carbs From Heaven, Carbs From Hell", value: "$39", description: "Understand how different carbohydrates affect cravings, blood sugar, inflammation, energy, and the gut.", icon: BookOpen },
  { title: "The 7 Causes of Illness", value: "$119", description: "Explore commonly overlooked contributors to fatigue, weight gain, digestive problems, and chronic symptoms.", icon: GraduationCap },
  { title: "Change Your Mind, Transform Your Body", value: "$199", description: "Build a healthier mindset, replace limiting beliefs, and create routines that support lasting change.", icon: Sparkles },
  { title: "GUT RESTORATION COMMUNITY", value: "$177/year", description: "Receive one year of education, encouragement, resources, and community support.", icon: UsersRound },
  { title: "Private Consultation", value: "$129", description: "A focused 20-minute consultation with Dr. Krystosik to identify a clear starting direction.", icon: Stethoscope },
];

const rootCauseItems: OfferItem[] = [
  { title: "Goodbye Illness, Hello Wellness", value: "$399", description: "Use nutrition, lifestyle, and mindset strategies to support the body and create sustainable wellness habits.", icon: HeartPulse },
  { title: "Supernatural Morning Course", value: "$199", description: "Create a purposeful morning routine that supports calm, movement, nourishment, energy, and resilience.", icon: Sparkles },
  { title: "Seven Extended Consultations", value: "$3,500", description: "Seven sessions of one hour or more with Dr. Krystosik, scheduled at two sessions per month.", icon: Stethoscope },
  { title: "GI-MAP Stool Test", value: "$875", description: "A DNA-based stool test that evaluates microbes and biological markers connected with digestion, immunity, and gut function.", icon: Dna },
  { title: "Hidden Food Allergy Blood Test", value: "$575", description: "A comprehensive test that helps identify delayed immune reactions to foods that may contribute to recurring symptoms.", icon: FlaskConical },
];

const packages = {
  "jump-start-plan": {
    option: "Option 01",
    name: "Jump Start Plan",
    price: "$99",
    value: "$1,129",
    eyebrow: "A comfortable place to begin",
    headline: "Feel Better in 7 Days With a Proven System",
    description: "A gentle, practical starting point for anyone who prefers gradual change or has sensitive digestion. Follow a clear pace that fits comfortably into everyday life.",
    checkout: "https://restoration-roadmap.gut-911-rx.com/special/order?product=pz4F6J",
    checkoutLabel: "Start My Jump Start Plan",
    accent: "emerald",
    fit: ["You want a clear, affordable place to start", "You prefer gradual changes and practical guidance", "You want courses, community, and a private consultation", "You are ready to stop guessing and build healthier daily habits"],
  },
  "root-cause-solution": {
    option: "Option 02",
    name: "Root Cause Solution",
    price: "$3,999",
    value: "$6,548",
    eyebrow: "Personalized · Proven · Physician-supported",
    headline: "Advanced Testing and Personal Guidance",
    description: "A comprehensive option for people ready to go all in with advanced testing, seven extended physician consultations, complete course access, and focused support.",
    checkout: "https://restoration-roadmap.gut-911-rx.com/special/order?product=pzrw5a",
    checkoutLabel: "Choose Root Cause Solution",
    accent: "blue",
    fit: ["You want a personalized, test-informed strategy", "You need deeper insight into the gut microbiome and food reactions", "You value ongoing access to Dr. Krystosik", "You are ready for the complete restoration system and maximum support"],
  },
} as const;

const comparisonRows = [
  ["Gut Restoration Roadmap", true, true],
  ["Core courses and educational resources", true, true],
  ["One-year GUT RESTORATION COMMUNITY membership", true, true],
  ["30-Day Gut Health Meal Plan and video series", true, true],
  ["Goodbye Illness, Hello Wellness", false, true],
  ["Supernatural Morning Course", false, true],
  ["GI-MAP Stool Test", false, true],
  ["Hidden Food Allergy Blood Test", false, true],
  ["Consultations with Dr. Krystosik", "20 minutes", "Seven 1+ hour sessions"],
] as const;

function OfferCard({ item, premium = false }: { item: OfferItem; premium?: boolean }) {
  const Icon = item.icon;
  return (
    <article className={`group rounded-3xl border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${premium ? "border-sky-200 bg-white shadow-[0_15px_45px_rgba(8,47,82,.08)]" : "border-emerald-100 bg-white shadow-[0_15px_45px_rgba(5,98,76,.07)]"}`}>
      <div className="flex items-start justify-between gap-4">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${premium ? "bg-sky-100 text-sky-800" : "bg-emerald-100 text-emerald-800"}`}><Icon className="h-6 w-6" /></span>
        <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${premium ? "bg-sky-50 text-sky-800" : "bg-emerald-50 text-emerald-800"}`}>BONUS GIFT {item.value}</span>
      </div>
      <h3 className="mt-5 text-xl font-extrabold leading-tight text-[#083b59]">{item.title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
    </article>
  );
}

function MethodCard({ icon: Icon, title, text }: { icon: typeof Leaf; title: string; text: string }) {
  return <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur"><Icon className="h-7 w-7 text-emerald-200" /><h3 className="mt-4 text-xl font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-white/75">{text}</p></div>;
}

function PlanMark({ value }: { value: boolean | string }) {
  if (typeof value === "string") return <span className="text-sm font-bold text-[#083b59]">{value}</span>;
  return value ? <Check className="mx-auto h-5 w-5 text-emerald-600" /> : <X className="mx-auto h-5 w-5 text-slate-300" />;
}

export function PackagePage({ slug }: { slug: PackageSlug }) {
  const offer = packages[slug];
  const premium = slug === "root-cause-solution";
  return (
    <article className="overflow-hidden bg-[#f7fbfa]">
      <section className={`relative overflow-hidden text-white ${premium ? "bg-[linear-gradient(135deg,#082f52_0%,#075985_55%,#08765f_100%)]" : "bg-[linear-gradient(135deg,#073a4f_0%,#075f55_55%,#07946b_100%)]"}`}>
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-36 -left-24 h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="container relative grid max-w-7xl gap-10 py-12 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:py-20">
          <div>
            <div className="flex flex-wrap items-center gap-3"><span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[.18em]">{offer.option}</span><span className="text-sm font-bold text-emerald-100">{offer.eyebrow}</span></div>
            <h1 className="mt-6 text-4xl font-black leading-[1.04] sm:text-6xl">{offer.name}</h1>
            <h2 className="mt-5 max-w-2xl text-2xl font-bold leading-tight text-emerald-100 sm:text-3xl">{offer.headline}</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">{offer.description}</p>
            <div className="mt-8 flex flex-wrap items-end gap-x-6 gap-y-4">
              <div><p className="text-xs font-bold uppercase tracking-widest text-white/60">Get complete access for</p><p className="mt-1 text-6xl font-black tracking-tight">{offer.price}</p></div>
              <div className="mb-1 rounded-2xl border border-white/20 bg-white/10 px-4 py-3"><p className="text-xs font-bold uppercase tracking-wider text-white/60">Bonus gifts included</p><p className="mt-0.5 text-2xl font-extrabold text-emerald-100">Up to {offer.value}</p></div>
            </div>
            <a href={offer.checkout} className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#f4c952] px-7 py-4 text-base font-extrabold text-[#082f52] shadow-[0_15px_35px_rgba(0,0,0,.2)] transition hover:-translate-y-0.5 hover:bg-[#ffda68]">{offer.checkoutLabel}<ArrowRight className="h-5 w-5" /></a>
            <p className="mt-4 flex items-center gap-2 text-xs text-white/65"><ShieldCheck className="h-4 w-4" /> Secure checkout · Immediate access to digital resources</p>
          </div>
          <div className="relative">
            <div className="absolute -inset-5 rounded-[2.2rem] bg-white/10 blur-xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-2 shadow-2xl"><div className="relative aspect-[16/9] overflow-hidden rounded-[1.55rem]"><Image src="/assets/home/gut-restoration-roadmap.webp" alt="Dr. Krystosik's Gut Restoration Roadmap" fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" /></div></div>
            <div className="relative -mt-5 mx-auto grid w-[92%] grid-cols-3 overflow-hidden rounded-2xl bg-white text-center text-[#083b59] shadow-xl"><div className="p-4"><p className="text-xl font-black">25,000+</p><p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Patients helped</p></div><div className="border-x border-slate-100 p-4"><p className="text-xl font-black">40+</p><p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Years in practice</p></div><div className="p-4"><p className="text-xl font-black">1</p><p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Clear roadmap</p></div></div>
          </div>
        </div>
      </section>

      <section className="container max-w-6xl py-14 sm:py-20">
        <div className="grid gap-8 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-[0_20px_60px_rgba(8,47,82,.07)] md:grid-cols-[.85fr_1.15fr] md:p-10">
          <div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-emerald-700">Is this right for you?</p><h2 className="mt-3 text-3xl font-black leading-tight text-[#082f52]">Choose the support level that matches your goal</h2><p className="mt-4 leading-7 text-slate-600">The Gut Restoration Roadmap removes confusion and gives you an organized place to begin. This option is especially useful if:</p></div>
          <div className="grid gap-3 sm:grid-cols-2">{offer.fit.map((item) => <div key={item} className="flex gap-3 rounded-2xl bg-[#f2faf7] p-4"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" /><p className="text-sm font-semibold leading-6 text-[#20465f]">{item}</p></div>)}</div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white py-14 sm:py-20">
        <div className="container max-w-7xl">
          <div className="mx-auto max-w-3xl text-center"><p className="text-xs font-extrabold uppercase tracking-[.2em] text-emerald-700">Everything you receive</p><h2 className="mt-3 text-3xl font-black text-[#082f52] sm:text-4xl">{premium ? "The complete Jump Start foundation" : "Nine resources in one simple plan"}</h2><p className="mt-4 text-lg leading-8 text-slate-600">{premium ? "Root Cause Solution includes the core Jump Start collection below. Its seven extended consultations replace the 20-minute Jump Start consultation, with advanced testing and additional courses added." : "Courses, practical tools, community support, and personal guidance—organized to help you move forward with confidence."}</p></div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{jumpStartItems.filter((item) => !premium || item.title !== "Private Consultation").map((item) => <OfferCard key={item.title} item={item} premium={premium} />)}</div>
        </div>
      </section>

      {premium && <section className="bg-[linear-gradient(180deg,#eaf7fb_0%,#f7fbfa_100%)] py-14 sm:py-20"><div className="container max-w-7xl"><div className="mx-auto max-w-3xl text-center"><span className="inline-flex rounded-full bg-[#075985] px-4 py-2 text-xs font-extrabold uppercase tracking-[.18em] text-white">Root Cause Exclusives</span><h2 className="mt-4 text-3xl font-black text-[#082f52] sm:text-4xl">Testing and guidance that remove the guesswork</h2><p className="mt-4 text-lg leading-8 text-slate-600">Go deeper with advanced gut and food-response testing, two additional courses, and seven extended consultations with Dr. Krystosik.</p></div><div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{rootCauseItems.map((item) => <OfferCard key={item.title} item={item} premium />)}</div></div></section>}

      <section className="bg-[#073c52] py-14 text-white sm:py-20">
        <div className="container max-w-6xl"><div className="text-center"><p className="text-xs font-extrabold uppercase tracking-[.2em] text-emerald-200">Dr. Krystosik’s method</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">A practical philosophy built over 40 years</h2></div><div className="mt-10 grid gap-5 md:grid-cols-3"><MethodCard icon={Leaf} title="Common Sense" text="Support the body with the right fuel, habits, and mind-body practices so its natural healing systems can work." /><MethodCard icon={Microscope} title="Science" text="Recommendations are informed by clinical experience and peer-reviewed health research—not guesswork." /><MethodCard icon={Activity} title="Cooperation With Nature" text="Stop working against your body. Build daily choices that cooperate with its design and support long-term wellbeing." /></div></div>
      </section>

      <section className="container max-w-6xl py-14 sm:py-20">
        <div className="text-center"><p className="text-xs font-extrabold uppercase tracking-[.2em] text-emerald-700">Compare your options</p><h2 className="mt-3 text-3xl font-black text-[#082f52] sm:text-4xl">One system. Two levels of support.</h2></div>
        <div className="mt-10 overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-[0_18px_55px_rgba(8,47,82,.07)]">
          <div className="min-w-[680px]"><div className="grid grid-cols-[1.5fr_.75fr_.75fr] bg-[#082f52] text-white"><div className="p-4 font-extrabold sm:p-5">What’s included</div><div className="border-l border-white/15 p-4 text-center sm:p-5"><p className="font-extrabold">Jump Start</p><p className="text-emerald-200">$99</p></div><div className="border-l border-white/15 p-4 text-center sm:p-5"><p className="font-extrabold">Root Cause</p><p className="text-emerald-200">$3,999</p></div></div>
          {comparisonRows.map(([label, jump, root], index) => <div key={label} className={`grid grid-cols-[1.5fr_.75fr_.75fr] items-center ${index % 2 ? "bg-slate-50" : "bg-white"}`}><div className="p-4 text-sm font-semibold text-[#20465f] sm:p-5">{label}</div><div className="border-l border-slate-100 p-4 text-center sm:p-5"><PlanMark value={jump} /></div><div className="border-l border-slate-100 p-4 text-center sm:p-5"><PlanMark value={root} /></div></div>)}</div>
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm"><Link href="/jump-start-plan/" className={`rounded-full px-5 py-3 font-bold ${!premium ? "bg-emerald-700 text-white" : "border border-emerald-700 text-emerald-800"}`}>View Jump Start Plan</Link><Link href="/root-cause-solution/" className={`rounded-full px-5 py-3 font-bold ${premium ? "bg-[#075985] text-white" : "border border-[#075985] text-[#075985]"}`}>View Root Cause Solution</Link></div>
      </section>

      <section className="container max-w-6xl pb-16 sm:pb-20">
        <div className={`overflow-hidden rounded-[2.2rem] p-7 text-white shadow-2xl sm:p-11 ${premium ? "bg-[linear-gradient(135deg,#082f52,#075985)]" : "bg-[linear-gradient(135deg,#075f55,#07946b)]"}`}><div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-center"><div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-emerald-200">Your comeback can start here</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">Stop planning your life around digestive discomfort.</h2><p className="mt-4 max-w-3xl leading-7 text-white/75">You deserve more than another temporary fix. Get a clear roadmap, practical education, and the support level that fits the way you want to begin.</p></div><div className="md:text-right"><p className="text-sm font-bold text-white/60">Complete access</p><p className="text-5xl font-black">{offer.price}</p><a href={offer.checkout} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#f4c952] px-6 py-4 font-extrabold text-[#082f52]">{offer.checkoutLabel}<ArrowRight className="h-5 w-5" /></a></div></div></div>
        <p className="mx-auto mt-6 max-w-4xl text-center text-xs leading-5 text-slate-500"><strong>Medical disclaimer:</strong> This program is for educational purposes only and is not intended to diagnose, treat, cure, or prevent any medical condition. Consult a qualified healthcare provider before changing your diet, supplements, exercise routine, medications, or lifestyle. Individual results may vary.</p>
      </section>
    </article>
  );
}
