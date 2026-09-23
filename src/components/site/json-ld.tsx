import { site } from "@/config/site";

/** Renders a JSON-LD script. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.doctor.name,
  honorificSuffix: "D.C.",
  jobTitle: "Chiropractor and Functional Medicine Practitioner",
  description:
    "Doctor of Chiropractic, nutrition graduate, author, and host of The Other Side of Medicine; in clinical practice since 1986.",
  url: `${site.url}/about/`,
  image: `${site.url}/assets/images/2025/04/IMG_2084npic-radio-scaled.jpg`,
  telephone: site.contact.phone,
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Life University",
  },
  knowsAbout: ["Chiropractic", "Functional medicine", "Nutrition", "Digestive health", "Gut health"],
  sameAs: [
    site.social.facebook,
    site.social.youtube,
    site.social.instagram,
    site.social.x,
    site.social.linkedin,
  ],
};

export function articleSchema(opts: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    mainEntityOfPage: opts.url,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    image: opts.image ? new URL(opts.image, site.url).toString() : undefined,
    author: {
      "@type": "Person",
      name: site.doctor.name,
      honorificSuffix: "D.C.",
      jobTitle: "Chiropractor and Functional Medicine Practitioner",
      url: `${site.url}/about/`,
      sameAs: [
        site.social.facebook,
        site.social.youtube,
        site.social.instagram,
        site.social.x,
        site.social.linkedin,
      ],
    },
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: { "@type": "ImageObject", url: `${site.url}/logo.png` },
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}
