"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Phone } from "lucide-react";
import { mainNav, headerCtas, site, type NavItem } from "@/config/site";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

function DesktopNav() {
  return (
    <NavigationMenu className="hidden lg:flex">
      <NavigationMenuList>
        {mainNav.map((item) =>
          item.children ? (
            <NavigationMenuItem key={item.label}>
              <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-64 gap-1 p-3">
                  {item.children.map((child) =>
                    child.children ? (
                      <li key={child.label} className="mt-1 border-t pt-2">
                        <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {child.label}
                        </p>
                        {child.children.map((leaf) => (
                          <SubLink key={leaf.label} item={leaf} />
                        ))}
                      </li>
                    ) : (
                      <li key={child.label}>
                        <SubLink item={child} />
                      </li>
                    ),
                  )}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ) : (
            <NavigationMenuItem key={item.label}>
              <NavigationMenuLink asChild>
                <Link
                  href={item.href!}
                  className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ),
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function SubLink({ item }: { item: NavItem }) {
  return (
    <NavigationMenuLink asChild>
      <Link
        href={item.href!}
        className="block rounded-md px-3 py-2 text-sm leading-snug text-foreground transition-colors hover:bg-accent hover:text-primary"
      >
        {item.label}
      </Link>
    </NavigationMenuLink>
  );
}

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <nav className="mt-6 flex flex-col gap-1">
          {mainNav.map((item) => (
            <MobileNavItem key={item.label} item={item} />
          ))}
        </nav>
        <div className="mt-6 flex flex-col gap-2 border-t pt-6">
          {headerCtas.map((cta) => (
            <SheetClose asChild key={cta.label}>
              <Button asChild variant={cta.variant}>
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
            </SheetClose>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MobileNavItem({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  if (!item.children) {
    return (
      <SheetClose asChild>
        <Link
          href={item.href!}
          className={cn("rounded-md px-3 py-2 text-base hover:bg-accent", depth > 0 && "text-sm text-muted-foreground")}
        >
          {item.label}
        </Link>
      </SheetClose>
    );
  }
  return (
    <div className="flex flex-col">
      <p className={cn("px-3 py-2 text-base font-semibold", depth > 0 && "text-sm")}>{item.label}</p>
      <div className="ml-3 flex flex-col border-l pl-2">
        {item.children.map((c) => (
          <MobileNavItem key={c.label} item={c} depth={depth + 1} />
        ))}
      </div>
    </div>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      {/* Utility bar */}
      <div className="border-b bg-surface">
        <div className="container flex h-10 items-center justify-between text-xs">
          <a href={site.contact.phoneHref} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary">
            <Phone className="h-3.5 w-3.5" />
            {site.contact.phone}
          </a>
          <div className="hidden items-center gap-3 sm:flex">
            {headerCtas.map((cta) => (
              <Button asChild key={cta.label} size="sm" variant={cta.variant === "default" ? "dark" : "outline"}>
                <Link href={cta.href} {...("external" in cta && cta.external ? { target: "_blank", rel: "noopener" } : {})}>
                  {cta.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
      {/* Main nav */}
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label={site.name}>
          <Logo className="h-9 w-auto" />
        </Link>
        <DesktopNav />
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden md:inline-flex lg:hidden xl:inline-flex">
            <Link href="/faq/">Take Gut Quiz</Link>
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
