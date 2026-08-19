import { describe, expect, it } from "vitest";
import { ANNOUNCEMENT_IFRAME_URLS, getAnnouncementsUrl } from "./announcements";

describe("announcements data layer", () => {
  it("returns the en Datalink announcement page", () => {
    expect(getAnnouncementsUrl("en")).toBe(
      "https://datalink.talesis.com/document/c00640/Announcement_new"
    );
  });

  it("returns the zh Datalink announcement page", () => {
    expect(getAnnouncementsUrl("zh")).toBe(
      "https://datalink.talesis.com/document/c00640/Chinese/Announcement_2D_Chineselist_new"
    );
  });

  it("exposes an iframe url for every locale", () => {
    expect(ANNOUNCEMENT_IFRAME_URLS.en).toContain("Announcement_new");
    expect(ANNOUNCEMENT_IFRAME_URLS.zh).toContain("Chinese");
  });
});
