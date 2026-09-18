import { describe, expect, it } from "vitest";
import { buildRobotsTxt } from "./robots";

const SITE_URL = "https://www.visionvalues.com.hk";

describe("buildRobotsTxt (deliverable 4.5)", () => {
  it("allows all crawlers and points at the absolute sitemap URL", () => {
    const body = buildRobotsTxt(SITE_URL);
    expect(body).toContain("User-agent: *");
    expect(body).toContain("Allow: /");
    expect(body).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });

  it("normalises a trailing-slash site URL", () => {
    const body = buildRobotsTxt("https://www.visionvalues.com.hk/");
    expect(body).toContain("Sitemap: https://www.visionvalues.com.hk/sitemap.xml");
  });
});