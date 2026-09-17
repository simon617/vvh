import { NextRequest, NextResponse } from "next/server";
import { changePassword, requireSession } from "@/lib/auth";

/**
 * POST /api/auth/change-password — in-app password change for the logged-in
 * admin. Verifies the current password before writing a new bcrypt hash.
 */
export async function POST(request: NextRequest) {
  const { session, error } = await requireSession();
  if (error) {
    return error;
  }

  const body = (await request.json().catch(() => null)) as {
    currentPassword?: unknown;
    newPassword?: unknown;
    confirmPassword?: unknown;
  } | null;

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { currentPassword, newPassword, confirmPassword } = body;
  if (
    typeof currentPassword !== "string" ||
    typeof newPassword !== "string" ||
    typeof confirmPassword !== "string"
  ) {
    return NextResponse.json(
      { error: "currentPassword, newPassword and confirmPassword are required" },
      { status: 400 }
    );
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json(
      { error: "New passwords do not match" },
      { status: 400 }
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters" },
      { status: 400 }
    );
  }

  try {
    await changePassword(session.userId, currentPassword, newPassword);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}