/**
 * Design reminder — Aurelia Scent House:
 * Product detail feels like a close reading of an object: media first, clear purchase facts, then material and service detail.
 */
import { Check, ChevronLeft, ChevronRight, Expand, Heart, Minus, Play, Plus, Share2, ShoppingBag, Star, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { toast } from "sonner";
import { ProductCard } from "@/components/ProductCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import type { StoreProduct } from "@/data/catalog";
import { managedProductsOrFallback } from "@/lib/storefrontData";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";

type MediaItem = { type: "image" | "video"; src: string };
const currency = new Intl.NumberFormat("en-BD");

export default function ProductDetail() {
  const [, params] = useRoute<{ slug: string }>("/product/:slug");
  const managedProducts = trpc.storefront.products.useQuery(undefined, { retry: false });
  const products = managedProductsOrFallback(managedProducts.data);
  const product = products.find((item) => item.slug === params?.slug);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { setIsLoading(true); const timer = window.setTimeout(() => setIsLoading(false), 140); return () => window.clearTimeout(timer); }, [params?.slug]);

  if (isLoading || managedProducts.isLoading) return <div className="aurelia-site"><SiteHeader /><ProductSkeleton /><SiteFooter /></div>;
  if (!product) return <ProductNotFound />;
  return <ProductExperience product={product} allProducts={products} />;
}

function ProductExperience({ product, allProducts }: { product: StoreProduct; allProducts: StoreProduct[] }) {
  const media = useMemo<MediaItem[]>(() => [...product.gallery.map((src) => ({ type: "image" as const, src })), ...(product.video ? [{ type: "video" as const, src: product.video }] : [])], [product]);
  const [activeMedia, setActiveMedia] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.variants.find((variant) => variant.size === "50ml")?.size ?? product.variants[0].size);
  const [quantity, setQuantity] = useState(1);
  const [saved, setSaved] = useState(false);
  const [added, setAdded] = useState(false);
  const { add: addCartItem } = useCart();
  const selectedVariant = product.variants.find((variant) => variant.size === selectedSize) ?? product.variants[0];
  const isOut = selectedVariant.stock === 0;
  const related = allProducts.filter((item) => item.slug !== product.slug && (item.category === product.category || item.families.some((family) => product.families.includes(family)))).slice(0, 3);

  const chooseVariant = (size: typeof selectedSize) => { setSelectedSize(size); setQuantity(1); };
  const addToBag = async (buyNow = false) => {
    if (isOut) { toast.error(`${selectedSize} is currently unavailable.`); return; }
    if (quantity > selectedVariant.stock) { toast.error(`Only ${selectedVariant.stock} units are available in ${selectedSize}.`); return; }
    await addCartItem(product.slug, selectedSize, quantity);
    setAdded(true);
    if (buyNow) toast.success("Your selection is ready for checkout.");
  };
  const copyLink = async () => { try { await navigator.clipboard.writeText(window.location.href); toast.success("Product link copied."); } catch { toast.error("Copying is not available in this browser."); } };

  return <div className="aurelia-site product-page"><SiteHeader /><main><div className="product-breadcrumb"><Link href="/shop">Shop</Link><span>/</span><Link href={`/shop?category=${product.category}`}>{product.category}</Link><span>/</span><b>{product.name}</b></div><section className="detail-hero"><ProductGallery media={media} active={activeMedia} setActive={setActiveMedia} onFullscreen={() => setFullscreen(true)} /><div className="detail-purchase"><p className="eyebrow">{product.brand.toUpperCase()} · {product.category.toUpperCase()}</p><h1>{product.name}</h1><p className="detail-family">{product.family}</p><div className="detail-review-summary">{product.rating ? <><Star size={15} fill="currentColor" /><strong>{product.rating}</strong><span>{product.reviewCount} verified reviews</span></> : <><span className="review-pending-dot" />No verified reviews yet</>}</div><div className="detail-price"><strong>৳ {currency.format(selectedVariant.price)}</strong>{selectedVariant.originalPrice && <del>৳ {currency.format(selectedVariant.originalPrice)}</del>}{selectedVariant.originalPrice && <small>Save ৳ {currency.format(selectedVariant.originalPrice - selectedVariant.price)}</small>}</div><div className="detail-stock"><span className={isOut ? "is-out" : ""}>{isOut ? "Out of stock" : `${selectedVariant.stock} available`}</span><em>SKU {selectedVariant.sku}</em></div><div className="variant-picker"><div><span>Choose size</span><small>{selectedSize}</small></div><div className="variant-picker__options">{product.variants.map((variant) => <button className={selectedSize === variant.size ? "is-selected" : ""} disabled={variant.stock === 0} onClick={() => chooseVariant(variant.size)} key={variant.size}><b>{variant.size}</b><span>৳ {currency.format(variant.price)}</span>{variant.stock === 0 && <i>Unavailable</i>}</button>)}</div></div><div className="detail-buy-area"><div className="quantity-picker"><button disabled={quantity === 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Reduce quantity"><Minus size={15} /></button><span>{quantity}</span><button disabled={isOut || quantity >= selectedVariant.stock} onClick={() => setQuantity((value) => Math.min(selectedVariant.stock, value + 1))} aria-label="Increase quantity"><Plus size={15} /></button></div><button className="detail-add-button" disabled={isOut} onClick={() => addToBag()}>{isOut ? "Unavailable" : added ? "Added to bag" : "Add to bag"}<ShoppingBag size={16} /></button><button className="detail-buy-button" disabled={isOut} onClick={() => addToBag(true)}>Buy now</button></div><div className="detail-utility"><button className={saved ? "is-saved" : ""} onClick={() => { setSaved((value) => !value); toast.success(saved ? "Removed from saved scents." : "Saved to your wishlist."); }}><Heart size={16} fill={saved ? "currentColor" : "none"} />{saved ? "Saved" : "Save to wishlist"}</button><button onClick={copyLink}><Share2 size={16} />Copy link</button><button onClick={() => toast("Social sharing will be available shortly.")}>Share</button></div><p className="detail-shipping"><Check size={15} />Complimentary delivery on this item. Returns accepted within 7 days when unopened.</p></div></section><section className="scent-reading"><div className="scent-reading__intro"><p className="eyebrow">THE MATERIAL READING</p><h2>{product.story}</h2></div><div className="notes-grid"><NoteGroup label="Top notes" notes={product.notes.top} /><NoteGroup label="Middle notes" notes={product.notes.middle} /><NoteGroup label="Base notes" notes={product.notes.base} /></div></section><section className="product-facts"><div><span>Fragrance family</span><p>{product.families.join(" · ")}</p></div><div><span>Longevity</span><p>{product.longevity}</p></div><div><span>Sillage</span><p>{product.sillage}</p></div><div><span>Concentration</span><p>{product.concentration}</p></div><div><span>Ingredients</span><p>{product.ingredients}</p></div><div><span>Usage</span><p>{product.usage}</p></div></section><ReviewSection product={product} /><section className="related-products"><div className="related-products__heading"><div><p className="eyebrow">MORE TO CONSIDER</p><h2>Continue the <em>study.</em></h2></div><Link href="/shop">View all fragrances <ChevronRight size={16} /></Link></div><div className="commerce-grid commerce-grid--three">{related.map((item) => <ProductCard key={item.id} product={item} compact />)}</div></section></main>{fullscreen && <FullscreenViewer item={media[activeMedia]} close={() => setFullscreen(false)} next={() => setActiveMedia((value) => (value + 1) % media.length)} previous={() => setActiveMedia((value) => (value - 1 + media.length) % media.length)} />}<SiteFooter /></div>;
}

