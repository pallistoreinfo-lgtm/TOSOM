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
  jobTitle: "Functional Medicine Physician",
  description: site.doctor.credentials,
  url: `${site.url}/about/`,
  telephone: site.contact.phone,
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
    author: { "@type": "Person", name: site.doctor.name, url: `${site.url}/about/` },
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
