import TemplateShell from "@/components/layout/TemplateShell";
import { getAnnouncementsUrl } from "@/lib/announcements";
import { getPageData } from "@/lib/pages";
import type { Locale } from "@/lib/navigation";

interface Props {
  params: { locale: string };
}

export function generateMetadata({ params }: Props) {
  const data = getPageData("announcements", params.locale as Locale);
  return { title: data?.metaTitle, description: data?.metaDescription };
}

export default function AnnouncementsPage({ params }: Props) {
  const locale = params.locale as Locale;
  const data = getPageData("announcements", locale);
  if (!data) return null;

  return (
    <TemplateShell title={data.title} locale={locale}>
      <div className="bg-white rounded-lg shadow-md p-4">
        <iframe
          src={getAnnouncementsUrl(locale)}
          title={data.title}
          className="w-full min-h-[640px] border-0"
          loading="lazy"
        />
      </div>
    </TemplateShell>
  );
}
