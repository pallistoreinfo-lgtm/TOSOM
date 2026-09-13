"use client";

import Link from "next/link";
import { Menu, Search, Send } from "lucide-react";
import { mainNav, site, type NavItem } from "@/config/site";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "./logo";

const navItems = mainNav.filter((item) => item.label !== "Home").map((item) => item.label === "Expert In" ? { ...item, label: "Expert Info" } : item);

function DropdownLink({ item }: { item: NavItem }) {
  if (!item.href) return null;
  return <NavigationMenuLink asChild><Link href={item.href} className="block rounded-lg px-3 py-2 text-sm text-[#12375e] hover:bg-[#eef8f5] hover:text-[#087c58]">{item.label}</Link></NavigationMenuLink>;
}

function DesktopNav() {
  return (
    <NavigationMenu className="hidden xl:flex"><NavigationMenuList className="gap-1">
      {navItems.map((item) => item.children ? (
        <NavigationMenuItem key={item.label}><NavigationMenuTrigger className="bg-transparent px-3 text-[13px] font-medium text-[#082a55] hover:bg-transparent hover:text-[#087c58] data-[state=open]:bg-transparent">{item.label}</NavigationMenuTrigger><NavigationMenuContent><ul className="grid w-72 gap-1 p-3">{item.children.flatMap((child) => child.children ? child.children : [child]).map((child) => <li key={child.label}><DropdownLink item={child} /></li>)}</ul></NavigationMenuContent></NavigationMenuItem>
      ) : (
        <NavigationMenuItem key={item.label}><NavigationMenuLink asChild><Link href={item.href!} className="inline-flex h-10 items-center px-3 text-[13px] font-medium text-[#082a55] hover:text-[#087c58]">{item.label}</Link></NavigationMenuLink></NavigationMenuItem>
      ))}
    </NavigationMenuList></NavigationMenu>
  );
}

function MobileNav() {
  return (
    <Sheet><SheetTrigger asChild><Button variant="ghost" size="icon" className="xl:hidden" aria-label="Open menu"><Menu className="h-6 w-6" /></Button></SheetTrigger><SheetContent side="right"><SheetTitle className="sr-only">Menu</SheetTitle><nav className="mt-8 flex flex-col gap-1">{navItems.map((item) => item.href ? <SheetClose asChild key={item.label}><Link href={item.href} className="rounded-lg px-3 py-2.5 font-medium hover:bg-[#eef8f5]">{item.label}</Link></SheetClose> : <div key={item.label} className="px-3 py-2.5 font-semibold">{item.label}<div className="mt-1 border-l pl-3">{item.children?.map((child) => child.href ? <SheetClose asChild key={child.label}><Link href={child.href} className="block py-1.5 text-sm font-normal text-muted-foreground">{child.label}</Link></SheetClose> : null)}</div></div>)}</nav><div className="mt-6 grid gap-2 border-t pt-5"><Button asChild className="bg-[#07835e]"><Link href="/faq/">Take Gut Quiz</Link></Button><Button asChild className="bg-[#07528c]"><Link href="/consultation-with-dr-krystosik/">Online Consultation</Link></Button></div></SheetContent></Sheet>
  );
}

export function Header() {
  return (
    <header className="relative z-50 w-full border-b border-[#dce9ef] bg-white"><div className="home-container flex h-[88px] items-center justify-between gap-5"><Link href="/" aria-label={site.name} className="shrink-0"><Logo className="h-14" /></Link><DesktopNav /><div className="ml-auto flex items-center gap-3"><button aria-label="Search" className="hidden h-10 w-10 items-center justify-center text-[#082a55] lg:flex"><Search className="h-5 w-5" /></button><Link href="/faq/" className="hidden items-center gap-2 rounded-full bg-[#07835e] px-5 py-3 text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#096f53] lg:flex"><Send className="h-3.5 w-3.5" /> Take Gut Quiz</Link><Link href="/consultation-with-dr-krystosik/" className="hidden rounded-full bg-[#07528c] px-5 py-3 text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#063f6c] lg:block">Online Consultation</Link><a href={site.integrations.shopUrl} target="_blank" rel="noopener" className="hidden rounded-full border border-[#0b477a] px-5 py-[11px] text-[12px] font-semibold text-[#0b477a] transition hover:bg-[#f1f8fb] 2xl:block">Visit Our Shop</a><MobileNav /></div></div></header>
  );
}
