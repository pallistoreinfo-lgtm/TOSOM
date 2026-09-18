import type { Metadata } from "next";
import "./globals.css";
import { site, siteSettings } from "@/config/site";
import { getRuntimeJson } from "@/lib/runtime-content";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";

// The live site uses the OS system font stack for body and Helvetica/Arial for
// headings — no custom webfonts. We reproduce that exactly (zero font downloads,
// fastest possible first paint). The CSS variables feed tailwind's fontFamily.
const systemSans =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif';
const headingStack = 'Helvetica, Arial, ' + systemSans;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Functional Medicine for Gut Health & Root-Cause Healing | Dr. Krystosik",
    template: `%s | ${site.name}`,
  },
  description: site.description,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const runtimeSettings = await getRuntimeJson("content/site.json", siteSettings);
  return (
    <html
      lang="en"
      style={
        {
          "--font-body": systemSans,
          "--font-heading": headingStack,
        } as React.CSSProperties
      }
    >
      <body>
        <Header settings={runtimeSettings} />
        <main className="min-h-screen">{children}</main>
        <Footer settings={runtimeSettings} />
      </body>
    </html>
  );
}
