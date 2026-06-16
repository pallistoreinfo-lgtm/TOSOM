import Link from "next/link";
import { Facebook, Linkedin, Mail, Phone } from "lucide-react";
import { site, footerNav } from "@/config/site";
import { NewsletterForm } from "./newsletter-form";

export function Footer() {
  return (
    <footer className="border-t bg-secondary text-secondary-foreground">
      <div className="container grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="text-lg font-semibold">{site.name}</p>
          <p className="mt-2 max-w-sm text-sm text-secondary-foreground/80">{site.description}</p>
          <p className="mt-4 text-sm font-medium uppercase tracking-wide text-secondary-foreground/70">
            {site.doctor.tagline}
          </p>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <a href={site.contact.phoneHref} className="flex items-center gap-2 hover:underline">
              <Phone className="h-4 w-4" /> {site.contact.phone}
            </a>
            <a href={site.contact.emailHref} className="flex items-center gap-2 hover:underline">
              <Mail className="h-4 w-4" /> {site.contact.email}
            </a>
          </div>
          <div className="mt-4 flex gap-3">
            <a href={site.social.facebook} aria-label="Facebook" className="hover:text-white/70" target="_blank" rel="noopener">
              <Facebook className="h-5 w-5" />
            </a>
            <a href={site.social.linkedin} aria-label="LinkedIn" className="hover:text-white/70" target="_blank" rel="noopener">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide">Explore</p>
          <ul className="mt-3 space-y-2 text-sm">
            {footerNav.map((item) => (
              <li key={item.label}>
                <Link href={item.href!} className="text-secondary-foreground/80 hover:text-white hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide">Newsletter</p>
          <p className="mt-3 text-sm text-secondary-foreground/80">
            Gut-health tips and updates from Dr. Krystosik.
          </p>
          <NewsletterForm className="mt-3" />
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="container flex flex-col gap-2 py-4 text-xs text-secondary-foreground/70 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p>{site.doctor.name} · In practice since {site.doctor.practicingSince}</p>
        </div>
      </div>
    </footer>
  );
}
