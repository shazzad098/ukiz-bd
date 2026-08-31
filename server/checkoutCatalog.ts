/**
 * Authoritative checkout catalog. Prices and initial inventory here are independent of
 * client-submitted data; the database inventory table becomes the mutable source after initialization.
 */
export type CheckoutSize = "30ml" | "50ml" | "100ml";
export type CheckoutCatalogVariant = { size: CheckoutSize; price: number; sku: string; initialStock: number };
export type CheckoutCatalogProduct = { slug: string; name: string; variants: CheckoutCatalogVariant[] };
const core = (prefix: string, price: number, stock: number): CheckoutCatalogVariant[] => [
  { size: "30ml", price: Math.round(price * .68 / 50) * 50, sku: `${prefix}-30`, initialStock: Math.max(0, Math.floor(stock * .65)) },
  { size: "50ml", price, sku: `${prefix}-50`, initialStock: stock },
  { size: "100ml", price: Math.round(price * 1.7 / 50) * 50, sku: `${prefix}-100`, initialStock: Math.max(0, Math.floor(stock * .4)) },
];
export const checkoutCatalog: CheckoutCatalogProduct[] = [
  { slug: "cypress-veil", name: "Cypress Veil", variants: core("AUR-CV", 4800, 12) },
  { slug: "amber-cinder", name: "Amber Cinder", variants: core("AUR-AC", 5100, 7) },
  { slug: "iris-afterlight", name: "Iris Afterlight", variants: core("NUM-IA", 4600, 9) },
  { slug: "fig-and-salt", name: "Fig & Salt", variants: core("AUR-FS", 4300, 16) },
  { slug: "narcissus-paper", name: "Narcissus Paper", variants: core("VEI-NP", 4950, 6) },
  { slug: "smoked-rose", name: "Smoked Rose", variants: core("NUM-SR", 5200, 5) },
  { slug: "pomelo-moss", name: "Pomelo Moss", variants: core("AUR-PM", 4700, 14) },
  { slug: "resin-quiet", name: "Resin Quiet", variants: [{ size: "30ml", price: 3600, sku: "AUR-RQ-30", initialStock: 4 }, { size: "50ml", price: 5200, sku: "AUR-RQ-50", initialStock: 2 }, { size: "100ml", price: 8700, sku: "AUR-RQ-100", initialStock: 0 }] },
  { slug: "gift-of-quiet", name: "Gift of Quiet", variants: [{ size: "30ml", price: 6800, sku: "AUR-GQ-SET", initialStock: 0 }, { size: "50ml", price: 9500, sku: "AUR-GQ-50", initialStock: 0 }, { size: "100ml", price: 15500, sku: "AUR-GQ-100", initialStock: 0 }] },
  { slug: "inked-neroli", name: "Inked Neroli", variants: core("VEI-IN", 4550, 11) },
];
export function checkoutVariant(slug: string, size: string) { return checkoutCatalog.find((product) => product.slug === slug)?.variants.find((variant) => variant.size === size); }
export function checkoutProduct(slug: string) { return checkoutCatalog.find((product) => product.slug === slug); }
