"use client";

import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function LanguageSwitcher() {
  const t = useTranslations("header");
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = params.locale as string;

  const targetLocale = currentLocale === "en" ? "zh" : "en";
  const targetPath = pathname.replace(`/${currentLocale}`, `/${targetLocale}`);

  return (
    <Link
      href={targetPath}
      className="text-sm font-medium px-3 py-1.5 rounded border border-white/30 text-white hover:bg-white/10 hover:text-white transition-colors"
    >
      {t("languageSwitch")}
    </Link>
  );
}