import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { Logo } from "./logo";

const footerLinks = [["About", "/about/"], ["Contact", "/contact/"], ["FAQ", "/faq/"], ["Online Consultation", "/consultation-with-dr-krystosik/"], ["Articles", "/articles/"], ["Podcast", "/podcasts/"]];

export function Footer() {
  return <footer className="bg-[#073a5a] text-white"><div className="home-container flex flex-col gap-8 py-7 lg:flex-row lg:items-center lg:justify-between"><div><Logo onDark className="h-12" /><p className="mt-4 text-[13px] text-white/65">© {new Date().getFullYear()} The Other Side of Medicine. All rights reserved.</p></div><nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">{footerLinks.map(([label, href]) => <Link key={label} href={href} className="text-[13px] text-white/90 hover:text-white">{label}</Link>)}</nav><div className="flex flex-col items-start gap-6 lg:items-end"><div className="flex gap-4"><a href="https://www.facebook.com/theothersideofmedicine" aria-label="Facebook"><Facebook className="h-5 w-5 fill-white" /></a><a href="https://www.youtube.com/" aria-label="YouTube"><Youtube className="h-5 w-5" /></a><a href="https://www.instagram.com/" aria-label="Instagram"><Instagram className="h-5 w-5" /></a></div><p className="text-[12px] text-white/60">Healthier People&nbsp; · &nbsp;A Brighter Future</p></div></div></footer>;
}
