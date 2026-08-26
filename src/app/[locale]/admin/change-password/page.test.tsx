import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminChangePasswordPage from "./page";
import { renderWithLocale } from "@/test/utils";

vi.mock("next/navigation", () => ({
  useParams: () => ({ locale: "en" }),
}));

describe("Admin change-password page (/admin/change-password)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renders current, new and confirm password fields", () => {
    renderWithLocale(<AdminChangePasswordPage />);
    expect(screen.getByLabelText("Current password")).toBeTruthy();
    expect(screen.getByLabelText("New password")).toBeTruthy();
    expect(screen.getByLabelText("Confirm new password")).toBeTruthy();
  });

  it("shows an inline error when the new passwords do not match", async () => {
    renderWithLocale(<AdminChangePasswordPage />);

    fireEvent.change(screen.getByLabelText("Current password"), {
      target: { value: "old-pass-123" },
    });
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "new-pass-123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "different-123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Change Password" }));

    expect(
      await screen.findByText("New passwords do not match")
    ).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("shows an inline error when the new password is too short", async () => {
    renderWithLocale(<AdminChangePasswordPage />);

    fireEvent.change(screen.getByLabelText("Current password"), {
      target: { value: "old-pass-123" },
    });
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "short" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "short" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Change Password" }));

    expect(
      await screen.findByText("New password must be at least 8 characters")
    ).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("posts to /api/auth/change-password and shows success on ok", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    renderWithLocale(<AdminChangePasswordPage />);

    fireEvent.change(screen.getByLabelText("Current password"), {
      target: { value: "old-pass-123" },
    });
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "new-pass-123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "new-pass-123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Change Password" }));

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        "/api/auth/change-password",
        expect.objectContaining({ method: "POST" })
      )
    );

    const body = JSON.parse(
      (vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string
    );
    expect(body.currentPassword).toBe("old-pass-123");
    expect(body.newPassword).toBe("new-pass-123");
    expect(body.confirmPassword).toBe("new-pass-123");

    expect(
      await screen.findByText("Password changed successfully")
    ).toBeTruthy();
  });

  it("renders localized labels in Chinese", () => {
    renderWithLocale(<AdminChangePasswordPage />, "zh");
    expect(screen.getByLabelText("目前密碼")).toBeTruthy();
    expect(screen.getByLabelText("新密碼")).toBeTruthy();
    expect(screen.getByLabelText("確認新密碼")).toBeTruthy();
    expect(screen.getByRole("button", { name: "更改密碼" })).toBeTruthy();
  });
});
