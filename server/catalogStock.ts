/** Authoritative in-app inventory map used by server procedures so the client cannot increase cart quantity beyond the configured variant stock. */
const stockByVariant: Record<string, Record<string, number>> = {
  "cypress-veil": { "30ml": 7, "50ml": 12, "100ml": 4 },
  "amber-cinder": { "30ml": 4, "50ml": 7, "100ml": 2 },
  "iris-afterlight": { "30ml": 5, "50ml": 9, "100ml": 3 },
  "fig-and-salt": { "30ml": 10, "50ml": 16, "100ml": 6 },
  "narcissus-paper": { "30ml": 3, "50ml": 6, "100ml": 2 },
  "smoked-rose": { "30ml": 3, "50ml": 5, "100ml": 2 },
  "pomelo-moss": { "30ml": 9, "50ml": 14, "100ml": 5 },
  "resin-quiet": { "30ml": 4, "50ml": 2, "100ml": 0 },
  "gift-of-quiet": { "30ml": 0, "50ml": 0, "100ml": 0 },
  "inked-neroli": { "30ml": 7, "50ml": 11, "100ml": 4 },
};

export function getVariantStock(productSlug: string, variantSize: string) {
  return stockByVariant[productSlug]?.[variantSize] ?? 0;
}

export function assertQuantityAvailable(productSlug: string, variantSize: string, quantity: number) {
  const stock = getVariantStock(productSlug, variantSize);
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error("Quantity must be at least one.");
  if (stock === 0) throw new Error("This product variant is currently unavailable.");
  if (quantity > stock) throw new Error(`Only ${stock} unit${stock === 1 ? "" : "s"} are available for this variant.`);
  return stock;
}
