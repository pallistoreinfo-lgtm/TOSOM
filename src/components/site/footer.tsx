import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { Logo } from "./logo";
import { siteSettings } from "@/config/site";

export function Footer({ settings = siteSettings }: { settings?: typeof siteSettings }) {
  const { footerNav, footerTagline, site } = settings;
  return <footer className="bg-[#073a5a] text-white"><div className="home-container flex flex-col gap-8 py-7 lg:flex-row lg:items-center lg:justify-between"><div><span className="inline-flex rounded-xl bg-white px-3 py-2 shadow-sm"><Logo className="h-12 w-auto" /></span><p className="mt-4 text-[13px] text-white/65">© {new Date().getFullYear()} {site.name}. All rights reserved.</p></div><nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">{footerNav.map((item) => <Link key={item.label} href={item.href!} className="text-[13px] text-white/90 hover:text-white">{item.label}</Link>)}</nav><div className="flex flex-col items-start gap-6 lg:items-end"><div className="flex gap-4"><a href={site.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook className="h-5 w-5 fill-white" /></a><a href={site.social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube"><Youtube className="h-5 w-5" /></a><a href={site.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram className="h-5 w-5" /></a></div><p className="text-[12px] text-white/60">{footerTagline}</p></div></div></footer>;
}
