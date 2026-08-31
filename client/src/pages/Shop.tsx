/**
 * Design reminder — Aurelia Scent House:
 * The shop is a calm working index, not a marketplace wall: quiet controls, confident type, and product-led air.
 */
import { Check, ChevronDown, Grid2X2, List, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ProductCard } from "@/components/ProductCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { fragranceFamilies, productCatalog, storefrontNav, type FragranceFamily, type ProductCategory } from "@/data/catalog";

type SortMode = "newest" | "price-low" | "price-high" | "popularity" | "rating";
const perPage = 6;

export default function Shop() {
  const initialParams = new URLSearchParams(window.location.search);
  const initialCategory = initialParams.get("category");
  const [query, setQuery] = useState(() => initialParams.get("q") ?? "");
  const [category, setCategory] = useState<ProductCategory | "All">(() => storefrontNav.includes(initialCategory ?? "") ? initialCategory as ProductCategory : "All");
  const [brand, setBrand] = useState("All");
  const [gender, setGender] = useState("All");
  const [families, setFamilies] = useState<FragranceFamily[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [ratingFilter, setRatingFilter] = useState("All");
  const [maxPrice, setMaxPrice] = useState(9000);
  const [sort, setSort] = useState<SortMode>("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const brands = useMemo(() => ["All", ...Array.from(new Set(productCatalog.map((product) => product.brand)))], []);
  const suggestions = useMemo(() => query.trim().length < 2 ? [] : productCatalog.filter((product) => `${product.name} ${product.brand} ${product.category} ${product.family}`.toLowerCase().includes(query.toLowerCase())).slice(0, 5), [query]);

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    const results = productCatalog.filter((product) => {
      const matchesQuery = !text || `${product.name} ${product.brand} ${product.category} ${product.family} ${product.families.join(" ")}`.toLowerCase().includes(text);
      const matchesCategory = category === "All" || product.category === category;
      const matchesBrand = brand === "All" || product.brand === brand;
      const matchesGender = gender === "All" || product.gender === gender;
      const matchesFamily = families.length === 0 || families.some((family) => product.families.includes(family));
      const matchesPrice = product.price <= maxPrice;
      const matchesAvailability = !inStockOnly || product.stock > 0;
      // Ratings are intentionally only shown when verified data exists; selecting a threshold reveals the dedicated no-results guidance.
      const matchesRating = ratingFilter === "All" || (product.rating !== undefined && product.rating >= Number(ratingFilter));
      return matchesQuery && matchesCategory && matchesBrand && matchesGender && matchesFamily && matchesPrice && matchesAvailability && matchesRating;
    });
    return [...results].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "popularity") return a.featuredRank - b.featuredRank;
      if (sort === "rating") return (b.rating ?? -1) - (a.rating ?? -1);
      return Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)) || a.featuredRank - b.featuredRank;
    });
  }, [brand, category, families, gender, inStockOnly, maxPrice, query, ratingFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageResults = filtered.slice((page - 1) * perPage, page * perPage);
  const toggleFamily = (family: FragranceFamily) => { setFamilies((current) => current.includes(family) ? current.filter((item) => item !== family) : [...current, family]); setPage(1); };
  const resetFilters = () => { setCategory("All"); setBrand("All"); setGender("All"); setFamilies([]); setInStockOnly(false); setRatingFilter("All"); setMaxPrice(9000); setQuery(""); setPage(1); };

  const controls = <aside className="shop-filters" aria-label="Product filters"><div className="shop-filters__title"><span>Filter collection</span><button onClick={resetFilters}>Clear all</button><button className="shop-filters__close" onClick={() => setFiltersOpen(false)} aria-label="Close filters"><X size={17} /></button></div><FilterSelect label="Category" value={category} onChange={(value) => { setCategory(value as ProductCategory | "All"); setPage(1); }} options={["All", ...storefrontNav]} /><FilterSelect label="Brand" value={brand} onChange={(value) => { setBrand(value); setPage(1); }} options={brands} /><FilterSelect label="Gender" value={gender} onChange={(value) => { setGender(value); setPage(1); }} options={["All", "Men", "Women", "Unisex"]} /><div className="filter-group"><span>Price range</span><input type="range" min="3000" max="9000" step="250" value={maxPrice} onChange={(event) => { setMaxPrice(Number(event.target.value)); setPage(1); }} aria-label="Maximum price" /><p>Up to ৳ {new Intl.NumberFormat("en-BD").format(maxPrice)}</p></div><div className="filter-group"><span>Fragrance family</span><div className="filter-checks">{fragranceFamilies.map((family) => <label key={family}><input type="checkbox" checked={families.includes(family)} onChange={() => toggleFamily(family)} /><i>{families.includes(family) && <Check size={11} />}</i>{family}</label>)}</div></div><div className="filter-group"><span>Availability</span><label className="filter-switch"><input type="checkbox" checked={inStockOnly} onChange={() => { setInStockOnly((value) => !value); setPage(1); }} /><i />In stock only</label></div><FilterSelect label="Rating" value={ratingFilter} onChange={(value) => { setRatingFilter(value); setPage(1); }} options={["All", "4", "3"]} /></aside>;

  return <div className="aurelia-site shop-page"><SiteHeader /><main><section className="shop-intro"><p className="eyebrow">THE AURELIA INDEX</p><h1>Find by note, <em>not noise.</em></h1><p>Fragrance studies arranged by character, material, and the way they sit with the day.</p></section><section className="shop-workspace"><div className="shop-search"><Search size={18} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search a scent, material, or house" aria-label="Search products" />{query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={16} /></button>}{suggestions.length > 0 && <div className="search-suggestions">{suggestions.map((product) => <Link href={`/product/${product.slug}`} key={product.id} onClick={() => setQuery("")}><img src={product.image} alt="" /><span><strong>{product.name}</strong><small>{product.brand} · {product.category}</small></span></Link>)}</div>}</div><div className="shop-toolbar"><button className="filter-trigger" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={16} />Filters</button><p><strong>{filtered.length}</strong> studies found</p><label>Sort <select value={sort} onChange={(event) => { setSort(event.target.value as SortMode); setPage(1); }}><option value="newest">Newest</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="popularity">Popularity</option><option value="rating">Rating</option></select><ChevronDown size={14} /></label><div className="view-switch"><button className={view === "grid" ? "is-active" : ""} onClick={() => setView("grid")} aria-label="Grid view"><Grid2X2 size={17} /></button><button className={view === "list" ? "is-active" : ""} onClick={() => setView("list")} aria-label="List view"><List size={18} /></button></div></div><div className="shop-layout">{controls}<div className={`shop-results shop-results--${view}`}>{pageResults.length ? pageResults.map((product) => <ProductCard key={product.id} product={product} />) : <div className="shop-empty"><p className="eyebrow">NO MATCHES YET</p><h2>Try another <em>trail.</em></h2><p>Clear a filter or explore a related collection to find a fragrance with the character you are after.</p><div><button onClick={resetFilters}>Reset filters</button><Link href="/product/cypress-veil">Explore Cypress Veil</Link></div></div>}</div></div>{filtered.length > perPage && <nav className="shop-pagination" aria-label="Pagination"><button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button className={page === number ? "is-active" : ""} onClick={() => setPage(number)} key={number}>{number}</button>)}<button disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>Next</button></nav>}</section></main>{filtersOpen && <div className="filter-drawer"><div className="filter-drawer__scrim" onClick={() => setFiltersOpen(false)} />{controls}</div>}<SiteFooter /></div>;
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) { return <label className="filter-group filter-select"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option value={option} key={option}>{label === "Rating" ? option === "All" ? "All ratings" : `${option}+ verified stars` : option}</option>)}</select><ChevronDown size={14} /></label>; }
