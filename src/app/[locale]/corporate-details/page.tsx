import ContentWithSidebar from "@/components/layout/ContentWithSidebar";
import { getPageData } from "@/lib/pages";
import type { Locale } from "@/lib/navigation";

interface Props {
  params: { locale: string };
}

export function generateMetadata({ params }: Props) {
  const data = getPageData("corporate-details", params.locale as Locale);
  return { title: data?.metaTitle, description: data?.metaDescription };
}

export default function CorporateDetailsPage({ params }: Props) {
  return (
    <ContentWithSidebar
      slug="corporate-details"
      locale={params.locale as Locale}
    />
  );
}
