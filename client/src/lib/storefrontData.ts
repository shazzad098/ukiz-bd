import { productCatalog, type FragranceFamily, type StoreProduct, type Variant } from "@/data/catalog";

const fallbackImage = "/manus-storage/aurelia-hero_81789348.jpg";
const allowedFamilies = new Set<FragranceFamily>(["Woody", "Floral", "Fresh", "Oriental", "Citrus", "Fruity", "Musky", "Spicy"]);
const allowedTones = new Set<StoreProduct["tone"]>(["cypress", "rose", "ink", "stone"]);

function list(value?: string | null): string[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
  } catch {
    return [];
  }
}

export function mapManagedProduct(entry: any): StoreProduct {
  const product = entry.product;
  const media = [...(entry.media ?? [])].sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const images = media.filter((item: any) => item.mediaType === "image" && item.url).map((item: any) => item.url as string);
  const variants: Variant[] = (entry.variants ?? []).map((variant: any) => ({
    size: variant.size as Variant["size"],
    price: Number(variant.price),
    originalPrice: variant.originalPrice == null ? undefined : Number(variant.originalPrice),
    sku: variant.sku,
    stock: Number(variant.stock ?? 0),
  }));
  const primaryVariant = variants.find((variant) => variant.size === "50ml") ?? variants[0] ?? { size: "50ml" as const, price: 0, sku: "", stock: 0 };
  const families = list(product.fragranceFamilies).filter((family): family is FragranceFamily => allowedFamilies.has(family as FragranceFamily));
  const tone = allowedTones.has(product.tone) ? product.tone : "stone";

  return {
    id: String(product.id),
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    category: product.categoryName as StoreProduct["category"],
    gender: product.gender as StoreProduct["gender"],
    family: product.familySummary || "Fragrance study",
    families,
    price: primaryVariant.price,
    originalPrice: primaryVariant.originalPrice,
    image: images[0] || fallbackImage,
    hoverImage: images[1] || images[0] || fallbackImage,
    gallery: images.length ? images : [fallbackImage],
    video: media.find((item: any) => item.mediaType === "video")?.url,
    badge: product.badge || undefined,
    tone,
    stock: variants.reduce((total, variant) => total + variant.stock, 0),
    variants,
    featuredRank: Number(product.featuredRank ?? 999),
    isNew: Boolean(product.isNew),
    notes: { top: list(product.notesTop), middle: list(product.notesMiddle), base: list(product.notesBase) },
    longevity: product.longevity || "",
    sillage: product.sillage || "",
    concentration: product.concentration || "",
    ingredients: product.ingredients || "",
    usage: product.usageInstructions || "",
    story: product.story || "",
  };
}

export function managedProductsOrFallback(data: any[] | undefined): StoreProduct[] {
  return data === undefined ? productCatalog : data.filter(Boolean).map(mapManagedProduct);
}
