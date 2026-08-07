import { NextRequest, NextResponse } from "next/server";
import { adminExists, createAdminUser, getSession } from "@/lib/auth";

// HEAD is used by the client to detect whether any admin account exists.
// Returns 409 if an admin exists, 200 otherwise.
export async function HEAD() {
  const exists = await adminExists();
  return new NextResponse(null, { status: exists ? 409 : 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, confirmPassword } = body;

    if (!username || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if this specific username already exists
    const usernameExists = await adminExists(username);
    if (usernameExists) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );
    }

    // If any admin already exists, require an authenticated admin session
    const anyAdminExists = await adminExists();
    if (anyAdminExists) {
      const session = await getSession();
      if (!session) {
        return NextResponse.json(
          { error: "Login required to create an admin account" },
          { status: 401 }
        );
      }
    }

    await createAdminUser(username, password);

    return NextResponse.json(
      { success: true, message: "Admin account created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
