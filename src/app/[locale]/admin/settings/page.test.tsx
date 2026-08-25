import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import AdminSettingsPage from "./page";
import { renderWithLocale } from "@/test/utils";

const { mockGetSiteSetting } = vi.hoisted(() => ({
  mockGetSiteSetting: vi.fn(),
}));

vi.mock("@/lib/site-settings", () => ({
  getSiteSetting: mockGetSiteSetting,
}));

describe("Admin settings page (/admin/settings)", () => {
  it("loads global settings into the form", async () => {
    mockGetSiteSetting.mockImplementation(async (key: string) => {
      if (key === "site_name") return "Vision Values";
      if (key === "ga4_tracking_id") return "G-ABC123";
      return null;
    });

    renderWithLocale(await AdminSettingsPage({ params: { locale: "en" } }));

    expect(screen.getByDisplayValue("Vision Values")).toBeTruthy();
    expect(screen.getByDisplayValue("G-ABC123")).toBeTruthy();
  });

  it("treats missing settings as empty strings", async () => {
    mockGetSiteSetting.mockResolvedValue(null);
    renderWithLocale(await AdminSettingsPage({ params: { locale: "en" } }));

    const siteName = screen.getByLabelText("Site name") as HTMLInputElement;
    const ga4 = screen.getByLabelText("GA4 Tracking ID") as HTMLInputElement;
    expect(siteName.value).toBe("");
    expect(ga4.value).toBe("");
  });
});