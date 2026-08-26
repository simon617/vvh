import { headers } from "next/headers";
import type { ReactNode } from "react";
import Breadcrumb from "./Breadcrumb";
import type { Locale } from "@/lib/navigation";

interface TemplateShellProps {
  title: string;
  locale: Locale;
  heroImage?: string;
  children: ReactNode;
}

/**
 * Shared shell for inner-page templates: hero/header image area + breadcrumb
 * + content slot. The left sidebar is provided by the [locale] layout.
 */
export default function TemplateShell({
  title,
  locale,
  heroImage,
  children,
}: TemplateShellProps) {
  const pathname = headers().get("x-pathname") || `/${locale}`;

  return (
    <div>
      {heroImage ? (
        <div className="mb-6 overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt={title}
            className="w-full max-h-72 object-cover"
            data-testid="hero-image"
          />
        </div>
      ) : (
        <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-lg p-8 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{title}</h1>
        </div>
      )}

      <Breadcrumb pathname={pathname} locale={locale} />

      {children}
    </div>
  );
}

