import {
  ArrowRight,
  Check,
  ClipboardCheck,
  Clock3,
  FlaskConical,
  HeartPulse,
  Mail,
  MessageCircleHeart,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Video,
} from "lucide-react";
import { site } from "@/config/site";

const bookingUrl = site.integrations.calendlyUrl;

const process = [
  {
    icon: MessageCircleHeart,
    title: "Tell us your story",
    text: "Discuss your symptoms, health concerns, goals, and the care you have already tried.",
  },
  {
    icon: FlaskConical,
    title: "Identify what matters",
    text: "Dr. Krystosik reviews your history and recommends only the functional tests he considers essential.",
  },
  {
    icon: ClipboardCheck,
    title: "Leave with direction",
    text: "If the practice is a good fit, you will understand the next step toward a personalized care plan.",
  },
];

const expectations = [
  "Review of your medical records and detailed health questionnaires before the appointment.",
  "A clear report of findings discussed with you during the consultation.",
  "Time to address health concerns that were not covered in your paperwork.",
  "A second opinion and an honest assessment of whether Dr. Krystosik can help.",
  "Focused lab recommendations that may include blood, urine, saliva, stool, or imaging tests.",
  "A personalized, drug-free strategy involving diet, supplements, and lifestyle support when appropriate.",
];

