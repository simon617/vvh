import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, PUT } from "./route";

const { mockGetSession, mockGetSiteSettings, mockSetSiteSetting } =
  vi.hoisted(() => ({
    mockGetSession: vi.fn(),
    mockGetSiteSettings: vi.fn(),
    mockSetSiteSetting: vi.fn(),
  }));

vi.mock("@/lib/auth", () => ({ getSession: mockGetSession }));
vi.mock("@/lib/site-settings", () => ({
  getSiteSettings: mockGetSiteSettings,
  setSiteSetting: mockSetSiteSetting,
}));

const ADMIN_SESSION = { userId: 1, username: "admin", role: "admin" };

function makeRequest(body?: unknown) {
  if (body === undefined) {
    return new NextRequest("http://localhost/api/settings");
  }
  return new NextRequest("http://localhost/api/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/settings", () => {
  beforeEach(() => {
    mockGetSession.mockReset();
    mockGetSiteSettings.mockReset();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    expect((await GET()).status).toBe(401);
  });

  it("returns settings keyed by name", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    mockGetSiteSettings.mockResolvedValue([
      { key: "site_name", value: "Vision Values" },
      { key: "ga4_tracking_id", value: "G-ABC123" },
    ]);

    const res = await GET();
    const body = await res.json();
    expect(body.settings).toEqual({
      site_name: "Vision Values",
      ga4_tracking_id: "G-ABC123",
    });
  });
});

describe("PUT /api/settings", () => {
  beforeEach(() => {
    mockGetSession.mockReset();
    mockGetSiteSettings.mockReset();
    mockSetSiteSetting.mockReset();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    expect((await PUT(makeRequest({ site_name: "x" }))).status).toBe(401);
  });

  it("returns 400 for a non-object body", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    expect((await PUT(makeRequest(null))).status).toBe(400);
  });

  it("persists allowed keys and returns the updated settings", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    mockSetSiteSetting.mockResolvedValue(undefined);
    mockGetSiteSettings.mockResolvedValue([
      { key: "site_name", value: "New Name" },
    ]);

    const res = await PUT(makeRequest({ site_name: "New Name" }));

    expect(mockSetSiteSetting).toHaveBeenCalledWith("site_name", "New Name");
    expect(mockSetSiteSetting).not.toHaveBeenCalledWith(
      "ga4_tracking_id",
      expect.anything()
    );
    const body = await res.json();
    expect(body.settings.site_name).toBe("New Name");
  });

  it("rejects a non-string value", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    expect((await PUT(makeRequest({ ga4_tracking_id: 123 }))).status).toBe(400);
    expect(mockSetSiteSetting).not.toHaveBeenCalled();
  });
});