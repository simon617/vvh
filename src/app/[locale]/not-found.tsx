import { headers } from "next/headers";
import Link from "next/link";
import enMessages from "../../../messages/en.json";
import zhMessages from "../../../messages/zh.json";

const toLocale = (value: string | null | undefined): "en" | "zh" =>
  value === "zh" ? "zh" : "en";

interface Props {
  params: Promise<{ locale: string }>;
}

type NotFoundMessages = {
  title: string;
  heading: string;
  message: string;
  backHome: string;
};

/**
 * Localized 404 page (deliverable 4.7 / WEB-08).
 *
 * Renders inside the [locale]/layout so the site header/sidebar/footer chrome
 * is present, and offers a Back-to-Home link in the current locale. App Router
 * returns HTTP 404 automatically for this special `not-found` segment.
 */
export default async function NotFound({ params }: Props) {
  // Next.js 15: params and headers() are async. Prefer the middleware-set
  // x-locale header and fall back to the route param.
  const { locale: paramLocale } = await params;
  const locale = toLocale((await headers()).get("x-locale") ?? paramLocale);
  const messages: NotFoundMessages =
    locale === "zh" ? zhMessages.notFound : enMessages.notFound;

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">
          {messages.title}
        </h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          {messages.heading}
        </h2>
        <p className="text-gray-500 mb-8">{messages.message}</p>
        <Link href={`/${locale}`} className="btn-primary">
          {messages.backHome}
        </Link>
      </div>
    </div>
  );
}