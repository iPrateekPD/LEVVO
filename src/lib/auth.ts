import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./db";

const AUTH_SECRET = process.env.NEXTAUTH_SECRET || "life-rpg-arcade-secret-salt-2026-key";
export const SESSION_COOKIE_NAME = "life_rpg_session";

/**
 * Secure password hashing using PBKDF2 with SHA-512
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify password against stored salt:hash
 */
export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(verifyHash, "hex"));
  } catch {
    return false;
  }
}

/**
 * Sign session token with HMAC SHA-256
 */
export function createSessionToken(userId: string): string {
  const expires = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const data = `${userId}:${expires}`;
  const hmac = crypto.createHmac("sha256", AUTH_SECRET).update(data).digest("hex");
  return `${data}:${hmac}`;
}

/**
 * Validate session token and extract userId
 */
export function verifySessionToken(token: string): string | null {
  try {
    const decoded = decodeURIComponent(token);
    const parts = decoded.split(":");
    if (parts.length !== 3) return null;
    const [userId, expiresStr, hmac] = parts;
    const expires = parseInt(expiresStr, 10);
    if (isNaN(expires) || Date.now() > expires) return null;

    const expectedHmac = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(`${userId}:${expiresStr}`)
      .digest("hex");

    if (
      !crypto.timingSafeEqual(Buffer.from(hmac, "hex"), Buffer.from(expectedHmac, "hex"))
    ) {
      return null;
    }

    return userId;
  } catch {
    return null;
  }
}

/**
 * Get authenticated user from session cookie
 */
export async function getSessionUser(req?: Request): Promise<{
  userId: string;
  email: string;
  username: string;
} | null> {
  let token: string | undefined;

  if (req) {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
    if (match) {
      token = match[1];
    }
  }

  if (!token) {
    try {
      const cookieStore = cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    } catch {
      // Not in Next.js request context
    }
  }

  if (!token) return null;

  const userId = verifySessionToken(token);
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user || !user.profile) return null;

  return {
    userId: user.id,
    email: user.email,
    username: user.profile.username,
  };
}
