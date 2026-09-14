import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email";

/**
 * POST /api/contact/send — public endpoint for the contact form (D7: email-only,
 * no DB storage). Deliberately NOT behind getSession().
 *
 * Spam protection = honeypot (TD-24): a hidden `company_website` field filled by
 * bots causes a silent 200 with nothing sent. On success → {ok:true}; validation
 * failure → 400; SMTP failure → 502 with a generic message (never leak SMTP details).
 */

const HONEYPOT_FIELD = "company_website";

const REQUIRED_FIELDS = ["name", "subject", "email", "message"] as const;

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Honeypot: a bot filling the hidden field is silently "accepted".
  if (str(body[HONEYPOT_FIELD]) !== "") {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const errors: string[] = [];
  for (const field of REQUIRED_FIELDS) {
    if (str(body[field]) === "") {
      errors.push(`${field} is required`);
    }
  }
  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
  }

  try {
    await sendContactEmail({
      name: str(body.name),
      subject: str(body.subject),
      email: str(body.email),
      message: str(body.message),
    });
  } catch (error) {
    // Log server-side only — never expose SMTP details to the client.
    console.error("contact/send failed:", (error as Error).message);
    return NextResponse.json(
      { error: "Message could not be sent. Please try again later." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}