import ContentWithSidebar from "@/components/layout/ContentWithSidebar";
import { getPageData } from "@/lib/pages";
import type { Locale } from "@/lib/navigation";

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props) {
  const data = await getPageData("corporate-details", params.locale as Locale);
  return { title: data?.metaTitle, description: data?.metaDescription };
}

export default async function CorporateDetailsPage({ params }: Props) {
  return (
    await ContentWithSidebar({
      slug: "corporate-details",
      locale: params.locale as Locale,
    })
  );
}
