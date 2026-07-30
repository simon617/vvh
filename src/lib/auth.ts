import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-me";
const SESSION_EXPIRY = "24h";
const BCRYPT_ROUNDS = 12;

export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

// Compare password with hash
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Sign JWT token
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: SESSION_EXPIRY });
}

// Verify JWT token
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

// Get current session from cookie
export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

// Set auth cookie
export function setAuthCookie(token: string): void {
  const cookieStore = cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours in seconds
    path: "/",
  });
}

// Clear auth cookie
export function clearAuthCookie(): void {
  const cookieStore = cookies();
  cookieStore.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

// Check if admin user exists
export async function adminExists(): Promise<boolean> {
  const count = await prisma.adminUser.count();
  return count > 0;
}

// Create admin user
export async function createAdminUser(
  username: string,
  password: string
): Promise<void> {
  const hashedPassword = await hashPassword(password);
  await prisma.adminUser.create({
    data: {
      username,
      password: hashedPassword,
    },
  });
}

// Validate admin credentials
export async function validateAdmin(
  username: string,
  password: string
): Promise<JwtPayload | null> {
  const user = await prisma.adminUser.findUnique({
    where: { username },
  });

  if (!user) {
    return null;
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    return null;
  }

  return {
    userId: user.id,
    username: user.username,
    role: user.role,
  };
}