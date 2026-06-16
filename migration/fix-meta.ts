/**
 * Rewrite weak/missing meta descriptions (flagged in seo-report.json) with
 * 150-160 char descriptions that have a hook + CTA. Keyed by slug. Edits the
 * `seo.metaDescription` frontmatter field in place; leaves body untouched.
 *
 *   npx tsx migration/fix-meta.ts
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, "content");

// Hand-written descriptions per slug. ~150-160 chars, hook + CTA.
const META: Record<string, string> = {
  // Weight loss / metabolism
  "why-belly-fat-increases-after-40":
    "Belly fat after 40 isn't just aging. Dr. Krystosik explains the hormonal and gut-health drivers and how to lose it naturally — without extreme dieting.",
  "why-am-i-always-tired-after-40":
    "Always tired after 40? A functional medicine look at how energy, gut health, and aging connect — and the root-cause fixes that restore vitality.",
  "why-am-i-always-bloated-after-50":
    "Bloated after 50? Dr. Krystosik breaks down the real functional-medicine causes of persistent bloating and the gut-first steps that actually resolve it.",
  "how-much-does-alcohol-damage-the-gut-and-trigger-weight-gain-after-age-50":
    "How much does alcohol really damage your gut and drive weight gain after 50? A clinical look at the gut-alcohol link and how to reverse the effects.",
  "is-cream-of-rice-good-for-weight-loss":
    "Is cream of rice good for weight loss? Dr. Krystosik weighs the blood-sugar and gut-health trade-offs and where it fits in a root-cause weight plan.",
  "is-almond-milk-or-coconut-milk-better-for-weight-loss":
    "Almond milk vs coconut milk for weight loss: a functional medicine comparison of calories, gut impact, and which better supports fat loss.",
  "does-pumping-help-with-weight-loss":
    "Does pumping (breastfeeding) help with weight loss? A clinical look at the calorie burn, the hormones involved, and realistic expectations.",
  "does-acupuncture-help-weight-loss":
    "Does acupuncture help with weight loss? Dr. Krystosik examines the evidence, the appetite and stress connection, and where it fits in a real plan.",
  "do-fajas-help-with-weight-loss":
    "Do fajas (waist trainers) actually help with weight loss? A straight, evidence-based answer on what they do, what they don't, and the real fix.",
  "do-hot-tubs-help-with-weight-loss":
    "Do hot tubs help with weight loss? A functional medicine look at heat, circulation, and calorie burn — and what genuinely drives lasting fat loss.",
  "are-lollipops-good-for-weight-loss":
    "Are appetite-suppressant lollipops good for weight loss? Dr. Krystosik on why they backfire and the gut-first approach that actually works.",
  "why-are-many-asian-populations-slimmer":
    "Why are many Asian populations slimmer? A functional medicine look at diet, the gut microbiome, and lifestyle lessons you can apply for weight loss.",
  "can-cupping-help-with-weight-loss":
    "Can cupping therapy help with weight loss? An honest, clinical look at what cupping can and can't do — and where real, lasting results come from.",
  "can-a-chiropractor-help-with-weight-loss":
    "Can a chiropractor help with weight loss? Dr. Krystosik, a chiropractic physician, explains the nervous-system and lifestyle connection to fat loss.",
  "are-protein-pancakes-good-for-weight-loss":
    "Are protein pancakes good for weight loss? A functional medicine take on protein, blood sugar, and how to build a breakfast that supports fat loss.",
  "jowls-before-and-after-weight-loss":
    "Jowls before and after weight loss: what causes sagging, what improves with fat loss, and natural ways to support skin and facial tone.",
  "exercise-for-weight-loss-with-chronic-knee-pain":
    "Exercise for weight loss with chronic knee pain: low-impact, joint-safe strategies from a functional medicine physician to lose weight without flare-ups.",
  "managing-appetite-after-weight-loss":
    "Managing appetite after weight loss: why hunger surges and how to keep it off. Dr. Krystosik's gut- and hormone-based approach to lasting results.",

  // Back pain
  "does-cold-weather-cause-back-pain":
    "Does cold weather cause back pain? A chiropractor explains what's really happening to muscles and joints in the cold — and how to find relief.",
  "can-sugar-and-drinking-soda-cause-back-pain":
    "Can sugar and soda cause back pain? Dr. Krystosik on the inflammation-pain link and the dietary changes that can quiet chronic back pain at the root.",
  "can-massage-make-back-pain-worse":
    "Can massage make back pain worse? A chiropractor looks at when relief turns into irritation, the warning signs, and how to massage back pain safely.",
  "can-dehydration-cause-lower-back-pain":
    "Can dehydration cause lower back pain? How fluid loss affects spinal discs and muscles, plus simple hydration fixes from a chiropractic physician.",
  "can-back-pain-cause-high-blood-pressure":
    "Can back pain cause high blood pressure? Dr. Krystosik explains the pain-stress-blood-pressure connection and how root-cause care can help both.",
  "can-a-hemorrhoid-cause-back-pain":
    "Can a hemorrhoid cause back pain? A clinical look at referred pain, what's actually connected, and when your back pain points to something else.",
  "can-a-cane-help-with-back-pain":
    "Can a cane help with back pain? When a cane relieves pressure, how to use one correctly, and the root-cause steps that reduce reliance on it.",
  "are-adjustable-beds-good-for-back-pain":
    "Are adjustable beds good for back pain? A chiropractor on the sleep positions that ease spinal pressure and whether an adjustable bed is worth it.",

  // SIBO
  "foods-make-sibo-worse":
    "What foods make SIBO worse? Dr. Krystosik's functional medicine guide to the triggers that feed bacterial overgrowth and what to eat instead.",
  "sibo-and-brain-fog":
    "SIBO and brain fog: how bacterial overgrowth in the gut clouds your thinking, and the root-cause protocol that clears both gut and mind.",
  "kefir-and-sibo-all-you-need-to-know":
    "Kefir and SIBO: is this fermented food friend or foe with bacterial overgrowth? Dr. Krystosik on when kefir helps and when it makes SIBO worse.",
  "fasting-for-sibo":
    "Fasting for SIBO: can it help starve bacterial overgrowth, or does it backfire? A functional medicine look at fasting protocols for SIBO.",
  "how-to-treat-candida-and-sibo-at-the-same-time":
    "How to treat candida and SIBO at the same time: Dr. Krystosik's root-cause approach to tackling overlapping gut infections without making either worse.",
  "can-sibo-cause-acid-reflux":
    "Can SIBO cause acid reflux? The gut-pressure connection behind reflux and how treating bacterial overgrowth can resolve heartburn at the source.",
  "sibo-meal-plan":
    "A SIBO meal plan that works: Dr. Krystosik's gut-friendly foods, what to avoid, and how to eat to starve overgrowth while staying nourished.",
  "can-sibo-cause-back-pain":
    "Can SIBO cause back pain? How gut inflammation and bloating refer pain to the back, and the root-cause steps that relieve both.",
  "can-sibo-cause-headaches":
    "Can SIBO cause headaches? The gut-brain link behind SIBO headaches and migraines, and how treating overgrowth can ease the pain.",
  "sibo-die-off-symptoms":
    "SIBO die-off symptoms explained: what's normal during treatment, what isn't, and how Dr. Krystosik manages a Herxheimer reaction safely.",
  "sibo-vs-candida":
    "SIBO vs candida: how to tell these gut infections apart, why they overlap, and the functional medicine approach to treating each correctly.",
  "does-sibo-cause-bad-breath":
    "Does SIBO cause bad breath? The gut-origin behind persistent halitosis and how clearing bacterial overgrowth can fix breath that brushing won't.",
  "why-does-sibo-make-you-so-tired":
    "Why does SIBO make you so tired? How bacterial overgrowth steals nutrients and drains energy, and the root-cause fix that restores vitality.",

  // Key pages
  "consultation-with-dr-krystosik":
    "Book a $79 discovery consultation with Dr. Krystosik to review your history and map a root-cause, gut-first plan. We're ready to help restore your health.",
  "sibo-specialist":
    "Struggling with SIBO, bloating, and gut pain? Dr. Krystosik targets the root cause with a proven gut-first protocol. Book an online consultation today.",
  "contact":
    "Contact The Other Side of Medicine. Call (440) 519-1766 or email Dr. Krystosik to start your root-cause, gut-first path to lasting health.",
  "articles":
    "Functional medicine articles from Dr. Krystosik on gut health, SIBO, weight loss after 40, and back pain — root-cause answers you can act on.",
  "videos":
    "Watch patient testimonies and functional medicine videos from Dr. Krystosik — real root-cause healing stories from The Other Side of Medicine.",
  "podcasts":
    "The Other Side of Medicine podcast with Dr. James Krystosik — conversations on gut health, functional medicine, and root-cause healing. Listen now.",
};

const COLLECTIONS = ["blog", "conditions", "labtests", "pages", "podcast"];
let updated = 0;
const notFound: string[] = [];

for (const [slug, desc] of Object.entries(META)) {
  if (desc.length < 120 || desc.length > 165) {
    console.warn(`  ! ${slug}: description is ${desc.length} chars (target 150-160)`);
  }
  let found = false;
  for (const col of COLLECTIONS) {
    const file = path.join(CONTENT, col, `${slug}.mdx`);
    if (!fs.existsSync(file)) continue;
    const parsed = matter.read(file);
    parsed.data.seo = { ...(parsed.data.seo ?? {}), metaDescription: desc };
    fs.writeFileSync(file, matter.stringify(parsed.content, parsed.data));
    updated++;
    found = true;
    break;
  }
  if (!found) notFound.push(slug);
}

console.log(`Updated ${updated} meta descriptions.`);
if (notFound.length) console.log(`Not found (skipped): ${notFound.join(", ")}`);
