import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSiteSettings, setSiteSetting } from "@/lib/site-settings";

/** Keys the admin settings page is allowed to manage. */
const ALLOWED_SETTINGS = ["site_name", "ga4_tracking_id"] as const;

async function settingsToObject(): Promise<Record<string, string>> {
  const rows = await getSiteSettings();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ settings: await settingsToObject() });
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as unknown;
  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "body must be a JSON object" },
      { status: 400 }
    );
  }

  const input = body as Record<string, unknown>;
  for (const key of ALLOWED_SETTINGS) {
    const value = input[key];
    if (value === undefined) continue;
    if (typeof value !== "string") {
      return NextResponse.json(
        { error: `${key} must be a string` },
        { status: 400 }
      );
    }
    await setSiteSetting(key, value);
  }

  return NextResponse.json({ settings: await settingsToObject() });
}