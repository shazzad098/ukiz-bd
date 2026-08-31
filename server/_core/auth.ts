import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { parse as parseCookie } from "cookie";
import type { Request } from "express";
import { COOKIE_NAME } from "@shared/const";
import { ENV } from "./env";
import * as db from "../db";
import type { User } from "../../drizzle/schema";

const SALT_ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

function getSecret() {
  return new TextEncoder().encode(ENV.cookieSecret || "dev-secret-change-me-please-32-chars");
}

export type SessionPayload = {
  userId: number;
  openId: string;
  role: string;
};

export async function createSessionToken(user: User): Promise<string> {
  const secret = getSecret();
  return new SignJWT({ userId: user.id, openId: user.openId, role: user.role })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    const { userId, openId, role } = payload as Record<string, unknown>;
    if (typeof openId !== "string" || typeof role !== "string") return null;
    return { userId: Number(userId), openId, role };
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: Request): string | null {
  // 1) cookie
  const cookies = parseCookie(req.headers.cookie ?? "");
  const fromCookie = cookies[COOKIE_NAME];
  if (fromCookie) return fromCookie;
  // 2) Authorization: Bearer ...
  const auth = req.headers.authorization;
  if (typeof auth === "string" && auth.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export async function authenticateRequest(req: Request): Promise<User | null> {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  const session = await verifySessionToken(token);
  if (!session) return null;

  // Load fresh user from DB (so role changes take effect)
  const user = await db.getUserByOpenId(session.openId);
  if (!user) return null;
  return user;
}
