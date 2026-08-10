import { getNavGroups, getNavItems, type Locale } from "./navigation";

export interface Breadcrumb {
  label: string;
  href: string;
}

export function getBreadcrumbs(pathname: string, locale: Locale): Breadcrumb[] {
  // Home page
  if (pathname === `/${locale}` || pathname === `/${locale}/`) {
    return [{ label: locale === "en" ? "Home" : "首頁", href: `/${locale}` }];
  }

  // Extract slug from pathname (e.g., /en/financial-reports → financial-reports)
  const slug = pathname.replace(`/${locale}/`, "").split("/")[0];
  if (!slug) return [];

  const navItems = getNavItems(locale);
  const page = navItems.find((item) => item.slug === slug);
  if (!page) return [];

  // Find which group this page belongs to
  const groups = getNavGroups(locale);
  const group = groups.find((g) => g.items.some((item) => item.slug === slug));

  const crumbs: Breadcrumb[] = [
    { label: locale === "en" ? "Home" : "首頁", href: `/${locale}` },
  ];

  if (group) {
    crumbs.push({ label: group.label, href: page.href });
  }

  crumbs.push({ label: page.label, href: page.href });

  return crumbs;
}