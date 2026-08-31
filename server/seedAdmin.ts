import { hashPassword } from "./_core/auth";
import { ENV } from "./_core/env";
import { getUserByEmail, upsertUser } from "./db";
import { nanoid } from "nanoid";

export async function ensureDefaultAdmin() {
  const email = ENV.adminEmail.toLowerCase().trim();
  const password = ENV.adminPassword;
  if (!email || !password) return;

  const existing = await getUserByEmail(email).catch(() => null);
  if (existing) {
    // ensure role is admin
    if (existing.role !== "admin") {
      await upsertUser({ openId: existing.openId, role: "admin" as const });
      console.log(`[seedAdmin] Promoted ${email} to admin`);
    }
    return;
  }

  const hashed = await hashPassword(password);
  const openId = `admin_${nanoid(12)}`;
  await upsertUser({
    openId,
    email,
    name: "Administrator",
    password: hashed,
    loginMethod: "password",
    role: "admin",
  } as any);
  console.log(`[seedAdmin] Created admin ${email} / ${password}`);
}
