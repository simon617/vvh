import { headers } from "next/headers";
import Link from "next/link";
import enMessages from "../../../messages/en.json";
import zhMessages from "../../../messages/zh.json";

const toLocale = (value: string | null | undefined): "en" | "zh" =>
  value === "zh" ? "zh" : "en";

interface Props {
  // Next.js 16 can render this boundary WITHOUT route props — e.g. the dev error
  // overlay, or a 404 that never matched the `[locale]` segment. In those render
  // paths `params` resolves to `undefined`, so it (and `locale`) must be optional
  // to avoid a TypeError on the destructure below.
  params?: Promise<{ locale?: string } | undefined>;
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
  // Next.js 15+: params and headers() are async. Prefer the middleware-set
  // x-locale header and fall back to the route param. The route param is read
  // defensively — when the boundary is rendered without route props (see Props)
  // `params` is undefined, and `headers()` may also be unavailable outside a
  // request scope, so both are guarded instead of throwing.
  let locale: "en" | "zh" = "en";
  try {
    const paramLocale = (await params)?.locale;
    locale = toLocale((await headers()).get("x-locale") ?? paramLocale);
  } catch {
    // No request/route context (e.g. the dev overlay renders this boundary):
    // fall back to the default locale so the 404 still renders.
  }
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