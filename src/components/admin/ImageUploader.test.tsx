import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ImageUploader, { validateImageFileClient } from "./ImageUploader";

describe("validateImageFileClient", () => {
  it("accepts supported image extensions within the size limit", () => {
    expect(validateImageFileClient("hero.jpg", 100)).toEqual({ ok: true });
    expect(validateImageFileClient("hero.PNG", 100)).toEqual({ ok: true });
    expect(validateImageFileClient("logo.svg", 100)).toEqual({ ok: true });
  });

  it("rejects non-image files and oversized files with a message", () => {
    expect(validateImageFileClient("evil.exe", 100)).toEqual({
      ok: false,
      error: expect.stringMatching(/image/i) as string,
    });
    expect(validateImageFileClient("big.png", 5242881)).toEqual({
      ok: false,
      error: expect.stringMatching(/5MB/) as string,
    });
  });
});

describe("ImageUploader", () => {
  const fileInputSelector = '[data-testid="image-upload-input"]';

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renders the upload button and hidden file input", () => {
    render(<ImageUploader onChange={() => {}} />);
    expect(screen.getByText("Upload image")).toBeTruthy();
    expect(document.querySelector(fileInputSelector)).toBeTruthy();
  });

  it("shows the current image as a preview when provided", () => {
    render(<ImageUploader current="/uploads/images/hero.png" onChange={() => {}} />);
    const img = document.querySelector("img");
    expect(img?.getAttribute("src")).toBe("/uploads/images/hero.png");
  });

  it("rejects an invalid file client-side without calling fetch", async () => {
    const upload = vi.fn();
    render(<ImageUploader onChange={upload} />);

    const input = document.querySelector(fileInputSelector) as HTMLInputElement;
    const file = new File(["MZ"], "evil.exe", { type: "application/x-msdownload" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText(/only image files/i)).toBeTruthy();
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
    expect(upload).not.toHaveBeenCalled();
  });

  it("uploads a valid file and reports the returned path", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ path: "/uploads/images/123-hero.png" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    const upload = vi.fn();
    render(<ImageUploader onChange={upload} />);

    const input = document.querySelector(fileInputSelector) as HTMLInputElement;
    const file = new File(["png-bytes"], "hero.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(upload).toHaveBeenCalledWith("/uploads/images/123-hero.png"));
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      "/api/upload/image",
      expect.objectContaining({ method: "POST" })
    );
  });
});