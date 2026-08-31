import { describe, expect, it } from "vitest";
import { dashboardData, ensureAdminSeed, getAdminSettings, listCategories, listHomepageSlots, listManagedProducts } from "./adminDb";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { quoteCheckout } from "./checkoutDb";

describe("admin catalog seed", () => {
  it("materializes the established storefront catalog, management categories, media, and operational settings", async () => {
    await ensureAdminSeed();
    const [products, categories, settings, dashboard, slots] = await Promise.all([listManagedProducts(), listCategories(), getAdminSettings(), dashboardData(), listHomepageSlots()]);
    expect(products.length).toBeGreaterThanOrEqual(10);
    expect(products.find((entry) => entry?.product.slug === "cypress-veil")?.variants.length).toBeGreaterThan(0);
    expect(products.find((entry) => entry?.product.slug === "cypress-veil")?.media.length).toBeGreaterThan(0);
    expect(categories.map((category) => category.name)).toContain("Men");
    expect(settings?.lowStockThreshold).toBeGreaterThanOrEqual(0);
    expect(dashboard.metrics.totalOrders).toBeGreaterThanOrEqual(0);
    expect(slots.map((slot) => slot.slotKey)).toEqual(expect.arrayContaining(["hero", "campaign", "story", "featured-products", "best-sellers", "new-arrivals"]));
  });

  it("allows an administrator to retrieve the protected operational dashboard and catalog", async () => {
    const ctx: TrpcContext = {
      user: { id: 1, openId: "admin-test", name: "Administrator", email: "admin@example.test", loginMethod: "test", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const [dashboard, products] = await Promise.all([caller.admin.dashboard(), caller.admin.products()]);
    expect(dashboard.metrics.totalOrders).toBeGreaterThanOrEqual(0);
    expect(products.find((entry) => entry?.product.slug === "cypress-veil")).toBeTruthy();
  });

  it("uses the published managed catalog for a server-owned checkout quote", async () => {
    const quote = await quoteCheckout(undefined, { lines: [{ productSlug: "cypress-veil", variantSize: "50ml", quantity: 1 }], deliveryZone: "inside_dhaka" });
    expect(quote.itemDetails[0]).toMatchObject({ productSlug: "cypress-veil", variantSize: "50ml", unitPrice: 4800 });
    expect(quote.total).toBe(4880);
  });

  it("allows an administrator to re-save existing operational values without changing business state", async () => {
    const ctx: TrpcContext = {
      user: { id: 1, openId: "admin-workflow-test", name: "Administrator", email: "admin@example.test", loginMethod: "test", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const [inventory, slots, orders] = await Promise.all([caller.admin.inventory(), caller.admin.homepageSlots(), caller.admin.orders()]);
    const variant = inventory[0]; const slot = slots[0]; const cancelled = orders.find((order) => order.orderStatus === "cancelled");
    expect(variant).toBeTruthy(); expect(slot).toBeTruthy();
    await caller.admin.setInventory({ variantId: variant!.id, stock: variant!.stock });
    await caller.admin.saveHomepageSlot({ id: slot!.id, slotKey: slot!.slotKey, eyebrow: slot!.eyebrow, title: slot!.title, body: slot!.body, ctaLabel: slot!.ctaLabel, ctaHref: slot!.ctaHref, imageUrl: slot!.imageUrl, productSlug: slot!.productSlug, enabled: slot!.enabled, sortOrder: slot!.sortOrder });
    if (cancelled) {
      const result = await caller.admin.updateOrder({ orderId: cancelled.id, orderStatus: "cancelled" });
      expect(result?.order.orderStatus).toBe("cancelled");
    }
  });
});