function BookingButton({ label = "Schedule Consultation" }: { label?: string }) {
  return (
    <a
      href={bookingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#07835e] px-6 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(7,131,94,0.22)] transition hover:-translate-y-0.5 hover:bg-[#066f50]"
    >
      {label}<ArrowRight className="h-4 w-4" />
    </a>
  );
}

export function ConsultationPage() {
  return (
    <main className="overflow-hidden bg-white text-[#082a55]">
      <section className="relative bg-gradient-to-br from-[#effaf7] via-white to-[#edf7fc] py-14 lg:py-20">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#7bd5ad]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-[#72bfe4]/20 blur-3xl" />
        <div className="home-container relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-[#dff5ed] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#087557]">
              <Sparkles className="h-4 w-4" /> Personalized functional medicine care
            </p>
            <h1 className="mt-6 max-w-3xl text-[42px] font-extrabold leading-[1.04] tracking-[-0.04em] text-[#082a55] sm:text-[52px] lg:text-[60px]">
              A clearer path to <span className="text-[#0b9568]">restoring your health.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-8 text-[#365d81]">
              Start with a focused conversation with Dr. James Krystosik. Together, you will look beyond symptoms and decide whether a root-cause approach is right for you.
            </p>
            <div className="mt-7 flex flex-wrap gap-3 text-sm font-semibold text-[#17476e]">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm"><Video className="h-4 w-4 text-[#0b9568]" /> Online or phone</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm"><Clock3 className="h-4 w-4 text-[#0b9568]" /> 20-minute discovery visit</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm"><ShieldCheck className="h-4 w-4 text-[#0b9568]" /> Honest fit assessment</span>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <BookingButton label="Book Your Discovery Visit" />
              <a href={site.contact.phoneHref} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#0c568c] px-6 py-3 text-sm font-bold text-[#0c568c] transition hover:bg-[#eef7fc]">
                <Phone className="h-4 w-4" /> {site.contact.phone}
              </a>
            </div>
          </div>

          <aside className="relative rounded-[28px] border border-white/80 bg-white p-7 shadow-[0_24px_70px_rgba(22,87,111,0.14)] sm:p-9">
            <div className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dff5ed] text-[#07835e]"><Stethoscope className="h-6 w-6" /></div>
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#0b9568]">Discovery consultation</p>
            <div className="mt-5 flex items-end gap-3 border-b border-[#dfebef] pb-6">
              <span className="text-5xl font-extrabold tracking-[-0.04em] text-[#082a55]">$79</span>
              <span className="pb-1 text-sm leading-5 text-[#5b7891]">approximately<br />20 minutes</span>
            </div>
            <h2 className="mt-6 text-xl font-bold">This first visit is designed to:</h2>
            <ul className="mt-4 space-y-3">
              {["Understand your most important health concerns", "Determine whether Dr. Krystosik believes he can help", "Explain the appropriate next step with no obligation"].map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-[#365d81]"><span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#dff5ed] text-[#07835e]"><Check className="h-3 w-3 stroke-[3]" /></span>{item}</li>
              ))}
            </ul>
            <div className="mt-7"><BookingButton label="Choose a Time" /></div>
            <p className="mt-4 text-xs leading-5 text-[#6a859a]">If this is not the right fit, Dr. Krystosik can recommend another qualified functional medicine professional.</p>
          </aside>
        </div>
      </section>

      <section className="border-y border-[#e1edf0] bg-white">
        <div className="home-container grid divide-y divide-[#e1edf0] py-1 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[{ value: "Since 1986", label: "Functional medicine experience" }, { value: "Thousands", label: "Of patients supported" }, { value: "Worldwide", label: "Video and phone consultations" }].map((stat) => (
            <div key={stat.value} className="px-6 py-7 text-center"><p className="text-2xl font-extrabold text-[#0b9568]">{stat.value}</p><p className="mt-1 text-sm text-[#5b7891]">{stat.label}</p></div>
          ))}
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="home-container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0b9568]">A thoughtful first step</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">From complex symptoms to a clear plan</h2>
            <p className="mt-4 leading-7 text-[#526f89]">Your care begins with listening, careful evaluation, and recommendations shaped around you—not a one-size-fits-all protocol.</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {process.map((item, index) => { const Icon = item.icon; return (
              <article key={item.title} className="relative rounded-2xl border border-[#deebee] bg-white p-7 shadow-[0_12px_35px_rgba(20,82,104,0.07)]">
                <span className="absolute right-5 top-4 text-5xl font-black text-[#edf6f4]">0{index + 1}</span>
                <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#def5ed] text-[#07835e]"><Icon className="h-6 w-6" /></span>
                <h3 className="relative mt-5 text-xl font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#526f89]">{item.text}</p>
              </article>
            ); })}
          </div>
        </div>
      </section>

      <section className="bg-[#f4fafb] py-16 lg:py-20">
        <div className="home-container grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0b9568]">Comprehensive consultation</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.03em] sm:text-4xl">A deeper review, built around your whole health story.</h2>
            <p className="mt-5 leading-7 text-[#526f89]">If you move forward after the discovery visit, the comprehensive consultation may take up to two hours or more. Dr. Krystosik combines your history, concerns, and essential testing to build a personalized strategy.</p>
            <div className="mt-7 rounded-2xl bg-[#083d5c] p-6 text-white">
              <HeartPulse className="h-7 w-7 text-[#75d8ae]" />
              <p className="mt-4 text-lg font-bold">Root causes—not symptom management alone.</p>
              <p className="mt-2 text-sm leading-6 text-white/75">The goal is to understand the factors contributing to your health challenges and outline practical, individualized next steps.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {expectations.map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl bg-white p-5 shadow-[0_9px_28px_rgba(20,82,104,0.06)]">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dff5ed] text-[#07835e]"><Check className="h-4 w-4 stroke-[3]" /></span>
                <p className="text-sm leading-6 text-[#365d81]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="home-container">
          <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#073d5c] to-[#086f68] px-7 py-10 text-white shadow-[0_22px_60px_rgba(8,61,92,0.2)] sm:px-10 lg:px-14 lg:py-12">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#83dfb7]">Ready when you are</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">Choose the easiest way to get started.</h2>
                <p className="mt-4 max-w-2xl leading-7 text-white/75">Book online, call the office, or email us with “CONSULTATION” in the subject line. If calling, leave your name, number, primary health concern, and the best times to reach you.</p>
              </div>
              <BookingButton label="Schedule Online" />
            </div>
            <div className="mt-8 grid gap-4 border-t border-white/15 pt-8 sm:grid-cols-2">
              <a href={site.contact.phoneHref} className="flex items-center gap-4 rounded-2xl bg-white/10 p-5 transition hover:bg-white/15"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10"><Phone className="h-5 w-5" /></span><span><span className="block text-xs uppercase tracking-wider text-white/60">Call us</span><span className="mt-1 block font-bold">{site.contact.phone}</span></span></a>
              <a href={site.contact.emailHref} className="flex items-center gap-4 rounded-2xl bg-white/10 p-5 transition hover:bg-white/15"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10"><Mail className="h-5 w-5" /></span><span><span className="block text-xs uppercase tracking-wider text-white/60">Email us</span><span className="mt-1 block break-all font-bold">{site.contact.email}</span></span></a>
            </div>
          </div>
          <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-5 text-[#72899a]">This consultation is intended to determine whether the practice may be able to help with your concerns. It does not replace emergency care. If you are experiencing a medical emergency, call 911.</p>
        </div>
      </section>
    </main>
  );
}
