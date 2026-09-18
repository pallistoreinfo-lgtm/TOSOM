import Image from "next/image";
import Link from "next/link";
import {
  Apple, ArrowRight, Check, ChevronLeft, ChevronRight, FlaskConical,
  Leaf, PersonStanding, Pill, Play, Quote, Star,
} from "lucide-react";
import homeContent from "../../content/home.json";
import { getRuntimeJson } from "@/lib/runtime-content";
import { TestimonialVideos } from "@/components/site/testimonial-videos";
import { headerActions } from "@/config/site";

const planIcons = { lab: FlaskConical, diet: Apple, supplements: Pill, stress: PersonStanding };

function GreenButton({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="home-green-button">{children}<ArrowRight className="h-4 w-4" /></Link>;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="flex items-center gap-3 text-[12px] font-bold uppercase tracking-[0.16em] text-[#126bb6]"><span className="h-[2px] w-6 bg-[#18a66f]" />{children}</p>;
}

function Rating() {
  return <div className="flex gap-0.5 text-[#ffb300]" aria-label="5 out of 5 stars">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>;
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await getRuntimeJson("content/home.json", homeContent);
  return (
    <div className="overflow-hidden bg-white text-[#082a55]">
      <section className="relative overflow-hidden bg-[#f8f4ed]">
        <Image src="/assets/home/gut-restoration-roadmap.webp" alt="Dr. James Krystosik at age 77 presenting his gut restoration roadmap" width={2600} height={1387} priority sizes="100vw" className="h-auto w-full" />

        <div className="home-container py-9 text-center sm:py-11 lg:py-14">
          <div className="mx-auto max-w-[900px]">
            <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.23em] text-[#118860]">{content.hero.eyebrow}</p>
            <h1 className="text-[37px] font-extrabold leading-[1.1] tracking-[-0.035em] text-[#082a55] sm:text-[44px] lg:text-[50px]">
              {content.hero.line1} <span className="text-[#129562]">{content.hero.line2} {content.hero.line3}</span>
            </h1>
            <p className="mx-auto mt-5 max-w-[650px] text-[16px] leading-7 text-[#123b67]">{content.hero.description}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <GreenButton href={headerActions.quiz.href}>{content.hero.primaryButton}</GreenButton>
              <Link href="/videos/" className="home-outline-button"><span className="flex h-5 w-5 items-center justify-center rounded-full border border-current"><Play className="ml-0.5 h-2.5 w-2.5 fill-current" /></span>{content.hero.secondaryButton}</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 bg-white py-9">
        <div className="home-container"><TestimonialVideos videos={content.videos} /></div>
      </section>

      <section className="bg-gradient-to-b from-white to-[#f7fcfd] py-10 lg:py-14">
        <div className="home-container grid items-center gap-10 lg:grid-cols-[0.9fr_1.25fr]">
          <div>
            <Eyebrow>{content.approach.eyebrow}</Eyebrow>
            <h2 className="mt-3 max-w-[450px] text-[35px] font-bold leading-[1.08] tracking-[-0.025em]">{content.approach.title}</h2>
            <p className="mt-5 max-w-[535px] text-[15px] leading-[1.53] text-[#365d81]">{content.approach.description}</p>
            <div className="mt-5"><GreenButton href="/about/">{content.approach.button}</GreenButton></div>
          </div>
          <div className="relative">
            <Leaf className="absolute -left-6 -top-3 z-10 h-16 w-16 -rotate-45 fill-[#bfe8c8] text-[#9ddcae] opacity-80" />
            <div className="relative aspect-[1.72/1] overflow-hidden rounded-[105px_22px_105px_22px] shadow-[0_18px_45px_rgba(30,111,82,0.08)]">
              <Image src="/assets/home/healthy-food.png" alt="Fresh Mediterranean salad and water" fill sizes="(max-width:1024px) 100vw, 55vw" className="object-cover" />
              <div className="absolute right-3 top-5 max-w-[220px] rotate-[-7deg] rounded-3xl bg-white/70 px-5 py-4 text-center font-[cursive] text-[24px] font-bold leading-[1.2] text-[#0b3768] backdrop-blur-[2px] sm:right-7 sm:top-9 sm:text-[29px]">{content.approach.imageMessage.map((line) => <span key={line} className="block">{line}</span>)}<span className="mx-auto mt-2 block h-[3px] w-20 rotate-[-4deg] bg-[#0f6595]" /></div>
            </div>
            <Leaf className="absolute -bottom-7 right-0 h-20 w-20 rotate-[18deg] fill-[#a9e2ac] text-[#75c987] opacity-75" />
          </div>
        </div>
      </section>

      <section className="bg-[#effbfd] py-11 lg:py-14">
        <div className="home-container grid items-center gap-9 lg:grid-cols-[235px_1fr_490px]">
          <div className="relative mx-auto aspect-square w-full max-w-[260px]"><Image src="/assets/home/stephany-story.png" alt="Stephany smiling after improving her health" fill sizes="260px" className="object-contain" /></div>
          <div>
            <Eyebrow>{content.story.eyebrow}</Eyebrow>
            <h2 className="mt-3 text-[29px] font-bold tracking-[-0.02em]">{content.story.title}</h2>
            <p className="mt-2 text-[14px] leading-6 text-[#365d81]">{content.story.description}</p>
            <div className="mt-5 flex gap-4 rounded-xl bg-[#e2f5ed] p-5">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#129669] text-white"><Check className="h-4 w-4 stroke-[3]" /></span>
              <p className="text-[13px] leading-5 text-[#264f70]"><strong className="block text-[#0c395e]">Results:</strong>{content.story.result}</p>
            </div>
            <Link href="/videos/" className="mt-5 inline-flex items-center gap-3 text-[14px] font-semibold leading-5 text-[#166281]">{content.story.link} <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="rounded-2xl bg-white px-7 py-5 shadow-[0_16px_40px_rgba(24,104,132,0.08)]">
            <h3 className="mb-2 flex items-center gap-4 text-[20px] font-bold text-[#0c467a]"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#d7f6f9] text-[#0d8c9e]"><FlaskConical className="h-7 w-7" /></span>Gut 911 Rx</h3>
            <div className="ml-[70px]">
              {content.gutPlan.map((item) => { const Icon = planIcons[item.icon as keyof typeof planIcons]; return <div key={item.title} className="flex gap-4 border-b border-[#d8e9ed] py-2.5 last:border-0"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#dff4ef] text-[#108e77]"><Icon className="h-4 w-4" /></span><div><p className="text-[14px] font-bold text-[#154b78]">{item.title}</p><p className="mt-0.5 text-[12px] leading-[1.45] text-[#52748e]">{item.text}</p></div></div>; })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-[#f7fcfd] to-[#eef9fc] py-10 lg:py-12">
        <div className="home-container">
          <div className="[&>p]:text-[14px]"><Eyebrow>What People Say</Eyebrow></div>
          <div className="mt-4 grid gap-7 lg:grid-cols-[1.08fr_1fr]">
            {content.testimonials.map((testimonial) => (
              <article key={testimonial.name} className="relative rounded-2xl bg-white px-8 py-6 pl-16 shadow-[0_14px_34px_rgba(26,97,129,0.07)]">
                <Quote className="absolute left-5 top-5 h-7 w-7 fill-[#20a878] text-[#20a878]" />
                <p className="text-[14px] leading-[1.55] text-[#365d81]">{testimonial.quote}</p>
                <div className="mt-4 flex items-center gap-3"><Image src={testimonial.image} alt={testimonial.name} width={46} height={46} className="h-11 w-11 rounded-full object-cover" /><div><p className="text-[13px] font-bold">{testimonial.name}</p><p className="text-[12px] text-[#6a8aa1]">{testimonial.role}</p></div><Rating /></div>
              </article>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-end gap-4"><div className="mr-auto flex gap-2 lg:ml-[73%]"><span className="h-1.5 w-1.5 rounded-full bg-[#0da09c]" /><span className="h-1.5 w-1.5 rounded-full bg-[#65bcdc]" /><span className="h-1.5 w-1.5 rounded-full bg-[#d7e9ee]" /></div><button className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e2f0f5] text-[#19517d]" aria-label="Previous testimonial"><ChevronLeft /></button><button className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e2f0f5] text-[#19517d]" aria-label="Next testimonial"><ChevronRight /></button></div>
        </div>
      </section>
    </div>
  );
}
