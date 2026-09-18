import { afterEach, describe, expect, it } from "vitest";
import { GET } from "./route";

const SITE_URL = "https://www.visionvalues.com.hk";

describe("GET /robots.txt", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it("returns plain-text robots.txt with the absolute sitemap URL", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = SITE_URL;
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/plain");
    const body = await res.text();
    expect(body).toMatch(/^User-agent: \*\nAllow: \/\n\nSitemap: https:\/\/www\.visionvalues\.com\.hk\/sitemap\.xml\n$/m);
  });

  it("still serves robots.txt when the site URL is unset", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("Sitemap: /sitemap.xml");
  });
});