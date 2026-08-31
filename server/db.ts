import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { addresses, cartItems, customerProfiles, InsertUser, orderItems, orders, users, wishlistItems } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { mergeVariantQuantity } from "../shared/cartPolicy";
import { onlyForCustomer } from "./ownershipPolicy";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) _db = drizzle(process.env.DATABASE_URL);
  return _db;
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available.");
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await requireDb();
  const values: InsertUser = { openId: user.openId, lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: values.lastSignedIn };
  (["name", "email", "password", "loginMethod"] as const).forEach((field) => { if ((user as any)[field] !== undefined) { (values as any)[field] = (user as any)[field]; updateSet[field] = (user as any)[field]; } });
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await requireDb();
  return (await db.select().from(users).where(eq(users.openId, openId)).limit(1))[0];
}

export async function getUserByEmail(email: string) {
  const db = await requireDb();
  return (await db.select().from(users).where(eq(users.email, email)).limit(1))[0];
}

export async function getUserById(id: number) {
  const db = await requireDb();
  return (await db.select().from(users).where(eq(users.id, id)).limit(1))[0];
}

export async function getCart(userId: number) {
  const db = await requireDb();
  return db.select().from(cartItems).where(eq(cartItems.userId, userId)).orderBy(desc(cartItems.updatedAt));
}

export async function setCartItem(userId: number, productSlug: string, variantSize: string, quantity: number) {
  const db = await requireDb();
  const existing = (await db.select().from(cartItems).where(and(eq(cartItems.userId, userId), eq(cartItems.productSlug, productSlug), eq(cartItems.variantSize, variantSize))).limit(1))[0];
  if (existing) await db.update(cartItems).set({ quantity, updatedAt: new Date() }).where(eq(cartItems.id, existing.id));
  else await db.insert(cartItems).values({ userId, productSlug, variantSize, quantity });
  return getCart(userId);
}

export async function removeCartItem(userId: number, itemId: number) {
  const db = await requireDb();
  await db.delete(cartItems).where(and(eq(cartItems.id, itemId), eq(cartItems.userId, userId)));
  return getCart(userId);
}

export async function mergeGuestCart(userId: number, items: Array<{ productSlug: string; variantSize: string; quantity: number }>, stockFor: (slug: string, size: string) => number) {
  for (const item of items) {
    const stock = stockFor(item.productSlug, item.variantSize);
    if (!stock || item.quantity < 1) continue;
    const existing = (await getCart(userId)).find((entry) => entry.productSlug === item.productSlug && entry.variantSize === item.variantSize);
    const combined = mergeVariantQuantity(existing?.quantity ?? 0, item.quantity, stock);
    await setCartItem(userId, item.productSlug, item.variantSize, combined);
  }
  return getCart(userId);
}

export async function getWishlist(userId: number) { const db = await requireDb(); return db.select().from(wishlistItems).where(eq(wishlistItems.userId, userId)).orderBy(desc(wishlistItems.createdAt)); }
export async function addWishlistItem(userId: number, productSlug: string) { const db = await requireDb(); await db.insert(wishlistItems).values({ userId, productSlug }).onDuplicateKeyUpdate({ set: { productSlug } }); return getWishlist(userId); }
export async function removeWishlistItem(userId: number, productSlug: string) { const db = await requireDb(); await db.delete(wishlistItems).where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productSlug, productSlug))); return getWishlist(userId); }

export async function getCustomerProfile(userId: number) {
  const db = await requireDb();
  const user = (await db.select().from(users).where(eq(users.id, userId)).limit(1))[0];
  const profile = (await db.select().from(customerProfiles).where(eq(customerProfiles.userId, userId)).limit(1))[0];
  return { user, profile };
}
export async function updateCustomerProfile(userId: number, payload: { name?: string; email?: string; phone?: string }) {
  const db = await requireDb();
  await db.update(users).set({ name: payload.name, email: payload.email, updatedAt: new Date() }).where(eq(users.id, userId));
  await db.insert(customerProfiles).values({ userId, phone: payload.phone }).onDuplicateKeyUpdate({ set: { phone: payload.phone, updatedAt: new Date() } });
  return getCustomerProfile(userId);
}

export async function getAddresses(userId: number) { const db = await requireDb(); return db.select().from(addresses).where(eq(addresses.userId, userId)).orderBy(desc(addresses.isDefault), desc(addresses.updatedAt)); }
export async function createAddress(userId: number, values: Omit<typeof addresses.$inferInsert, "userId">) { const db = await requireDb(); if (values.isDefault) await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId)); await db.insert(addresses).values({ ...values, userId }); return getAddresses(userId); }
export async function updateAddress(userId: number, addressId: number, values: Partial<typeof addresses.$inferInsert>) { const db = await requireDb(); if (values.isDefault) await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId)); await db.update(addresses).set({ ...values, updatedAt: new Date() }).where(and(eq(addresses.id, addressId), eq(addresses.userId, userId))); return getAddresses(userId); }
export async function deleteAddress(userId: number, addressId: number) { const db = await requireDb(); await db.delete(addresses).where(and(eq(addresses.id, addressId), eq(addresses.userId, userId))); return getAddresses(userId); }

export async function getOrders(userId: number) { const db = await requireDb(); return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt)); }
export async function getOrderWithItems(userId: number, orderId: number) { const db = await requireDb(); const selected = (await db.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.userId, userId))).limit(1))[0]; const order = onlyForCustomer(selected, userId); if (!order) return undefined; const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id)); return { order, items }; }
