import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import * as db from "./db";
import { assertQuantityAvailable, getVariantStock } from "./catalogStock";
import * as checkout from "./checkoutDb";
import { CheckoutValidationError } from "./checkoutPolicy";
import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";
import { TRPCError } from "@trpc/server";
import * as payments from "./paymentService";
import { PaymentValidationError } from "./paymentPolicy";
import * as admin from "./adminDb";
import { storagePut } from "./storage";
import { createSessionToken, hashPassword, verifyPassword } from "./_core/auth";
import { nanoid } from "nanoid";

const cartItemInput = z.object({ productSlug: z.string().min(1).max(128), variantSize: z.enum(["30ml", "50ml", "100ml"]), quantity: z.number().int().min(1).max(100) });
const addressInput = z.object({ label: z.string().trim().min(1).max(64), division: z.string().trim().min(1).max(96), district: z.string().trim().min(1).max(96), thana: z.string().trim().min(1).max(96), detailedAddress: z.string().trim().min(5).max(1200), phone: z.string().trim().min(7).max(32), isDefault: z.boolean().optional() });
const checkoutLineInput = z.object({ productSlug: z.string().min(1).max(128), variantSize: z.enum(["30ml", "50ml", "100ml"]), quantity: z.number().int().min(1).max(100) });
const checkoutAddressInput = z.object({ division: z.string().trim().min(1).max(96), district: z.string().trim().min(1).max(96), thana: z.string().trim().min(1).max(96), detailedAddress: z.string().trim().min(5).max(1200), phone: z.string().trim().min(7).max(32) });
const checkoutInput = z.object({ name: z.string().trim().min(2).max(160), email: z.string().trim().email().max(320), phone: z.string().trim().min(7).max(32), addressId: z.number().int().positive().optional(), address: checkoutAddressInput.optional(), deliveryInstructions: z.string().trim().max(600).optional(), deliveryZone: z.enum(["inside_dhaka", "outside_dhaka"]), couponCode: z.string().trim().max(64).optional(), paymentMethod: z.enum(["cash_on_delivery", "gateway_pending"]), lines: z.array(checkoutLineInput).max(30).optional() });
const urlInput = z.string().trim().min(1).max(2000).refine((value) => value.startsWith("/manus-storage/") || /^https:\/\//.test(value), "Use a secure media URL.");
const adminVariantInput = z.object({ size: z.enum(["30ml", "50ml", "100ml"]), sku: z.string().trim().min(1).max(128), price: z.number().nonnegative().max(1_000_000), originalPrice: z.number().nonnegative().max(1_000_000).nullable().optional(), stock: z.number().int().min(0).max(1_000_000), published: z.boolean().optional() });
const adminMediaInput = z.object({ mediaType: z.enum(["image", "video"]), url: urlInput, storageKey: z.string().trim().max(512).nullable().optional(), altText: z.string().trim().max(256).nullable().optional(), sortOrder: z.number().int().min(0).max(999).optional(), isPrimary: z.boolean().optional() });
const adminProductInput = z.object({ slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(128), name: z.string().trim().min(1).max(256), brand: z.string().trim().min(1).max(128), categoryName: z.string().trim().min(1).max(128), gender: z.enum(["Men", "Women", "Unisex"]), fragranceFamilies: z.array(z.string().trim().min(1).max(64)).max(8), familySummary: z.string().trim().max(256).nullable().optional(), badge: z.string().trim().max(64).nullable().optional(), tone: z.string().trim().max(32).optional(), published: z.boolean(), featuredRank: z.number().int().min(0).max(999).optional(), isNew: z.boolean().optional(), notesTop: z.array(z.string().trim().min(1).max(80)).max(12).optional(), notesMiddle: z.array(z.string().trim().min(1).max(80)).max(12).optional(), notesBase: z.array(z.string().trim().min(1).max(80)).max(12).optional(), longevity: z.string().trim().max(128).nullable().optional(), sillage: z.string().trim().max(128).nullable().optional(), concentration: z.string().trim().max(128).nullable().optional(), ingredients: z.string().trim().max(4000).nullable().optional(), usageInstructions: z.string().trim().max(4000).nullable().optional(), story: z.string().trim().max(4000).nullable().optional(), variants: z.array(adminVariantInput).min(1).max(16), media: z.array(adminMediaInput).max(24) });
function checkoutError(error: unknown): never { if (error instanceof CheckoutValidationError) throw new TRPCError({ code: "BAD_REQUEST", message: error.message }); throw error; }
function paymentError(error: unknown): never { if (error instanceof PaymentValidationError) throw new TRPCError({ code: "BAD_REQUEST", message: error.message }); throw error; }

export const appRouter = router({
  system: systemRouter,
  storefront: router({
    homepageSlots: publicProcedure.query(() => admin.listHomepageSlots()),
    products: publicProcedure.query(() => admin.listPublishedStorefrontProducts()),
    categories: publicProcedure.query(() => admin.listPublishedCategories()),
  }),
  auth: router({
    me: publicProcedure.query(({ ctx }) => {
      if (!ctx.user) return null;
      const { password: _pw, ...safe } = ctx.user as any;
      return safe;
    }),
    login: publicProcedure
      .input(z.object({ email: z.string().trim().email().max(320), password: z.string().min(1).max(128) }))
      .mutation(async ({ ctx, input }) => {
        const email = input.email.toLowerCase().trim();
        const user = await db.getUserByEmail(email);
        if (!user || !user.password) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        const ok = await verifyPassword(input.password, user.password);
        if (!ok) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() } as any);
        const token = await createSessionToken(user);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        const { password: _pw, ...safe } = user as any;
        return safe;
      }),
    register: publicProcedure
      .input(z.object({ name: z.string().trim().min(1).max(160), email: z.string().trim().email().max(320), password: z.string().min(6).max(128) }))
      .mutation(async ({ ctx, input }) => {
        const email = input.email.toLowerCase().trim();
        const existing = await db.getUserByEmail(email);
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
        const hashed = await hashPassword(input.password);
        const openId = `user_${nanoid(12)}`;
        await db.upsertUser({
          openId,
          email,
          name: input.name.trim(),
          password: hashed,
          loginMethod: "password",
          role: "user",
        } as any);
        const user = await db.getUserByEmail(email);
        if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Registration failed" });
        const token = await createSessionToken(user);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        const { password: _pw, ...safe } = user as any;
        return safe;
      }),
    adminLogin: publicProcedure
      .input(z.object({ email: z.string().trim().email().max(320), password: z.string().min(1).max(128) }))
      .mutation(async ({ ctx, input }) => {
        const email = input.email.toLowerCase().trim();
        const user = await db.getUserByEmail(email);
        if (!user || !user.password) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid admin credentials" });
        if (user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Not an admin account" });
        const ok = await verifyPassword(input.password, user.password);
        if (!ok) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid admin credentials" });
        const token = await createSessionToken(user);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        const { password: _pw, ...safe } = user as any;
        return safe;
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  cart: router({
    list: protectedProcedure.query(({ ctx }) => db.getCart(ctx.user.id)),
    setItem: protectedProcedure.input(cartItemInput).mutation(async ({ ctx, input }) => { assertQuantityAvailable(input.productSlug, input.variantSize, input.quantity); return db.setCartItem(ctx.user.id, input.productSlug, input.variantSize, input.quantity); }),
    removeItem: protectedProcedure.input(z.object({ itemId: z.number().int().positive() })).mutation(({ ctx, input }) => db.removeCartItem(ctx.user.id, input.itemId)),
    mergeGuest: protectedProcedure.input(z.array(cartItemInput).max(30)).mutation(({ ctx, input }) => db.mergeGuestCart(ctx.user.id, input, getVariantStock)),
  }),
  wishlist: router({
    list: protectedProcedure.query(({ ctx }) => db.getWishlist(ctx.user.id)),
    add: protectedProcedure.input(z.object({ productSlug: z.string().min(1).max(128) })).mutation(({ ctx, input }) => db.addWishlistItem(ctx.user.id, input.productSlug)),
    remove: protectedProcedure.input(z.object({ productSlug: z.string().min(1).max(128) })).mutation(({ ctx, input }) => db.removeWishlistItem(ctx.user.id, input.productSlug)),
  }),
  checkout: router({
    quote: publicProcedure.input(z.object({ deliveryZone: z.enum(["inside_dhaka", "outside_dhaka"]), couponCode: z.string().trim().max(64).optional(), lines: z.array(checkoutLineInput).max(30).optional() })).query(async ({ ctx, input }) => { try { return await checkout.quoteCheckout(ctx.user?.id, input); } catch (error) { checkoutError(error); } }),
    create: publicProcedure.input(checkoutInput).mutation(async ({ ctx, input }) => { try { return await checkout.createCheckoutOrder(ctx.user?.id, input); } catch (error) { checkoutError(error); } }),
    confirmation: publicProcedure.input(z.object({ orderNumber: z.string().min(1).max(40), accessToken: z.string().max(64).optional() })).query(async ({ ctx, input }) => { const result = await checkout.getCheckoutConfirmation(ctx.user?.id, input.orderNumber, input.accessToken); if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Order confirmation is unavailable." }); return result; }),
    cancel: publicProcedure.input(z.object({ orderId: z.number().int().positive().optional(), orderNumber: z.string().min(1).max(40).optional(), accessToken: z.string().min(20).max(64).optional() }).refine((input) => Boolean(input.orderId) || Boolean(input.orderNumber && input.accessToken), "Provide an account order ID or the guest confirmation token.")).mutation(async ({ ctx, input }) => { try { return await checkout.cancelCheckoutOrder({ userId: ctx.user?.id, ...input }); } catch (error) { checkoutError(error); } }),
  }),
  payment: router({
    start: publicProcedure.input(z.object({ orderNumber: z.string().min(1).max(40), accessToken: z.string().max(64).optional() })).mutation(async ({ ctx, input }) => { try { const forwardedHost = ctx.req.headers["x-forwarded-host"] ?? ctx.req.headers.host ?? ctx.req.get("host"); const forwardedProtocol = ctx.req.headers["x-forwarded-proto"] ?? ctx.req.protocol ?? "https"; const host = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost; const protocol = (Array.isArray(forwardedProtocol) ? forwardedProtocol[0] : forwardedProtocol).split(",")[0].trim(); if (!host) throw new PaymentValidationError("The payment return address could not be determined."); return await payments.initiateSslCommerzPayment({ userId: ctx.user?.id, ...input, origin: `${protocol}://${host}` }); } catch (error) { paymentError(error); } }),
    status: publicProcedure.input(z.object({ orderNumber: z.string().min(1).max(40), accessToken: z.string().max(64).optional() })).query(async ({ ctx, input }) => { try { return await payments.paymentStatus({ userId: ctx.user?.id, ...input }); } catch (error) { paymentError(error); } }),
    simulate: publicProcedure.input(z.object({ orderNumber: z.string().min(1).max(40), accessToken: z.string().max(64).optional(), outcome: z.enum(["paid", "failed", "cancelled", "network_failure"]) })).mutation(async ({ ctx, input }) => { try { return await payments.simulateSandboxPayment({ userId: ctx.user?.id, orderNumber: input.orderNumber, accessToken: input.accessToken }, input.outcome); } catch (error) { paymentError(error); } }),
  }),
  admin: router({
    dashboard: adminProcedure.query(() => admin.dashboardData()),
    products: adminProcedure.query(() => admin.listManagedProducts()),
    product: adminProcedure.input(z.object({ productId: z.number().int().positive() })).query(({ input }) => admin.getManagedProduct(input.productId)),
    createProduct: adminProcedure.input(adminProductInput).mutation(({ input }) => admin.createManagedProduct(input)),
    updateProduct: adminProcedure.input(z.object({ productId: z.number().int().positive(), values: adminProductInput })).mutation(({ input }) => admin.updateManagedProduct(input.productId, input.values)),
    archiveProduct: adminProcedure.input(z.object({ productId: z.number().int().positive() })).mutation(({ input }) => admin.archiveManagedProduct(input.productId)),
    inventory: adminProcedure.query(() => admin.listInventory()),
    setInventory: adminProcedure.input(z.object({ variantId: z.number().int().positive(), stock: z.number().int().min(0).max(1_000_000) })).mutation(({ input }) => admin.setInventory(input.variantId, input.stock)),
    settings: adminProcedure.query(() => admin.getAdminSettings()),
    saveSettings: adminProcedure.input(z.object({ lowStockThreshold: z.number().int().min(0).max(100_000) })).mutation(({ input }) => admin.saveAdminSettings(input.lowStockThreshold)),
    categories: adminProcedure.query(() => admin.listCategories()),
    saveCategory: adminProcedure.input(z.object({ id: z.number().int().positive().optional(), slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(128), name: z.string().trim().min(1).max(128), description: z.string().trim().max(2000).nullable().optional(), imageUrl: urlInput.nullable().optional(), enabled: z.boolean(), sortOrder: z.number().int().min(0).max(999) })).mutation(({ input }) => admin.saveCategory(input)),
    archiveCategory: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => admin.archiveCategory(input.id)),
    coupons: adminProcedure.query(() => admin.listCoupons()),
    saveCoupon: adminProcedure.input(z.object({ id: z.number().int().positive().optional(), code: z.string().trim().min(3).max(64), discountType: z.enum(["percentage", "flat"]), amount: z.number().positive().max(1_000_000), minimumOrderAmount: z.number().nonnegative().max(1_000_000), expiresAt: z.date().nullable().optional(), usageLimit: z.number().int().positive().max(1_000_000).nullable().optional(), active: z.boolean() }).superRefine((value, ctx) => { if (value.discountType === "percentage" && value.amount > 100) ctx.addIssue({ code: "custom", message: "Percentage coupons cannot exceed 100%." }); })).mutation(({ input }) => admin.saveCoupon(input)),
    archiveCoupon: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => admin.archiveCoupon(input.id)),
    homepageSlots: adminProcedure.query(() => admin.listHomepageSlots()),
    saveHomepageSlot: adminProcedure.input(z.object({ id: z.number().int().positive().optional(), slotKey: z.string().trim().regex(/^[a-z0-9_-]+$/).max(64), eyebrow: z.string().trim().max(160).nullable().optional(), title: z.string().trim().max(320).nullable().optional(), body: z.string().trim().max(4000).nullable().optional(), ctaLabel: z.string().trim().max(96).nullable().optional(), ctaHref: z.string().trim().max(256).nullable().optional(), imageUrl: urlInput.nullable().optional(), productSlug: z.string().trim().max(128).nullable().optional(), enabled: z.boolean(), sortOrder: z.number().int().min(0).max(999) })).mutation(({ input }) => admin.saveHomepageSlot(input)),
    orders: adminProcedure.input(z.object({ query: z.string().trim().max(160).optional(), orderStatus: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]).optional(), paymentStatus: z.enum(["pending", "paid", "failed", "cancelled", "refunded"]).optional(), from: z.date().optional(), to: z.date().optional() }).optional()).query(({ input }) => admin.listAdminOrders(input)),
    order: adminProcedure.input(z.object({ orderId: z.number().int().positive() })).query(({ input }) => admin.getAdminOrder(input.orderId)),
    updateOrder: adminProcedure.input(z.object({ orderId: z.number().int().positive(), orderStatus: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]).optional(), paymentStatus: z.enum(["pending", "failed", "cancelled", "refunded"]).optional() })).mutation(({ input }) => admin.updateAdminOrder(input)),
    customers: adminProcedure.input(z.object({ query: z.string().trim().max(160).optional() }).optional()).query(({ input }) => admin.listCustomers(input)),
    customerOrders: adminProcedure.input(z.object({ userId: z.number().int().positive() })).query(({ input }) => admin.customerOrders(input.userId)),
    uploadMedia: adminProcedure.input(z.object({ filename: z.string().trim().min(1).max(160), contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4"]), base64: z.string().min(1).max(20_000_000) })).mutation(async ({ input }) => { const bytes = Buffer.from(input.base64, "base64"); if (!bytes.length || bytes.length > 15 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Upload files must be 15 MB or smaller." }); const safeFilename = input.filename.replace(/[^a-zA-Z0-9._-]/g, "-"); return storagePut(`admin-media/${Date.now()}-${safeFilename}`, bytes, input.contentType); }),
  }),
  customer: router({
    profile: protectedProcedure.query(({ ctx }) => db.getCustomerProfile(ctx.user.id)),
    updateProfile: protectedProcedure.input(z.object({ name: z.string().trim().min(1).max(160).optional(), email: z.string().email().max(320).optional(), phone: z.string().trim().min(7).max(32).optional() })).mutation(({ ctx, input }) => db.updateCustomerProfile(ctx.user.id, input)),
    addresses: protectedProcedure.query(({ ctx }) => db.getAddresses(ctx.user.id)),
    createAddress: protectedProcedure.input(addressInput).mutation(({ ctx, input }) => db.createAddress(ctx.user.id, input)),
    updateAddress: protectedProcedure.input(addressInput.partial().extend({ addressId: z.number().int().positive() })).mutation(({ ctx, input }) => { const { addressId, ...values } = input; return db.updateAddress(ctx.user.id, addressId, values); }),
    deleteAddress: protectedProcedure.input(z.object({ addressId: z.number().int().positive() })).mutation(({ ctx, input }) => db.deleteAddress(ctx.user.id, input.addressId)),
    orders: protectedProcedure.query(({ ctx }) => db.getOrders(ctx.user.id)),
    order: protectedProcedure.input(z.object({ orderId: z.number().int().positive() })).query(({ ctx, input }) => db.getOrderWithItems(ctx.user.id, input.orderId)),
  }),
});
export type AppRouter = typeof appRouter;
