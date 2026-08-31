import type { CheckoutSize } from "./checkoutCatalog";

export type CheckoutLine = { productSlug: string; variantSize: CheckoutSize; quantity: number };
export type DeliveryZone = "inside_dhaka" | "outside_dhaka";
export type DeliverySettings = { insideDhakaFee: number; outsideDhakaFee: number; estimatedInsideDays: number; estimatedOutsideDays: number };
export type CouponRule = { id: number; code: string; discountType: "percentage" | "flat"; amount: number; minimumOrderAmount: number; expiresAt?: Date | null; usageLimit?: number | null; usageCount: number; active: boolean };
export class CheckoutValidationError extends Error { constructor(message: string) { super(message); this.name = "CheckoutValidationError"; } }
export function normalizeCheckoutLines(lines: CheckoutLine[]) {
  if (!lines.length) throw new CheckoutValidationError("Your bag is empty.");
  const merged = new Map<string, CheckoutLine>();
  for (const line of lines) { if (!Number.isInteger(line.quantity) || line.quantity < 1) throw new CheckoutValidationError("Each item quantity must be at least one."); const key = `${line.productSlug}:${line.variantSize}`; const current = merged.get(key); merged.set(key, { ...line, quantity: (current?.quantity ?? 0) + line.quantity }); }
  if (merged.size > 30) throw new CheckoutValidationError("A checkout may contain up to 30 distinct variants.");
  return Array.from(merged.values());
}
export function deliveryFor(zone: DeliveryZone, settings: DeliverySettings) { return zone === "inside_dhaka" ? { fee: settings.insideDhakaFee, days: settings.estimatedInsideDays } : { fee: settings.outsideDhakaFee, days: settings.estimatedOutsideDays }; }
export function discountFor(subtotal: number, coupon?: CouponRule | null, now = new Date()) {
  if (!coupon) return { amount: 0, code: undefined as string | undefined };
  if (!coupon.active) throw new CheckoutValidationError("This coupon is no longer active.");
  if (coupon.expiresAt && coupon.expiresAt.getTime() <= now.getTime()) throw new CheckoutValidationError("This coupon has expired.");
  if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usageCount >= coupon.usageLimit) throw new CheckoutValidationError("This coupon has reached its usage limit.");
  if (subtotal < coupon.minimumOrderAmount) throw new CheckoutValidationError(`This coupon requires an order of ৳ ${coupon.minimumOrderAmount.toLocaleString("en-BD")} or more.`);
  const raw = coupon.discountType === "percentage" ? subtotal * (coupon.amount / 100) : coupon.amount;
  return { amount: Math.min(subtotal, Math.max(0, Math.round(raw * 100) / 100)), code: coupon.code };
}
export function estimatedDeliveryDate(days: number, now = new Date()) { const date = new Date(now); date.setDate(date.getDate() + days); return date; }
