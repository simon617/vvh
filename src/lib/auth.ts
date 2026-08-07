import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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

// creates a JSON Web Token (JWT) for authentication
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: SESSION_EXPIRY });
}

// verify a JSON Web Token and returns either the decoded token payload or null if verification fails
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
// "lax" Cookie is set for top-level navigation, but not for cross-site requests like image, iframe, or AJAX requests.  
// httpOnly : XSS protection, cookie is for server only, JavaScript can't access it.
// secure :  
//    Cookie is sent ONLY IF:
//      (secure === false) OR (secure === true AND connection is HTTPS)
//    Cookie is BLOCKED IF:
//       secure === true AND connection is HTTP

// path: "/" : cookie is available for entire website, not just a specific path
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

// Check if admin user exists.
// If a username is provided, checks whether that specific username exists.
// If no username is provided, checks whether ANY admin user exists (first-run detection).
export async function adminExists(username?: string): Promise<boolean> {
  if (username) {
    const user = await prisma.adminUser.findUnique({
      where: { username },
      select: { id: true },
    });
    return user !== null;
  }
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