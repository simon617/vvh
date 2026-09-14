import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

const { mockSendContactEmail } = vi.hoisted(() => ({
  mockSendContactEmail: vi.fn(),
}));

vi.mock("@/lib/email", () => ({ sendContactEmail: mockSendContactEmail }));

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/contact/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const VALID_BODY = {
  name: "Ada Wong",
  subject: "Website enquiry",
  email: "ada@example.com",
  message: "Please contact me.",
};

describe("POST /api/contact/send", () => {
  beforeEach(() => {
    mockSendContactEmail.mockReset();
  });

  it("is public: does not require a session", async () => {
    mockSendContactEmail.mockResolvedValue(undefined);
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(200);
    expect(mockSendContactEmail).toHaveBeenCalledWith(VALID_BODY);
  });

  it("returns ok on a valid submission", async () => {
    mockSendContactEmail.mockResolvedValue(undefined);
    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json();
    expect(body).toEqual({ ok: true });
  });

  it("returns 400 and does NOT send when a required field is missing", async () => {
    const res = await POST(
      makeRequest({ name: "Ada", subject: "", email: "ada@example.com", message: "hi" })
    );
    expect(res.status).toBe(400);
    expect(mockSendContactEmail).not.toHaveBeenCalled();
  });

  it("returns 400 for a non-JSON body", async () => {
    const req = new NextRequest("http://localhost/api/contact/send", {
      method: "POST",
      body: "not-json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(mockSendContactEmail).not.toHaveBeenCalled();
  });

  it("silently accepts (200) without sending when the honeypot is filled", async () => {
    const spam = { ...VALID_BODY, company_website: "http://spam.example" };
    const res = await POST(makeRequest(spam));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true });
    expect(mockSendContactEmail).not.toHaveBeenCalled();
  });

  it("returns 502 with a generic message when SMTP fails", async () => {
    mockSendContactEmail.mockRejectedValue(new Error("connection refused"));
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toMatch(/could not be sent/i);
    expect(JSON.stringify(body)).not.toMatch(/connection refused/);
  });
});