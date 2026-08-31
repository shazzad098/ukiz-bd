import { describe, expect, it } from "vitest";
import { CheckoutValidationError, deliveryFor, discountFor, estimatedDeliveryDate, normalizeCheckoutLines } from "./checkoutPolicy";
import { quoteLines } from "./checkoutDb";

const settings = { insideDhakaFee: 80, outsideDhakaFee: 150, estimatedInsideDays: 2, estimatedOutsideDays: 4 };
const activePercentage = { id: 1, code: "HOUSE10", discountType: "percentage" as const, amount: 10, minimumOrderAmount: 3000, expiresAt: null, usageLimit: 5, usageCount: 1, active: true };

describe("checkout policy", () => {
  it("derives delivery fees from server settings rather than a client total", () => { expect(deliveryFor("inside_dhaka", settings)).toEqual({ fee: 80, days: 2 }); expect(deliveryFor("outside_dhaka", settings)).toEqual({ fee: 150, days: 4 }); });
  it("calculates percentage and capped flat discounts", () => { expect(discountFor(4800, activePercentage)).toEqual({ amount: 480, code: "HOUSE10" }); expect(discountFor(3000, { ...activePercentage, discountType: "flat", amount: 5000 })).toEqual({ amount: 3000, code: "HOUSE10" }); });
  it("rejects invalid coupon states on the server", () => { expect(() => discountFor(4800, { ...activePercentage, active: false })).toThrow(CheckoutValidationError); expect(() => discountFor(4800, { ...activePercentage, expiresAt: new Date("2020-01-01") })).toThrow("expired"); expect(() => discountFor(1000, activePercentage)).toThrow("requires an order"); expect(() => discountFor(4800, { ...activePercentage, usageCount: 5 })).toThrow("usage limit"); });
  it("merges duplicate submitted variants and rejects invalid quantities", () => { expect(normalizeCheckoutLines([{ productSlug: "cypress-veil", variantSize: "50ml", quantity: 1 }, { productSlug: "cypress-veil", variantSize: "50ml", quantity: 2 }])).toEqual([{ productSlug: "cypress-veil", variantSize: "50ml", quantity: 3 }]); expect(() => normalizeCheckoutLines([{ productSlug: "cypress-veil", variantSize: "50ml", quantity: 0 }])).toThrow("at least one"); });
  it("calculates a configurable estimated arrival date", () => { expect(estimatedDeliveryDate(3, new Date("2026-08-20T00:00:00Z")).toISOString()).toContain("2026-08-23"); });
  it("derives line prices only from the server catalog and current inventory", () => { const inventory = [{ id: 1, productSlug: "cypress-veil", variantSize: "50ml", stock: 12, updatedAt: new Date() }]; expect(quoteLines([{ productSlug: "cypress-veil", variantSize: "50ml", quantity: 2 }], inventory)).toMatchObject({ subtotal: 9600, itemDetails: [{ productName: "Cypress Veil", unitPrice: 4800, quantity: 2 }] }); });
  it("rejects invalid products and oversold quantities before an order can be created", () => { const inventory = [{ id: 1, productSlug: "cypress-veil", variantSize: "50ml", stock: 1, updatedAt: new Date() }]; expect(() => quoteLines([{ productSlug: "unknown-scent", variantSize: "50ml", quantity: 1 }], inventory)).toThrow("no longer available"); expect(() => quoteLines([{ productSlug: "cypress-veil", variantSize: "50ml", quantity: 2 }], inventory)).toThrow("enough stock"); });
});
