import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockCreateTransport, mockSendMail } = vi.hoisted(() => ({
  mockCreateTransport: vi.fn(),
  mockSendMail: vi.fn(),
}));

vi.mock("nodemailer", () => ({
  default: { createTransport: mockCreateTransport },
  createTransport: mockCreateTransport,
}));

import { sendContactEmail } from "./email";

describe("sendContactEmail", () => {
  beforeEach(() => {
    process.env.SMTP_HOST = "192.168.0.10";
    process.env.SMTP_PORT = "25";
    process.env.SMTP_RECIPIENT = "investor@visionvalues.com.hk";
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    mockCreateTransport.mockReset().mockReturnValue({ sendMail: mockSendMail });
    mockSendMail.mockReset().mockResolvedValue(true);
  });

  afterEach(() => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_RECIPIENT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
  });

  const payload = {
    name: "Ada Wong",
    subject: "Website enquiry",
    email: "ada@example.com",
    message: "Please contact me about your services.",
  };

  it("sends a plain-text email to SMTP_RECIPIENT with all four fields", async () => {
    await sendContactEmail(payload);

    expect(mockCreateTransport).toHaveBeenCalledWith({
      host: "192.168.0.10",
      port: 25,
      secure: false,
      ignoreTLS: true,
    });
    expect(mockSendMail).toHaveBeenCalledTimes(1);

    const [mail] = mockSendMail.mock.calls[0];
    expect(mail.to).toBe("investor@visionvalues.com.hk");
    expect(mail.from).toBe("ada@example.com");
    expect(mail.subject).toBe("[VVH Contact] Website enquiry");
    expect(mail.text).toContain("Ada Wong");
    expect(mail.text).toContain("Website enquiry");
    expect(mail.text).toContain("ada@example.com");
    expect(mail.text).toContain("Please contact me about your services.");
  });

  it("uses credentials when SMTP_USER and SMTP_PASS are configured", async () => {
    process.env.SMTP_USER = "cms";
    process.env.SMTP_PASS = "secret";

    await sendContactEmail(payload);

    expect(mockCreateTransport).toHaveBeenCalledWith({
      host: "192.168.0.10",
      port: 25,
      secure: false,
      ignoreTLS: true,
      auth: { user: "cms", pass: "secret" },
    });
  });

  it("throws when SMTP_RECIPIENT is not configured", async () => {
    delete process.env.SMTP_RECIPIENT;

    await expect(sendContactEmail(payload)).rejects.toThrow(/SMTP_RECIPIENT/);
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it("propagates SMTP errors", async () => {
    mockSendMail.mockRejectedValue(new Error("connection refused"));

    await expect(sendContactEmail(payload)).rejects.toThrow(/connection refused/);
  });
});