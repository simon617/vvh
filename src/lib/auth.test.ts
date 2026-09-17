import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";
import { changePassword, requireSession, signToken } from "@/lib/auth";

const { mockAdminUser, mockCookies } = vi.hoisted(() => ({
  mockAdminUser: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  mockCookies: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: mockCookies }));

vi.mock("@/lib/prisma", () => ({
  prisma: { adminUser: mockAdminUser },
}));

async function hashIt(value: string): Promise<string> {
  return bcrypt.hash(value, 12);
}

describe("changePassword(userId, currentPassword, newPassword)", () => {
  beforeEach(() => {
    mockAdminUser.findUnique.mockReset();
    mockAdminUser.update.mockReset();
  });

  it("throws when the user does not exist", async () => {
    mockAdminUser.findUnique.mockResolvedValue(null);
    await expect(changePassword(99, "oldpass1", "newpass1")).rejects.toThrow(
      /not found/i
    );
    expect(mockAdminUser.update).not.toHaveBeenCalled();
  });

  it("rejects when the current password is incorrect", async () => {
    const stored = await hashIt("oldpass1");
    mockAdminUser.findUnique.mockResolvedValue({ id: 1, password: stored });
    await expect(changePassword(1, "wrongpass", "newpass1")).rejects.toThrow(
      /current password/i
    );
    expect(mockAdminUser.update).not.toHaveBeenCalled();
  });

  it("rejects a new password shorter than 8 characters", async () => {
    const stored = await hashIt("oldpass1");
    mockAdminUser.findUnique.mockResolvedValue({ id: 1, password: stored });
    await expect(changePassword(1, "oldpass1", "short")).rejects.toThrow(
      /8 characters/i
    );
    expect(mockAdminUser.update).not.toHaveBeenCalled();
  });

  it("stores a new bcrypt hash on success", async () => {
    const stored = await hashIt("oldpass1");
    mockAdminUser.findUnique.mockResolvedValue({ id: 1, password: stored });
    let storedHash = "";
    mockAdminUser.update.mockImplementation(
      async ({ data }: { data: { password: string } }) => {
        storedHash = data.password;
        return { id: 1, password: storedHash };
      }
    );

    await changePassword(1, "oldpass1", "newpass1");

    expect(mockAdminUser.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({ password: expect.any(String) }),
    });
    // The stored hash must verify against the new password, not the old.
    expect(storedHash).not.toBe(stored);
    expect(await bcrypt.compare("newpass1", storedHash)).toBe(true);
    expect(await bcrypt.compare("oldpass1", storedHash)).toBe(false);
  }, 15000);
});

describe("requireSession", () => {
  beforeEach(() => {
    mockCookies.mockReset();
  });

  it("returns a 401 response when there is no session cookie", async () => {
    mockCookies.mockReturnValue({ get: () => undefined });
    const result = await requireSession();
    expect(result.session).toBeNull();
    expect(result.error).not.toBeNull();
    expect(result.error?.status).toBe(401);
    expect(await result.error!.json()).toEqual({ error: "Unauthorized" });
  });

  it("returns the session when a valid cookie is present", async () => {
    const token = signToken({ userId: 1, username: "admin", role: "admin" });
    mockCookies.mockReturnValue({ get: () => ({ value: token }) });
    const result = await requireSession();
    expect(result.error).toBeNull();
    expect(result.session?.userId).toBe(1);
    expect(result.session?.role).toBe("admin");
  });
});