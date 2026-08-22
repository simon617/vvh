import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getSiteSetting,
  getSiteSettings,
  setSiteSetting,
} from "@/lib/site-settings";

const { mockSiteSetting } = vi.hoisted(() => ({
  mockSiteSetting: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    upsert: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { siteSetting: mockSiteSetting },
}));

describe("getSiteSetting(key)", () => {
  beforeEach(() => {
    mockSiteSetting.findUnique.mockReset();
  });

  it("returns the value for a global setting (locale = null)", async () => {
    mockSiteSetting.findUnique.mockResolvedValue({
      id: 1,
      key: "ga4_tracking_id",
      value: "G-XXXXXX",
      locale: null,
    });
    expect(await getSiteSetting("ga4_tracking_id")).toBe("G-XXXXXX");
  });

  it("returns null when the setting does not exist", async () => {
    mockSiteSetting.findUnique.mockResolvedValue(null);
    expect(await getSiteSetting("missing")).toBeNull();
  });

  it("ignores locale-scoped rows (returns null)", async () => {
    mockSiteSetting.findUnique.mockResolvedValue({
      id: 2,
      key: "site_name",
      value: "zh-only",
      locale: "zh",
    });
    expect(await getSiteSetting("site_name")).toBeNull();
  });
});

describe("setSiteSetting(key, value)", () => {
  beforeEach(() => {
    mockSiteSetting.upsert.mockReset();
  });

  it("upserts a global setting row (locale = null)", async () => {
    mockSiteSetting.upsert.mockResolvedValue({});
    await setSiteSetting("site_name", "Vision Values");

    expect(mockSiteSetting.upsert).toHaveBeenCalledWith({
      where: { key: "site_name" },
      create: { key: "site_name", value: "Vision Values", locale: null },
      update: { value: "Vision Values", locale: null },
    });
  });
});

describe("getSiteSettings()", () => {
  beforeEach(() => {
    mockSiteSetting.findMany.mockReset();
  });

  it("returns only global settings keyed by name", async () => {
    mockSiteSetting.findMany.mockResolvedValue([
      { id: 1, key: "site_name", value: "VVH", locale: null },
      { id: 2, key: "ga4_tracking_id", value: null, locale: null },
      { id: 3, key: "zh_row", value: "x", locale: "zh" },
    ]);

    const settings = await getSiteSettings();

    expect(settings).toEqual([
      { key: "site_name", value: "VVH" },
      { key: "ga4_tracking_id", value: "" },
    ]);
    expect(mockSiteSetting.findMany).toHaveBeenCalledWith({
      where: { locale: null },
    });
  });
});