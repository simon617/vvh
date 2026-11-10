import ContentWithSidebar from "@/components/layout/ContentWithSidebar";
import { getPageData } from "@/lib/pages";
import { buildPageMetadata } from "@/lib/metadata";
import type { Locale } from "@/lib/navigation";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const data = await getPageData("corporate-details", locale as Locale);
  return data ? buildPageMetadata(data, locale as Locale) : {};
}

export default async function CorporateDetailsPage({ params }: Props) {
  // Next.js 15: params is async; ContentWithSidebar is async and reads headers().
  return await ContentWithSidebar({
    slug: "corporate-details",
    locale: (await params).locale as Locale,
  });
}
