import { NextRequest, NextResponse } from "next/server";
import { adminExists, createAdminUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Check if admin already exists
    const exists = await adminExists();
    if (exists) {
      return NextResponse.json(
        { error: "Admin account already exists" },
        { status: 409 }
      );
    }

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