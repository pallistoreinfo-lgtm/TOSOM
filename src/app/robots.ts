import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export const dynamic = "force-static";

// Fixes the live site's audit finding #4: robots.txt had no Sitemap line.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
