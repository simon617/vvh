"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  locale: string;
}

export default function Sidebar({ locale }: SidebarProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const navGroups = [
    {
      label: t("corporateInformation"),
      items: [
        { label: t("boardOfDirectors"), href: `/${locale}/board-of-directors` },
        { label: t("corporateDetails"), href: `/${locale}/corporate-details` },
      ],
    },
    {
      label: t("corporateGovernance"),
      items: [
        { label: t("corporateGovernance"), href: `/${locale}/corporate-governance` },
      ],
    },
    {
      label: t("investorRelations"),
      items: [
        { label: t("announcements"), href: `/${locale}/announcements` },
        { label: t("financialReports"), href: `/${locale}/financial-reports` },
        { label: t("esgReports"), href: `/${locale}/esg-reports` },
        { label: t("lostShareCertificates"), href: `/${locale}/lost-share-certificates` },
        { label: t("corporateCommunications"), href: `/${locale}/corporate-communications` },
      ],
    },
    {
      label: t("contactUs"),
      items: [
        { label: t("contactUs"), href: `/${locale}/contact` },
      ],
    },
  ];

  return (
    <aside className="hidden md:block w-64 shrink-0">
      <nav className="bg-white rounded-lg shadow-md p-4 sticky top-4">
        <ul className="space-y-1">
          <li>
            <Link
              href={`/${locale}`}
              className={`block px-3 py-2 rounded text-sm transition-colors ${
                pathname === `/${locale}`
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {t("home")}
            </Link>
          </li>
          {navGroups.map((group) => (
            <li key={group.label}>
              <div
                className={`px-3 py-2 font-semibold text-sidebar uppercase tracking-wider mt-2 border-b border-sidebar/20 ${
                  locale === "en" ? "text-xs" : "text-sm"
                }`}
              >
                {group.label}
              </div>
              <ul className="ml-2 space-y-1">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block px-3 py-2 rounded text-sm transition-colors ${
                        pathname === item.href
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}