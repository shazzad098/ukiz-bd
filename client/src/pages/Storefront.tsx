/**
 * Design reminder — Aurelia Scent House:
 * The public shop unfolds like an exhibition: campaign image, focused discovery, chosen products, material story, then service-oriented closure.
 */
import { ArrowDown, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Newsletter } from "@/components/Newsletter";
import { ProductCard } from "@/components/ProductCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { bestSellers, newArrivals, productCatalog, storeCategories, type StoreProduct } from "@/data/catalog";
import { trpc } from "@/lib/trpc";

const list = (value?: string | null): string[] => { try { const parsed = JSON.parse(value || "[]"); return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []; } catch { return []; } };

function SectionHeading({ overline, title, copy, action }: { overline: string; title: React.ReactNode; copy?: string; action?: string }) {
  return <div className="store-section-heading"><div><p className="eyebrow">{overline}</p><h2>{title}</h2></div>{copy && <p>{copy}</p>}{action && <button className="text-link" onClick={() => toast(`${action} will be available shortly.`)}>{action}<ArrowRight size={17} /></button>}</div>;
}

export default function Storefront() {
  const homepage = trpc.storefront.homepageSlots.useQuery(undefined, { retry: false });
  const managedProducts = trpc.storefront.products.useQuery(undefined, { retry: false });
  const managedCategories = trpc.storefront.categories.useQuery(undefined, { retry: false });
  const slot = (slotKey: string) => homepage.data?.find((item) => item.slotKey === slotKey && item.enabled);
  const hero = slot("hero"); const campaign = slot("campaign"); const story = slot("story");
  const bestSellerSlot = homepage.data?.find((item) => item.slotKey === "best-sellers");
  const newArrivalSlot = homepage.data?.find((item) => item.slotKey === "new-arrivals");
  const featuredSlot = slot("featured-products");
  const liveProducts: StoreProduct[] = managedProducts.data?.length ? managedProducts.data.map((entry: any) => {
    const product = entry.product; const media = [...entry.media].sort((a: any, b: any) => a.sortOrder - b.sortOrder); const images = media.filter((item: any) => item.mediaType === "image").map((item: any) => item.url); const variants = entry.variants.map((variant: any) => ({ size: variant.size, price: Number(variant.price), originalPrice: variant.originalPrice ? Number(variant.originalPrice) : undefined, sku: variant.sku, stock: variant.stock }));
    const primaryVariant = variants.find((variant: any) => variant.size === "50ml") || variants[0];
    return { id: String(product.id), slug: product.slug, name: product.name, brand: product.brand, category: product.categoryName, gender: product.gender, family: product.familySummary || "Fragrance study", families: list(product.fragranceFamilies), price: primaryVariant?.price ?? 0, originalPrice: primaryVariant?.originalPrice, image: images[0] || "/manus-storage/aurelia-hero_81789348.jpg", hoverImage: images[1] || images[0] || "/manus-storage/aurelia-hero_81789348.jpg", gallery: images.length ? images : ["/manus-storage/aurelia-hero_81789348.jpg"], video: media.find((item: any) => item.mediaType === "video")?.url, badge: product.badge || undefined, tone: product.tone, stock: variants.reduce((total: number, variant: any) => total + variant.stock, 0), variants, featuredRank: product.featuredRank, isNew: product.isNew, notes: { top: list(product.notesTop), middle: list(product.notesMiddle), base: list(product.notesBase) }, longevity: product.longevity || "", sillage: product.sillage || "", concentration: product.concentration || "", ingredients: product.ingredients || "", usage: product.usageInstructions || "", story: product.story || "" } as StoreProduct;
  }) : productCatalog;
  const liveCategories = managedCategories.data?.length ? managedCategories.data.map((category: any, index: number) => ({ title: category.name, note: category.description || "Explore the collection.", image: category.imageUrl || "/manus-storage/aurelia-hero_81789348.jpg", position: (["left", "right", "center"] as const)[index % 3] })) : storeCategories;
  const liveBestSellers = liveProducts.filter((product) => product.featuredRank <= 4);
  const liveNewArrivals = liveProducts.filter((product) => product.isNew);
  const featuredProduct = liveProducts.find((product) => product.slug === featuredSlot?.productSlug) || liveBestSellers[0] || bestSellers[0];
  return (
    <div className="aurelia-site">
      <SiteHeader />
      <main>
        <section className="store-hero">
          <img src={hero?.imageUrl || "/manus-storage/aurelia-hero_81789348.jpg"} alt={hero?.title || "UKIZ perfume bottle on a sculptural limestone plinth"} />
          <div className="store-hero__wash" />
          <div className="store-hero__content"><p className="eyebrow">{hero?.eyebrow || "UKIZ / THE FIRST EDITION"}</p><h1>{hero?.title || <>Find a fragrance that keeps its <em>own counsel.</em></>}</h1><p>{hero?.body || "Modern perfume for the moments that do not need to announce themselves."}</p><div className="hero-actions"><button className="solid-link" onClick={() => hero?.ctaHref ? window.location.assign(hero.ctaHref) : document.getElementById("best-sellers")?.scrollIntoView({ behavior: "smooth" })}>{hero?.ctaLabel || "Shop collection"} <ArrowDown size={17} /></button><button className="text-link text-link--ink" onClick={() => document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" })}>Discover your scent <ArrowRight size={17} /></button></div></div>
          <div className="store-hero__detail"><span>01</span><p><strong>{featuredProduct?.name || "Cypress Veil"}</strong><br />{featuredProduct?.family || "Bergamot / sap / quiet woods"}</p></div>
        </section>

        <section className="assurance-row" aria-label="Store benefits"><p><Sparkles size={15} />Original perfume studies</p><p>Complimentary delivery over ৳3,500</p><p>Gift wrapping, on request</p><p>Secure checkout</p></section>

        <section className="category-section" id="categories"><SectionHeading overline="DISCOVER BY MOOD" title={<>A place for every <em>presence.</em></>} copy="Five ways into the collection, shaped for different rhythms, rooms, and rituals." /><div className="category-grid">{liveCategories.map((category, index) => <button key={category.title} className={`category-card category-card--${category.position} ${index === 2 ? "category-card--feature" : ""}`} onClick={() => toast(`Exploring the ${category.title} collection.`)}><img src={category.image} alt="" /><span className="category-card__wash" /><span className="category-card__content"><small>0{index + 1}</small><strong>{category.title}</strong><em>{category.note}</em><i>Explore <ArrowRight size={15} /></i></span></button>)}</div></section>

        {bestSellerSlot?.enabled !== false && <section className="product-section" id="best-sellers"><SectionHeading overline={bestSellerSlot?.eyebrow || "THE HOUSE EDIT"} title={bestSellerSlot?.title || <>Bestsellers, chosen <em>often.</em></>} copy={bestSellerSlot?.body || "Cult favourites with a soft trail and a clear point of view."} action="View all fragrances" /><div className="commerce-grid commerce-grid--four">{(liveBestSellers.length ? liveBestSellers : bestSellers).map((product) => <ProductCard key={product.id} product={product} />)}</div></section>}

        <section className="campaign-banner" id="campaign"><div className="campaign-banner__copy"><p className="eyebrow eyebrow--rose">{campaign?.eyebrow || "THE GIFT EDIT"}</p><h2>{campaign?.title || <>A small occasion, <em>beautifully held.</em></>}</h2><p>{campaign?.body || "Choose two personal scents, presented in an archival box with a note from the house."}</p><button className="solid-link solid-link--light" onClick={() => campaign?.ctaHref ? window.location.assign(campaign.ctaHref) : toast("The Gift Edit will be available shortly.")}>{campaign?.ctaLabel || "Explore gift sets"} <ArrowRight size={17} /></button></div><div className="campaign-banner__art"><span>02</span><img src={campaign?.imageUrl || "/manus-storage/category-gift_dd0c39e6.jpg"} alt={campaign?.title || "UKIZ fragrance gift set"} /></div></section>

        {newArrivalSlot?.enabled !== false && <section className="arrival-section"><SectionHeading overline={newArrivalSlot?.eyebrow || "JUST ARRIVED"} title={newArrivalSlot?.title || <>New studies for the <em>season.</em></>} copy={newArrivalSlot?.body || undefined} action="See new arrivals" /><div className="commerce-grid commerce-grid--three">{(liveNewArrivals.length ? liveNewArrivals : newArrivals).map((product) => <ProductCard key={product.id} product={product} compact />)}</div></section>}

        <section className="brand-story"><div className="brand-story__image"><img src={story?.imageUrl || "/manus-storage/aurelia-ingredient-study_98925c67.jpg"} alt={story?.title || "Raw perfume materials"} /></div><div className="brand-story__copy"><p className="eyebrow">{story?.eyebrow || "THE UKIZ METHOD"}</p><h2>{story?.title || <>Made slowly enough to mean <em>something.</em></>}</h2><p>{story?.body || "Our fragrances begin with tangible materials and the quiet gestures around them. We choose notes that develop with patience, making a scent that feels not louder, but closer."}</p><button className="outline-link" onClick={() => story?.ctaHref ? window.location.assign(story.ctaHref) : toast("Our approach will be available shortly.")}>{story?.ctaLabel || "Read our approach"} <ArrowRight size={17} /></button></div></section>

        <Newsletter />
      </main>
      <SiteFooter />
    </div>
  );
}
