import nodemailer from "nodemailer";

/**
 * SMTP email sending for the public contact form (Phase 3, deliverables 3.8/3.9).
 *
 * Decision D10: the company SMTP server uses IP-based authentication, so no
 * credentials are required. If SMTP_USER / SMTP_PASS are configured they are
 * used as a fallback.
 *
 * Env:
 *   SMTP_HOST        (required) company SMTP server IP / host
 *   SMTP_PORT        (default 25)
 *   SMTP_RECIPIENT   (required) inbox for contact-form emails
 *   SMTP_USER / SMTP_PASS  (optional) credential fallback
 */

export interface ContactEmailPayload {
  name: string;
  subject: string;
  email: string;
  message: string;
}

/** Transport options for IP-based auth, with an optional credential fallback. */
export function transportOptions() {
  const host = process.env.SMTP_HOST || "";
  const port = Number(process.env.SMTP_PORT ?? 25);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const options: {
    host: string;
    port: number;
    secure: boolean;
    ignoreTLS: boolean;
    auth?: { user: string; pass: string };
  } = {
    host,
    port,
    secure: false, // port 25, no STARTTLS requirement (D10)
    ignoreTLS: true, // IP-based auth, no TLS (D10)
  };
  if (user && pass) {
    options.auth = { user, pass };
  }
  return options;
}

/** Send a contact-form email via Nodemailer. Plain text body (TD-23). */
export async function sendContactEmail(payload: ContactEmailPayload): Promise<void> {
  const recipient = process.env.SMTP_RECIPIENT;
  if (!recipient) {
    throw new Error("SMTP_RECIPIENT is not configured");
  }

  const transporter = nodemailer.createTransport(transportOptions());

  await transporter.sendMail({
    from: payload.email,
    to: recipient,
    subject: `[VVH Contact] ${payload.subject}`,
    text: [
      `Name: ${payload.name}`,
      `Subject: ${payload.subject}`,
      `Email: ${payload.email}`,
      "",
      `Message:`,
      payload.message,
    ].join("\n"),
  });
}