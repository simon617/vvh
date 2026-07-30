"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

export default function MobileMenu({ isOpen, onClose, locale }: MobileMenuProps) {
  const t = useTranslations("nav");

  const menuItems = [
    { label: t("home"), href: `/${locale}` },
    { label: t("boardOfDirectors"), href: `/${locale}/board-of-directors` },
    { label: t("corporateDetails"), href: `/${locale}/corporate-details` },
    { label: t("corporateGovernance"), href: `/${locale}/corporate-governance` },
    { label: t("announcements"), href: `/${locale}/announcements` },
    { label: t("financialReports"), href: `/${locale}/financial-reports` },
    { label: t("esgReports"), href: `/${locale}/esg-reports` },
    { label: t("lostShareCertificates"), href: `/${locale}/lost-share-certificates` },
    { label: t("corporateCommunications"), href: `/${locale}/corporate-communications` },
    { label: t("contactUs"), href: `/${locale}/contact` },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      {/* Menu panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-primary text-white shadow-xl overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <span className="text-lg font-semibold">Menu</span>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="block px-4 py-3 rounded hover:bg-white/10 transition-colors text-base"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}