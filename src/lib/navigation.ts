export type Locale = "en" | "zh";

export interface NavItem {
  label: string;
  href: string;
  slug: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_SLUGS = [
  "home",
  "board-of-directors",
  "corporate-details",
  "corporate-governance",
  "announcements",
  "financial-reports",
  "esg-reports",
  "lost-share-certificates",
  "corporate-communications",
  "contact",
] as const;

export type NavSlug = (typeof NAV_SLUGS)[number];

const NAV_STRUCTURE: { group: string; slugs: NavSlug[] }[] = [
  {
    group: "Corporate Information",
    slugs: ["board-of-directors", "corporate-details"],
  },
  {
    group: "Corporate Governance",
    slugs: ["corporate-governance"],
  },
  {
    group: "Investor Relations",
    slugs: [
      "announcements",
      "financial-reports",
      "esg-reports",
      "lost-share-certificates",
      "corporate-communications",
    ],
  },
  {
    group: "Contact Us",
    slugs: ["contact"],
  },
];

const SLUG_LABELS: Record<NavSlug, { en: string; zh: string }> = {
  home: { en: "Home", zh: "首頁" },
  "board-of-directors": { en: "Board of Directors", zh: "董事會" },
  "corporate-details": { en: "Corporate Details", zh: "公司詳情" },
  "corporate-governance": { en: "Corporate Governance", zh: "企業管治" },
  announcements: { en: "Announcements & Circulars", zh: "公告及通函" },
  "financial-reports": { en: "Financial Reports", zh: "財務報告" },
  "esg-reports": { en: "ESG Reports", zh: "環境、社會及管治報告" },
  "lost-share-certificates": { en: "Lost Share Certificates", zh: "遺失股票證書" },
  "corporate-communications": { en: "Corporate Communications", zh: "公司通訊" },
  contact: { en: "Contact Us", zh: "聯絡我們" },
};

const GROUP_LABELS: Record<string, { en: string; zh: string }> = {
  "Corporate Information": { en: "Corporate Information", zh: "公司資料" },
  "Corporate Governance": { en: "Corporate Governance", zh: "企業管治" },
  "Investor Relations": { en: "Investor Relations", zh: "投資者關係" },
  "Contact Us": { en: "Contact Us", zh: "聯絡我們" },
};

export function getNavItems(locale: Locale): NavItem[] {
  return NAV_SLUGS.map((slug) => ({
    label: SLUG_LABELS[slug][locale],
    href: slug === "home" ? `/${locale}` : `/${locale}/${slug}`,
    slug,
  }));
}

export function getNavGroups(locale: Locale): NavGroup[] {
  return NAV_STRUCTURE.map((group) => ({
    label: GROUP_LABELS[group.group][locale],
    items: group.slugs.map((slug) => ({
      label: SLUG_LABELS[slug][locale],
      href: `/${locale}/${slug}`,
      slug,
    })),
  }));
}
