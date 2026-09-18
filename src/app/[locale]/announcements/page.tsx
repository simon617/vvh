import TemplateShell from "@/components/layout/TemplateShell";
import { getAnnouncementsUrl } from "@/lib/announcements";
import { buildPageMetadata } from "@/lib/metadata";
import type { Locale } from "@/lib/navigation";

interface Props {
  params: { locale: string };
}

/**
 * Announcements — a 3rd-party Datalink iframe page (TD-30 Option A).
 *
 * Intentionally NOT CMS-editable: it has no `placeholders.ts` entry and no
 * `page_contents` row, so it no longer appears under `/admin/pages` (the DB
 * row was removed from `prisma/seed.ts`; `/admin/pages/announcements` 404s).
 * The title/meta below mirror the strings that previously lived in the
 * placeholder so the public page, breadcrumb and SEO behave identically.
 */
const PAGE_INFO: Record<
  Locale,
  { title: string; metaTitle: string; metaDescription: string }
> = {
  en: {
    title: "Announcements & Circulars",
    metaTitle: "Announcements & Circulars | Vision Values Holdings Limited",
    metaDescription: "Announcements and circulars of Vision Values Holdings Limited",
  },
  zh: {
    title: "公告及通函",
    metaTitle: "公告及通函 | 遠見控股有限公司",
    metaDescription: "遠見控股有限公司之公告及通函",
  },
};

const toLocale = (value: string): Locale => (value === "zh" ? "zh" : "en");

export function generateMetadata({ params }: Props) {
  const locale = toLocale(params.locale);
  const info = PAGE_INFO[locale];
  return buildPageMetadata(
    {
      title: info.title,
      metaTitle: info.metaTitle,
      metaDescription: info.metaDescription,
    },
    locale
  );
}

export default function AnnouncementsPage({ params }: Props) {
  const locale = toLocale(params.locale);
  const info = PAGE_INFO[locale];

  return (
    <TemplateShell title={info.title} locale={locale}>
      <div className="bg-white rounded-lg shadow-md p-4">
        <iframe
          src={getAnnouncementsUrl(locale)}
          title={info.title}
          className="w-full min-h-[640px] border-0"
          loading="lazy"
        />
      </div>
    </TemplateShell>
  );
}

