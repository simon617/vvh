import { notFound } from "next/navigation";
import TemplateShell from "@/components/layout/TemplateShell";
import DirectorCards from "@/components/layout/DirectorCards";
import { getDirectors } from "@/lib/directors";
import { getPageData } from "@/lib/pages";
import type { Locale } from "@/lib/navigation";

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props) {
  const data = await getPageData("board-of-directors", params.locale as Locale);
  return { title: data?.metaTitle, description: data?.metaDescription };
}

export default async function BoardOfDirectorsPage({ params }: Props) {
  const locale = params.locale as Locale;
  const data = await getPageData("board-of-directors", locale);
  if (!data) notFound();

  return (
    <TemplateShell
      title={data.title}
      locale={locale}
      heroImage={data.heroImage}
    >
      <div className="bg-white rounded-lg shadow-md p-6">
        <DirectorCards directors={getDirectors(locale)} />
      </div>
    </TemplateShell>
  );
}

