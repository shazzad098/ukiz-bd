import { boolean, decimal, index, int, mysqlEnum, mysqlTable, text, timestamp, unique, varchar } from "drizzle-orm/mysql-core";

/**
 * Core identity table managed by Manus OAuth. Customer-owned records below reference this numeric ID and are always queried through the authenticated user context.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  password: varchar("password", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const customerProfiles = mysqlTable("customerProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  phone: varchar("phone", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const cartItems = mysqlTable("cartItems", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productSlug: varchar("productSlug", { length: 128 }).notNull(),
  variantSize: varchar("variantSize", { length: 16 }).notNull(),
  quantity: int("quantity").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("cart_user_idx").on(table.userId), unique("cart_user_product_variant_unique").on(table.userId, table.productSlug, table.variantSize)]);

export const wishlistItems = mysqlTable("wishlistItems", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productSlug: varchar("productSlug", { length: 128 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [index("wishlist_user_idx").on(table.userId), unique("wishlist_user_product_unique").on(table.userId, table.productSlug)]);

export const addresses = mysqlTable("addresses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  label: varchar("label", { length: 64 }).notNull().default("Home"),
  division: varchar("division", { length: 96 }).notNull(),
  district: varchar("district", { length: 96 }).notNull(),
  thana: varchar("thana", { length: 96 }).notNull(),
  detailedAddress: text("detailedAddress").notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  isDefault: boolean("isDefault").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("address_user_idx").on(table.userId)]);

export const catalogInventory = mysqlTable("catalogInventory", {
  id: int("id").autoincrement().primaryKey(),
  productSlug: varchar("productSlug", { length: 128 }).notNull(),
  variantSize: varchar("variantSize", { length: 16 }).notNull(),
  stock: int("stock").notNull().default(0),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [unique("inventory_product_variant_unique").on(table.productSlug, table.variantSize)]);

export const checkoutSettings = mysqlTable("checkoutSettings", {
  id: int("id").primaryKey(),
  insideDhakaFee: decimal("insideDhakaFee", { precision: 12, scale: 2 }).notNull(),
  outsideDhakaFee: decimal("outsideDhakaFee", { precision: 12, scale: 2 }).notNull(),
  estimatedInsideDays: int("estimatedInsideDays").notNull().default(2),
  estimatedOutsideDays: int("estimatedOutsideDays").notNull().default(4),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const coupons = mysqlTable("coupons", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  discountType: mysqlEnum("discountType", ["percentage", "flat"]).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  minimumOrderAmount: decimal("minimumOrderAmount", { precision: 12, scale: 2 }).notNull().default("0"),
  expiresAt: timestamp("expiresAt"),
  usageLimit: int("usageLimit"),
  usageCount: int("usageCount").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("coupon_active_idx").on(table.active)]);

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  orderNumber: varchar("orderNumber", { length: 40 }).notNull().unique(),
  orderAccessToken: varchar("orderAccessToken", { length: 64 }).unique(),
  customerName: varchar("customerName", { length: 160 }),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerPhone: varchar("customerPhone", { length: 32 }),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  deliveryFee: decimal("deliveryFee", { precision: 12, scale: 2 }).notNull().default("0"),
  discount: decimal("discount", { precision: 12, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  couponCode: varchar("couponCode", { length: 64 }),
  deliveryZone: mysqlEnum("deliveryZone", ["inside_dhaka", "outside_dhaka"]),
  deliveryInstructions: text("deliveryInstructions"),
  estimatedDeliveryAt: timestamp("estimatedDeliveryAt"),
  paymentMethod: varchar("paymentMethod", { length: 48 }).notNull(),
  paymentReference: varchar("paymentReference", { length: 128 }),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed", "cancelled", "refunded"]).notNull().default("pending"),
  orderStatus: mysqlEnum("orderStatus", ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]).notNull().default("pending"),
  shippingAddress: text("shippingAddress").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("order_user_idx").on(table.userId)]);

export const paymentAttempts = mysqlTable("paymentAttempts", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  provider: varchar("provider", { length: 48 }).notNull(),
  providerTransactionId: varchar("providerTransactionId", { length: 128 }).notNull().unique(),
  sessionKey: varchar("sessionKey", { length: 128 }).unique(),
  gatewayUrl: text("gatewayUrl"),
  status: mysqlEnum("status", ["initiated", "pending", "paid", "failed", "cancelled", "refunded"]).notNull().default("initiated"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  validationId: varchar("validationId", { length: 128 }).unique(),
  callbackFingerprint: varchar("callbackFingerprint", { length: 128 }).unique(),
  gatewayStatus: varchar("gatewayStatus", { length: 64 }),
  failureReason: text("failureReason"),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("payment_attempt_order_idx").on(table.orderId), index("payment_attempt_status_idx").on(table.status)]);

export const couponRedemptions = mysqlTable("couponRedemptions", {
  id: int("id").autoincrement().primaryKey(),
  couponId: int("couponId").notNull(),
  orderId: int("orderId").notNull(),
  userId: int("userId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [unique("coupon_order_unique").on(table.couponId, table.orderId), index("coupon_redemption_user_idx").on(table.userId)]);

export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productSlug: varchar("productSlug", { length: 128 }).notNull(),
  productName: varchar("productName", { length: 256 }).notNull(),
  variantSize: varchar("variantSize", { length: 16 }).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 12, scale: 2 }).notNull(),
}, (table) => [index("order_item_order_idx").on(table.orderId)]);

export const catalogCategories = mysqlTable("catalogCategories", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  enabled: boolean("enabled").notNull().default(true),
  archived: boolean("archived").notNull().default(false),
  sortOrder: int("sortOrder").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("category_active_idx").on(table.enabled, table.archived)]);

export const catalogProducts = mysqlTable("catalogProducts", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 256 }).notNull(),
  brand: varchar("brand", { length: 128 }).notNull(),
  categoryId: int("categoryId"),
  categoryName: varchar("categoryName", { length: 128 }).notNull(),
  gender: mysqlEnum("gender", ["Men", "Women", "Unisex"]).notNull().default("Unisex"),
  fragranceFamilies: text("fragranceFamilies"),
  familySummary: varchar("familySummary", { length: 256 }),
  badge: varchar("badge", { length: 64 }),
  tone: varchar("tone", { length: 32 }).notNull().default("stone"),
  published: boolean("published").notNull().default(false),
  archived: boolean("archived").notNull().default(false),
  featuredRank: int("featuredRank").notNull().default(999),
  isNew: boolean("isNew").notNull().default(false),
  notesTop: text("notesTop"),
  notesMiddle: text("notesMiddle"),
  notesBase: text("notesBase"),
  longevity: varchar("longevity", { length: 128 }),
  sillage: varchar("sillage", { length: 128 }),
  concentration: varchar("concentration", { length: 128 }),
  ingredients: text("ingredients"),
  usageInstructions: text("usageInstructions"),
  story: text("story"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("catalog_product_visibility_idx").on(table.published, table.archived), index("catalog_product_category_idx").on(table.categoryId)]);

export const catalogVariants = mysqlTable("catalogVariants", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  size: varchar("size", { length: 32 }).notNull(),
  sku: varchar("sku", { length: 128 }).notNull().unique(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  originalPrice: decimal("originalPrice", { precision: 12, scale: 2 }),
  stock: int("stock").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [unique("catalog_variant_product_size_unique").on(table.productId, table.size), index("catalog_variant_product_idx").on(table.productId)]);

export const catalogMedia = mysqlTable("catalogMedia", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  mediaType: mysqlEnum("mediaType", ["image", "video"]).notNull().default("image"),
  storageKey: varchar("storageKey", { length: 512 }),
  url: text("url").notNull(),
  altText: varchar("altText", { length: 256 }),
  sortOrder: int("sortOrder").notNull().default(0),
  isPrimary: boolean("isPrimary").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [index("catalog_media_product_idx").on(table.productId, table.sortOrder)]);

export const homepageSlots = mysqlTable("homepageSlots", {
  id: int("id").autoincrement().primaryKey(),
  slotKey: varchar("slotKey", { length: 64 }).notNull().unique(),
  eyebrow: varchar("eyebrow", { length: 160 }),
  title: varchar("title", { length: 320 }),
  body: text("body"),
  ctaLabel: varchar("ctaLabel", { length: 96 }),
  ctaHref: varchar("ctaHref", { length: 256 }),
  imageUrl: text("imageUrl"),
  productSlug: varchar("productSlug", { length: 128 }),
  enabled: boolean("enabled").notNull().default(true),
  sortOrder: int("sortOrder").notNull().default(0),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("homepage_slot_visibility_idx").on(table.enabled, table.sortOrder)]);

export const adminSettings = mysqlTable("adminSettings", {
  id: int("id").primaryKey(),
  lowStockThreshold: int("lowStockThreshold").notNull().default(5),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const adminNotifications = mysqlTable("adminNotifications", {
  id: int("id").autoincrement().primaryKey(),
  notificationType: mysqlEnum("notificationType", ["new_order", "low_stock", "payment_issue", "system"]).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  body: text("body"),
  entityType: varchar("entityType", { length: 64 }),
  entityId: varchar("entityId", { length: 128 }),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [index("admin_notification_read_idx").on(table.readAt, table.createdAt)]);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
