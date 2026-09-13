/**
 * Single source of truth for site-wide constants: navigation, contact details,
 * social links, and third-party integration IDs. Editing the menu, the Calendly
 * link, or the JotForm quiz ID happens here and nowhere else.
 */

export const site = {
  name: "The Other Side of Medicine",
  shortName: "TOSM",
  url: "https://theothersideofmedicine.com",
  description:
    "Functional medicine for gut health and root-cause healing with Dr. James Krystosik. Don't guess — test.",
  doctor: {
    name: "Dr. James Krystosik",
    credentials: "Functional Medicine Physician, Chiropractor, Author, Podcast Host",
    practicingSince: 1986,
    tagline: "DON'T GUESS. TEST.",
  },
  contact: {
    phone: "+1 (440) 519-1766",
    phoneHref: "tel:+14405191766",
    email: "drj@theothersideofmedicine.com",
    emailHref: "mailto:drj@theothersideofmedicine.com",
  },
  integrations: {
    calendlyUrl: "https://calendly.com/ibscure/60min",
    jotformGutQuizId: "250364347478464",
    shopUrl: "https://shop.theothersideofmedicine.com/",
    podcastRssUrl: "https://theothersideofmedicine.com/feed/podcast/",
    // TODO(newsletter): wire to the real provider once confirmed (Mailchimp / ConvertKit / etc.).
    // Until then NewsletterForm renders but does not submit anywhere real.
    newsletterProvider: null as null | { kind: string; endpoint: string },
  },
  social: {
    facebook: "https://www.facebook.com/theothersideofmedicine",
    x: "https://x.com/",
    linkedin: "https://www.linkedin.com/",
  },
} as const;

export type NavItem = {
  label: string;
  href?: string;
  children?: NavItem[];
};

// Mirrors the live WordPress mega-menu exactly.
export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about/" },
  {
    label: "Expert Info",
    children: [
      { label: "Digestive Illness", href: "/digestive-illness/" },
      { label: "Autoimmune Disease", href: "/autoimmune-disease/" },
      { label: "Metabolic Disorder", href: "/metabolic-disorder/" },
      { label: "SIBO", href: "/sibo-specialist/" },
      { label: "Weight Loss", href: "/weight-loss/" },
      {
        label: "Lab Tests",
        children: [
          { label: "Comprehensive Stool Analysis Test", href: "/comprehensive-stool-analysis-test/" },
          { label: "Elephant in the Exam Room", href: "/comprehensive-stool-analysis-test-2/" },
          { label: "Micronutrient Test", href: "/micronutrient-test/" },
        ],
      },
      { label: "Contact", href: "/contact/" },
    ],
  },
  {
    label: "Courses",
    children: [
      { label: "All Courses", href: "/courses/" },
      { label: "90-Day Gut Health Program", href: "/dr-krystosiks-90-days-gut-health-program/" },
      { label: "Gut Community", href: "/gut-community/" },
      { label: "7-Day Poop Challenge", href: "/7-day-poop-challenge/" },
      { label: "Blue Zone Diet", href: "/blue-zone-diet-course/" },
      { label: "Carbs From Heaven, Carbs From Hell", href: "/carbs-from-heaven-carbs-from-hell/" },
      { label: "Stool Transit Time", href: "/stool-transit-time-course/" },
      { label: "Supernatural Morning", href: "/supernatural-morning/" },
      { label: "The 7 Causes of Illness", href: "/the-7-causes-of-illness/" },
    ],
  },
  { label: "Articles", href: "/articles/" },
  {
    label: "Testimonies",
    children: [
      { label: "Audio", href: "/audio/" },
      { label: "Videos", href: "/videos/" },
    ],
  },
  { label: "Podcast", href: "/podcasts/" },
];

// Right-aligned header buttons.
export const headerCtas = [
  { label: "Online Consultation", href: "/consultation-with-dr-krystosik/", variant: "default" as const },
  { label: "Visit Our Shop", href: site.integrations.shopUrl, variant: "outline" as const, external: true },
];

export const footerNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about/" },
  { label: "Contact", href: "/contact/" },
  { label: "FAQ", href: "/faq/" },
  { label: "Online Consultation", href: "/consultation-with-dr-krystosik/" },
];
