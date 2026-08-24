"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const LOCALES = ["en", "zh"] as const;
type Locale = (typeof LOCALES)[number];

const tabBase = "px-4 py-2 text-sm font-medium border-b-2 transition-colors";

interface LocaleTabsProps {
  /** Return false to block switching (e.g. there are unsaved changes). */
  onBeforeChange?: (next: Locale) => boolean;
}

/**
 * EN/ZH tab switcher. The active locale lives in the URL search param
 * `?tab=en|zh` (TD-15) so browser back/forward and links behave naturally.
 */
export default function LocaleTabs({ onBeforeChange }: LocaleTabsProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const active: Locale = searchParams.get("tab") === "zh" ? "zh" : "en";

  function handleChange(next: Locale) {
    if (next === active) return;
    if (onBeforeChange && !onBeforeChange(next)) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.replace(`${pathname}?${params.toString()}`);
  }

  const activeClass = "border-primary text-primary";
  const inactiveClass =
    "border-transparent text-text hover:text-primary hover:border-primary/40";

  return (
    <div role="tablist" aria-label="Language" className="flex gap-1 border-b border-border">
      {LOCALES.map((locale) => (
        <button
          key={locale}
          role="tab"
          type="button"
          aria-selected={active === locale}
          aria-label={locale === "en" ? "English" : "Chinese"}
          onClick={() => handleChange(locale)}
          className={`${tabBase} ${active === locale ? activeClass : inactiveClass}`}
        >
          {locale === "en" ? "English (EN)" : "中文 (ZH)"}
        </button>
      ))}
    </div>
  );
}