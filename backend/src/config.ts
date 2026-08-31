import "dotenv/config";

export const ENV = {
  port: parseInt(process.env.PORT ?? "3000", 10),
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
  adminEmail: process.env.ADMIN_EMAIL ?? "admin@ukiz.com",
  adminPassword: process.env.ADMIN_PASSWORD ?? "admin123",
} as const;

export function validateEnv() {
  if (ENV.isProduction) {
    if (!ENV.databaseUrl) throw new Error("DATABASE_URL is required");
    if (!ENV.jwtSecret) throw new Error("JWT_SECRET is required");
  }
}

// DB helper
import { drizzle } from "drizzle-orm/mysql2";
let _db: ReturnType<typeof drizzle> | null = null;
export async function getDb() {
  if (!_db && ENV.databaseUrl) _db = drizzle(ENV.databaseUrl);
  return _db;
}
export async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available. Set DATABASE_URL.");
  return db;
}
