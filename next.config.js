/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

/**
 * PRD §11 / URL-02 / TD-26 — 301 redirects from the old ASP site to the new
 * clean URLs.
 *
 * Implemented in `next.config.js` (NOT middleware): the next-intl middleware
 * early-skips any path containing a `.` (e.g. `.asp`, `.php`), so old URLs
 * would never reach a middleware-based redirect. `statusCode: 301` is used
 * instead of `permanent: true` (which Next.js maps to 308), per the PRD's
 * "301" requirement.
 *
 * Root `/` → `/en/` (deliverable 4.2 / URL-03) is intentionally NOT listed
 * here: next-intl's middleware (`localePrefix: "always"`) already performs it.
 */
const SITE_REDIRECTS = [
  // English old pages (PRD §11).
  { source: "/eng/corp_board.asp", destination: "/en/board-of-directors" },
  { source: "/eng/corp_details.asp", destination: "/en/corporate-details" },
  { source: "/eng/corp_governance.asp", destination: "/en/corporate-governance" },
  { source: "/eng/major.asp", destination: "/en/announcements" },
  { source: "/eng/financial_report.asp", destination: "/en/financial-reports" },
  { source: "/eng/environment.asp", destination: "/en/esg-reports" },
  { source: "/eng/lost_share_cert.asp", destination: "/en/lost-share-certificates" },
  { source: "/eng/communication.asp", destination: "/en/corporate-communications" },
  { source: "/eng/contact_us.php", destination: "/en/contact" },
  // Chinese mirror (PRD §11: "/chi/* → /zh/* corresponding pages").
  { source: "/chi/corp_board.asp", destination: "/zh/board-of-directors" },
  { source: "/chi/corp_details.asp", destination: "/zh/corporate-details" },
  { source: "/chi/corp_governance.asp", destination: "/zh/corporate-governance" },
  { source: "/chi/major.asp", destination: "/zh/announcements" },
  { source: "/chi/financial_report.asp", destination: "/zh/financial-reports" },
  { source: "/chi/environment.asp", destination: "/zh/esg-reports" },
  { source: "/chi/lost_share_cert.asp", destination: "/zh/lost-share-certificates" },
  { source: "/chi/communication.asp", destination: "/zh/corporate-communications" },
  { source: "/chi/contact_us.php", destination: "/zh/contact" },
];

/** Catch-alls for any unmatched old /eng|chi/ path (fall back to locale home). */
const CATCH_ALL_REDIRECTS = [
  { source: "/eng/:path*", destination: "/en/" },
  { source: "/chi/:path*", destination: "/zh/" },
];

const nextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [...SITE_REDIRECTS, ...CATCH_ALL_REDIRECTS].map(
      ({ source, destination }) => ({ source, destination, statusCode: 301 })
    );
  },
};

module.exports = withNextIntl(nextConfig);