function ProductGallery({ media, active, setActive, onFullscreen }: { media: MediaItem[]; active: number; setActive: (index: number) => void; onFullscreen: () => void }) {
  return <div className="detail-gallery"><div className="detail-gallery__thumbs">{media.map((item, index) => <button className={active === index ? "is-active" : ""} onClick={() => setActive(index)} key={`${item.src}-${index}`} aria-label={`Show product ${item.type} ${index + 1}`}>{item.type === "video" ? <span className="video-thumb"><Play size={14} /></span> : <img src={item.src} alt="" loading="lazy" />}</button>)}</div><div className="detail-gallery__main">{media[active].type === "video" ? <video src={media[active].src} controls playsInline poster={media[0].src} /> : <img src={media[active].src} alt="Cypress Veil perfume study" loading="eager" />}<button onClick={onFullscreen} aria-label="View fullscreen"><Expand size={18} /></button></div><div className="detail-gallery__mobile-swipe" aria-label="Swipeable product gallery">{media.map((item, index) => <button onClick={() => setActive(index)} key={`${item.src}-mobile`} className={active === index ? "is-active" : ""}>{item.type === "video" ? <span><Play size={22} />Product film</span> : <img src={item.src} alt="" loading="lazy" />}</button>)}</div></div>;
}

function NoteGroup({ label, notes }: { label: string; notes: string[] }) { return <div className="note-group"><span>{label}</span><p>{notes.join(" · ")}</p></div>; }

function ReviewSection({ product }: { product: StoreProduct }) { return <section className="review-section"><div><p className="eyebrow">CUSTOMER REVIEWS</p><h2>{product.rating ? `${product.rating} / 5` : "Waiting for the first verified review."}</h2><p>{product.rating ? `${product.reviewCount} verified customer reviews are available for this fragrance.` : "Reviews appear here only after a verified purchaser has received the product."}</p></div><div className="review-section__eligibility"><span>Have you purchased this scent?</span><p>Sign in to check your eligibility to leave a verified review and attach your own images.</p><button onClick={() => toast("Sign-in will be available shortly; eligibility is required before review submission.")}>Sign in to review</button></div></section>; }

function FullscreenViewer({ item, close, previous, next }: { item: MediaItem; close: () => void; previous: () => void; next: () => void }) { return <div className="media-lightbox" role="dialog" aria-modal="true" aria-label="Fullscreen product media"><button className="media-lightbox__close" onClick={close} aria-label="Close fullscreen viewer"><X size={22} /></button><button className="media-lightbox__previous" onClick={previous} aria-label="Previous media"><ChevronLeft size={26} /></button>{item.type === "video" ? <video src={item.src} controls autoPlay playsInline /> : <img src={item.src} alt="Fullscreen product media" />}<button className="media-lightbox__next" onClick={next} aria-label="Next media"><ChevronRight size={26} /></button></div>; }

function ProductSkeleton() { return <main className="product-skeleton"><div /><div><i /><i /><i /><i /></div></main>; }

function ProductNotFound() { return <div className="aurelia-site"><SiteHeader /><main className="product-not-found"><p className="eyebrow">NOT FOUND</p><h1>This scent has moved <em>out of view.</em></h1><p>It may be archived, or the link may be incomplete. The collection is still close by.</p><Link href="/shop">Return to the shop</Link></main><SiteFooter /></div>; }
