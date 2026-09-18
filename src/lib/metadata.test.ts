import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildPageMetadata, siteBaseUrl, SITE_NAME } from "./metadata";

const SITE_URL = "https://www.visionvalues.com.hk";

function snapshotEnv() {
  const prev = process.env.NEXT_PUBLIC_SITE_URL;
  return () => {
    if (prev === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = prev;
  };
}

describe("metadata lib (deliverable 4.6 / WEB-11)", () => {
  let restoreEnv: () => void;

  beforeEach(() => {
    restoreEnv = snapshotEnv();
    process.env.NEXT_PUBLIC_SITE_URL = SITE_URL;
  });

  afterEach(() => {
    restoreEnv();
  });

  it("builds Open Graph tags from the CMS SEO fields with a hero image", () => {
    const meta = buildPageMetadata(
      {
        title: "Corporate Governance",
        metaTitle: "Corporate Governance | Vision Values Holdings Limited",
        metaDescription: "Our governance framework",
        heroImage: "/uploads/images/governance.jpg",
      },
      "en"
    );

    expect(meta.title).toBe("Corporate Governance | Vision Values Holdings Limited");
    expect(meta.description).toBe("Our governance framework");
    expect(meta.openGraph?.title).toBe(meta.title);
    expect(meta.openGraph?.description).toBe("Our governance framework");
    expect(meta.openGraph?.images).toEqual([
      { url: `${SITE_URL}/uploads/images/governance.jpg` },
    ]);
    expect(meta.openGraph?.siteName).toBe(SITE_NAME);
    expect(meta.openGraph?.locale).toBe("en_HK");
  });

  it("falls back to the site logo when no hero image is set (TD-29)", () => {
    const meta = buildPageMetadata(
      { title: "Contact", metaTitle: "Contact Us", metaDescription: null },
      "zh"
    );
    expect(meta.openGraph?.images).toEqual([{ url: `${SITE_URL}/logo.svg` }]);
    expect(meta.openGraph?.locale).toBe("zh_HK");
  });

  it("falls back to data.title when metaTitle is unset", () => {
    const meta = buildPageMetadata({ title: "Contact" }, "en");
    expect(meta.title).toBe("Contact");
    expect(meta.description).toBeUndefined();
  });

  it("siteBaseUrl normalises NEXT_PUBLIC_SITE_URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.visionvalues.com.hk/";
    expect(siteBaseUrl()).toBe("https://www.visionvalues.com.hk");
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(siteBaseUrl()).toBe("");
  });
});