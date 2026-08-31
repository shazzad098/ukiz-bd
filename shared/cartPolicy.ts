export type GuestCartLine = { productSlug: string; variantSize: "30ml" | "50ml" | "100ml"; quantity: number };
export function parseGuestCart(raw: string | null): GuestCartLine[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((line): line is GuestCartLine => Boolean(line) && typeof line === "object" && typeof (line as GuestCartLine).productSlug === "string" && ["30ml", "50ml", "100ml"].includes((line as GuestCartLine).variantSize) && Number.isInteger((line as GuestCartLine).quantity) && (line as GuestCartLine).quantity > 0);
  } catch { return []; }
}
export function mergeVariantQuantity(existingQuantity: number, incomingQuantity: number, stock: number) { return Math.min(Math.max(stock, 0), Math.max(existingQuantity, 0) + Math.max(incomingQuantity, 0)); }
