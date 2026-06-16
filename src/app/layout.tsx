import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/config/site";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <body>{children}</body>
    </html>
  );
}
