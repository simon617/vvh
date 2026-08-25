import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SettingsForm from "./SettingsForm";
import { renderWithLocale } from "@/test/utils";

describe("SettingsForm", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the site name, GA4 and logo fields", () => {
    renderWithLocale(
      <SettingsForm
        initial={{ site_name: "Vision Values", ga4_tracking_id: "G-ABC" }}
      />
    );

    expect(screen.getByDisplayValue("Vision Values")).toBeTruthy();
    expect(screen.getByDisplayValue("G-ABC")).toBeTruthy();
    expect(screen.getByText(/Upload logo/i)).toBeTruthy();
  });

  it("saves settings via PUT /api/settings", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ settings: {} }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    renderWithLocale(
      <SettingsForm initial={{ site_name: "", ga4_tracking_id: "" }} />
    );

    fireEvent.change(screen.getByLabelText("Site name"), {
      target: { value: "New Name" },
    });
    fireEvent.click(screen.getByText("Save settings"));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/settings");
    expect((init as RequestInit).method).toBe("PUT");
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.site_name).toBe("New Name");
  });
});