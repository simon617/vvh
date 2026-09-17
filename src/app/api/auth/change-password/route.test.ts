import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { POST } from "./route";

const { mockGetSession, mockChangePassword } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockChangePassword: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getSession: mockGetSession,
  changePassword: mockChangePassword,
  requireSession: async () => {
    const session = await mockGetSession();
    return session
      ? { session, error: null }
      : {
          session: null,
          error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        };
  },
}));

const ADMIN_SESSION = { userId: 1, username: "admin", role: "admin" };

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const VALID_BODY = {
  currentPassword: "oldpass1",
  newPassword: "newpass1",
  confirmPassword: "newpass1",
};

describe("POST /api/auth/change-password", () => {
  beforeEach(() => {
    mockGetSession.mockReset();
    mockChangePassword.mockReset();
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(401);
    expect(mockChangePassword).not.toHaveBeenCalled();
  });

  it("returns 400 when the new passwords do not match", async () => {
    const res = await POST(
      makeRequest({
        currentPassword: "oldpass1",
        newPassword: "newpass1",
        confirmPassword: "different1",
      })
    );
    expect(res.status).toBe(400);
    expect(mockChangePassword).not.toHaveBeenCalled();
  });

  it("returns 400 when a field is missing", async () => {
    const res = await POST(
      makeRequest({ currentPassword: "oldpass1", newPassword: "newpass1" })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when the current password is wrong", async () => {
    mockChangePassword.mockRejectedValue(
      new Error("Current password is incorrect")
    );
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/current password/i);
  });

  it("changes the password for the session user on success", async () => {
    mockChangePassword.mockResolvedValue(undefined);
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(200);
    expect(mockChangePassword).toHaveBeenCalledWith(
      1,
      "oldpass1",
      "newpass1"
    );
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});