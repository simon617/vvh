import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config.js";

/** Redirect config entry as produced by `next.config.js redirects()`. */
type Redirect = { source: string; destination: string; statusCode: number };

const EXPECTED_MAPPING: Record<string, string> = {
  // PRD §11 — English old pages.
  "/eng/corp_board.asp": "/en/board-of-directors",
  "/eng/corp_details.asp": "/en/corporate-details",
  "/eng/corp_governance.asp": "/en/corporate-governance",
  "/eng/major.asp": "/en/announcements",
  "/eng/financial_report.asp": "/en/financial-reports",
  "/eng/environment.asp": "/en/esg-reports",
  "/eng/lost_share_cert.asp": "/en/lost-share-certificates",
  "/eng/communication.asp": "/en/corporate-communications",
  "/eng/contact_us.php": "/en/contact",
  // PRD §11 — Chinese mirror (`/chi/* → /zh/*`).
  "/chi/corp_board.asp": "/zh/board-of-directors",
  "/chi/corp_details.asp": "/zh/corporate-details",
  "/chi/corp_governance.asp": "/zh/corporate-governance",
  "/chi/major.asp": "/zh/announcements",
  "/chi/financial_report.asp": "/zh/financial-reports",
  "/chi/environment.asp": "/zh/esg-reports",
  "/chi/lost_share_cert.asp": "/zh/lost-share-certificates",
  "/chi/communication.asp": "/zh/corporate-communications",
  "/chi/contact_us.php": "/zh/contact",
};

describe("next.config redirects (PRD §11 / URL-02 / TD-26)", () => {
  it("maps every old ASP/PHP URL to the correct new clean URL", async () => {
    const redirects = (await nextConfig.redirects()) as Redirect[];
    const bySource = new Map(redirects.map((r) => [r.source, r.destination]));
    for (const [source, destination] of Object.entries(EXPECTED_MAPPING)) {
      expect(bySource.get(source), `no redirect for ${source}`).toBe(destination);
    }
  });

  it("serves every redirect as status 301 and only rewrites old /eng|/chi paths", async () => {
    const redirects = (await nextConfig.redirects()) as Redirect[];
    expect(redirects.length).toBeGreaterThan(0);
    for (const redirect of redirects) {
      expect(redirect.statusCode).toBe(301);
      expect(
        redirect.source.startsWith("/eng") || redirect.source.startsWith("/chi"),
        `unexpected redirect source ${redirect.source}`
      ).toBe(true);
      expect(
        redirect.destination.startsWith("/en/") ||
          redirect.destination.startsWith("/zh/"),
        `unexpected redirect destination ${redirect.destination}`
      ).toBe(true);
    }
  });

  it("provides catch-alls for unmatched old paths (fall back to locale home)", async () => {
    const redirects = (await nextConfig.redirects()) as Redirect[];
    expect(redirects).toContainEqual(
      expect.objectContaining({ source: "/eng/:path*", destination: "/en/" })
    );
    expect(redirects).toContainEqual(
      expect.objectContaining({ source: "/chi/:path*", destination: "/zh/" })
    );
  });

  it("does not shadow new locale routes or the root path (4.2)", async () => {
    const redirects = (await nextConfig.redirects()) as Redirect[];
    for (const redirect of redirects) {
      expect(redirect.source.startsWith("/en/")).toBe(false);
      expect(redirect.source.startsWith("/zh/")).toBe(false);
    }
    // Root `/` → `/en/` is handled by the next-intl middleware, not config.
    expect(redirects.some((r) => r.source === "/")).toBe(false);
  });
});