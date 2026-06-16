# The Other Side of Medicine — Website

A code-based rebuild of [theothersideofmedicine.com](https://theothersideofmedicine.com)
(Dr. James Krystosik's functional medicine practice), designed to be maintained by editing plain
content files instead of a WordPress page builder.

**Stack:** Next.js 15 (App Router, static export) · shadcn/ui (themed to the brand) · Tailwind CSS ·
MDX content. No database, no CMS, no server — `npm run build` emits a static `out/` directory the
team deploys anywhere.

---

## Quick start

```bash
npm install
npm run dev        # local dev at http://localhost:3000
npm run build      # static export -> out/
npm run typecheck  # tsc --noEmit
```

To preview the production build:

```bash
npm run build && npx serve out
```

---

## How the site is organized

```
content/            ← the editable layer (one .mdx file per item)
  blog/             ← articles            → /<slug>/
  podcast/          ← podcast episodes    → /podcasts/<slug>/
  conditions/       ← condition pages     → /<slug>/  (gets the consultation CTA)
  labtests/         ← lab-test pages      → /<slug>/  (gets the consultation CTA)
  pages/            ← everything else     → /<slug>/
src/
  config/site.ts    ← nav menu, phone, email, Calendly URL, JotForm ID, shop URL, socials
  lib/schemas.ts    ← the frontmatter contract (zod). A bad field fails the build.
  components/site/   ← brand components (Header, Footer, Hero, sections, embeds)
  components/ui/      ← shadcn primitives (button, card, accordion, nav-menu, sheet)
  app/               ← routes
public/assets/images/ ← all images, served at /assets/images/...
migration/          ← one-time extraction scripts (NOT part of the build)
```

---

## Common edits (for a human or an AI agent)

### Add a blog article
Create `content/blog/my-article-slug.mdx`:

```mdx
---
type: blog
title: My Article Title
slug: my-article-slug
date: "2026-06-15T09:00:00"
excerpt: One-sentence summary shown in listings and meta description.
category: Weight Loss        # optional
heroImage:
  src: /assets/images/2026/06/my-image.png
  alt: Descriptive alt text
seo:
  metaTitle: Keyword-Led Title (no "THE OTHER SIDE OF MEDICINE" suffix)
  metaDescription: 150-160 char description with a hook and a call to action.
---

Body in Markdown. Put images in `public/assets/images/...` and reference them
with `![alt](/assets/images/...)`.
```

It appears automatically at `/my-article-slug/` and in `/articles/`, with the author
credentials block + Article/Person schema. No code change needed.

### Add a condition or lab-test page
Same as above but in `content/conditions/` or `content/labtests/`, with `type: condition`
(or `labtest`). These automatically get the $79 consultation CTA at the bottom.

### Add a podcast episode
Create `content/podcast/episode-slug.mdx` with `type: podcast`, `audioUrl` (the Libsyn URL),
`duration`, and a body. Audio is never hosted here — it streams from Libsyn.

### Change the menu, phone number, or an integration ID
Edit `src/config/site.ts`. That's the single source of truth for nav, contact, Calendly,
JotForm, the shop link, and social links.

### Embed Calendly / the gut quiz / a YouTube video inside an article
Use the components directly in MDX:

```mdx
<CalendlyEmbed />
<GutQuiz />
<YouTube id="dQw4w9WgXcQ" />
```

---

## Integrations

| Feature | How it works |
|---|---|
| **Booking** | Calendly embed (`calendly.com/ibscure/60min`) — `src/config/site.ts` |
| **Gut quiz** | JotForm embed (form `250364347478464`) |
| **Shop** | Links out to the existing Shopify store; not rebuilt here |
| **Podcast** | Streams from Libsyn; episode pages have an HTML5 player |
| **Newsletter** | ⚠️ **NOT connected.** See below. |

### ⚠️ Newsletter — needs wiring before launch
The old WordPress signup posted into WordPress, which no longer exists. `NewsletterForm`
renders and validates the email but does **not** submit anywhere yet. To connect it, set
`integrations.newsletterProvider` in `src/config/site.ts` and add the provider POST in
`src/components/site/newsletter-form.tsx` (search for `TODO(newsletter)`).

---

## Re-running the content migration

The `migration/` scripts re-pull from the live WordPress site (safe to re-run; overwrites MDX):

```bash
npm run extract          # posts + pages -> MDX, builds the image manifest
npm run extract:podcast  # podcast episodes -> MDX
npm run extract:media    # downloads images from the manifest into public/assets/images
```

`migration/.cache/seo-report.json` lists pages with weak/missing meta descriptions to rewrite.

---

## SEO notes (improvements over the old site)
- Exactly one keyword-led `<h1>` per page (the old Elementor pages had none).
- `robots.txt` includes the `Sitemap:` line; `sitemap.xml` is generated.
- Article/Person/Breadcrumb JSON-LD on articles; author credentials block on every post (YMYL E-E-A-T).
- Titles drop the all-caps brand suffix; descriptions are editable per page in frontmatter.
- Static HTML + minimal JS replaces render-blocking Elementor CSS/JS.

After deploy, verify the property in Google Search Console to start collecting search data.
