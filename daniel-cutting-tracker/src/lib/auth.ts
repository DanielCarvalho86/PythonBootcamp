import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/database/prisma";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS as SESSION_TTL_SECONDS } from "@/lib/authConstants";

/**
 * Minimal single-user session auth (spec section 53: personal health data
 * must be private, behind authentication). Deliberately not a full
 * multi-provider auth system — Daniel Cutting Tracker is a personal app —
 * but the data model (User rows, userId FKs everywhere) is ready for
 * multiple users later.
 */

export { SESSION_COOKIE_NAME };

function getSecret(): string {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret) throw new Error("AUTH_SESSION_SECRET is not configured");
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createSessionToken(userId: string): string {
  const exp = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = Buffer.from(JSON.stringify({ userId, exp })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): { userId: string } | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = sign(payload);
  const provided = Buffer.from(signature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      userId?: unknown;
      exp?: unknown;
    };
    if (typeof data.userId !== "string" || typeof data.exp !== "number") return null;
    if (Date.now() > data.exp) return null;
    return { userId: data.userId };
  } catch {
    return null;
  }
}

export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}

export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token)?.userId ?? null;
}

/** Throws if there's no valid session — use from Server Components/Actions that require auth. */
export async function requireUserId(): Promise<string> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("UNAUTHENTICATED");
  return userId;
}

export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_SECONDS;
