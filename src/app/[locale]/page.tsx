import HomeTemplate from "@/components/layout/HomeTemplate";
import { getPageData } from "@/lib/pages";
import type { Locale } from "@/lib/navigation";

interface Props {
  params: { locale: string };
}

export function generateMetadata({ params }: Props) {
  const data = getPageData("home", params.locale as Locale);
  return { title: data?.metaTitle, description: data?.metaDescription };
}

export default function HomePage({ params }: Props) {
  const locale = params.locale as Locale;
  const pageData = getPageData("home", locale);
  if (!pageData) return null;
  return <HomeTemplate pageData={pageData} />;
}