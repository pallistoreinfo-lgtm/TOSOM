import settings from "../../content/site.json";

export type NavItem = {
  label: string;
  href?: string;
  children?: NavItem[];
};

export const site = settings.site;
export const mainNav = settings.mainNav as NavItem[];
export const headerActions = settings.headerActions;
export const footerNav = settings.footerNav as NavItem[];
export const footerTagline = settings.footerTagline;
