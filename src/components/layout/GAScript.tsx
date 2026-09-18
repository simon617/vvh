"use client";

import Script from "next/script";

/**
 * GA4 analytics script (deliverable 4.3 / D13 / WEB-09).
 *
 * Renders nothing when no measurement ID is configured. The tracker loads with
 * `strategy="afterInteractive"` so it does not block LCP, and the init snippet
 * is included as a second inline Script (standard gtag bootstrap).
 */
export default function GAScript({ measurementId }: { measurementId: string }) {
  if (!measurementId) {
    return null;
  }
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${measurementId}');`}
      </Script>
    </>
  );
}