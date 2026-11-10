import { notFound } from "next/navigation";
import HomeTemplate from "@/components/layout/HomeTemplate";
import { getPageData, getLatestReports } from "@/lib/pages";
import { buildPageMetadata } from "@/lib/metadata";
import type { Locale } from "@/lib/navigation";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const data = await getPageData("home", locale as Locale);
  return data ? buildPageMetadata(data, locale as Locale) : {};
}

export default async function HomePage({ params }: Props) {
  const locale = (await params).locale as Locale;
  const pageData = await getPageData("home", locale);
  if (!pageData) notFound();
  const latestReports = await getLatestReports(locale);
  return (
    <HomeTemplate
      pageData={pageData}
      locale={locale}
      latestReports={latestReports}
    />
  );
}
