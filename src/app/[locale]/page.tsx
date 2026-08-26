import { notFound } from "next/navigation";
import HomeTemplate from "@/components/layout/HomeTemplate";
import { getPageData } from "@/lib/pages";
import type { Locale } from "@/lib/navigation";

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props) {
  const data = await getPageData("home", params.locale as Locale);
  return { title: data?.metaTitle, description: data?.metaDescription };
}

export default async function HomePage({ params }: Props) {
  const locale = params.locale as Locale;
  const pageData = await getPageData("home", locale);
  if (!pageData) notFound();
  return <HomeTemplate pageData={pageData} />;
}
