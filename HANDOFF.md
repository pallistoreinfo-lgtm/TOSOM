# Handoff Notes

Status as of the pre-handoff cleanup pass. Build, typecheck, and lint all pass;
159 static pages export cleanly. The items below are intentional leftovers that
need a human decision or external info — they are NOT bugs introduced by the
rebuild.

## Open items (need owner input)

1. **Newsletter form is stubbed.** `src/components/site/newsletter-form.tsx`
   renders but does not submit anywhere. The live WP form posted to
   `admin-ajax`, which no longer exists. Wire `site.integrations.newsletterProvider`
   in `src/config/site.ts` to the real provider (Mailchimp / ConvertKit / etc.)
   once confirmed.

2. **Social links are placeholders.** In `src/config/site.ts`, `social.x` is
   `https://x.com/` and `social.linkedin` is `https://www.linkedin.com/`. Replace
   with the real profile URLs (or remove if the practice has no X/LinkedIn).

3. **`content/pages/articles.mdx` may be redundant.** This is a hand-built,
   static replica of the WordPress blog-listing page. The site also generates
   real article pages from `content/blog/*.mdx` via the `[slug]` route. Decide
   whether to keep this static listing (and maintain it by hand) or replace it
   with a generated index. Its byline dead-links (WP author/date/category
   archives that don't exist here) have been converted to plain text.

4. **Absolute links to the live domain in body copy.** ~150 in-content links
   point at `https://theothersideofmedicine.com/...` rather than relative paths.
   They resolve correctly against the live site, so they are not broken, but if
   you deploy to a different domain or want internal links to stay on-site,
   convert post-to-post links to relative paths. (Frontmatter `seo.canonical`
   values SHOULD stay absolute — leave those.)

5. **Elementor image filenames.** A few images under
   `public/assets/images/elementor/` keep their builder-generated hash filenames
   (e.g. `Intense-1500-x-2320-px-1-r32kqo...png`). They exist and render fine;
   rename only if you care about clean asset names (rename the file AND the
   reference together).

## Fixed in this pass

- `content/pages/audio.mdx` — removed the WordPress demo-theme block (fake team
  members "Harrison Hudson / WordPress Dev" etc., Lorem Ipsum, `info@example.com`).
  Real SoundCloud testimonial players by condition are retained.
- `content/blog/can-a-chiropractor-help-with-weight-loss.mdx` — a double-escaped
  HTML table (`&lt;table>...`) that rendered as literal text is now a proper
  Markdown table.
- `content/pages/about.mdx` — fixed brand-name typo in link text
  (`TheOtheSideofMedicine` → `TheOtherSideofMedicine`).
- `content/pages/articles.mdx` — converted dead WP archive byline links
  (author `rasel2543`, date archives, category archives) to plain text.
