/**
 * Design reminder — Aurelia Scent House:
 * Catalog data supports a quiet, useful product journey. It offers product facts and material descriptions without invented customer reviews or testimonials.
 */
export type FragranceFamily = "Woody" | "Floral" | "Fresh" | "Oriental" | "Citrus" | "Fruity" | "Musky" | "Spicy";
export type ProductCategory = "Men" | "Women" | "Unisex" | "Attar" | "Gift Sets";
export type ProductGender = "Men" | "Women" | "Unisex";
export type Variant = { size: "30ml" | "50ml" | "100ml"; price: number; originalPrice?: number; sku: string; stock: number };

export type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: ProductCategory;
  gender: ProductGender;
  family: string;
  families: FragranceFamily[];
  price: number;
  originalPrice?: number;
  image: string;
  hoverImage: string;
  gallery: string[];
  video?: string;
  badge?: string;
  tone: "cypress" | "rose" | "ink" | "stone";
  stock: number;
  rating?: number;
  reviewCount?: number;
  variants: Variant[];
  featuredRank: number;
  isNew?: boolean;
  notes: { top: string[]; middle: string[]; base: string[] };
  longevity: string;
  sillage: string;
  concentration: string;
  ingredients: string;
  usage: string;
  story: string;
};

export type StoreCategory = { title: ProductCategory; note: string; image: string; position: "left" | "center" | "right" };

const media = {
  cypress: "/manus-storage/aurelia-vetiver_6e276ea9.jpg",
  iris: "/manus-storage/aurelia-iris_c0ff0b90.jpg",
  hero: "/manus-storage/aurelia-hero_81789348.jpg",
  ingredient: "/manus-storage/aurelia-ingredient-study_98925c67.jpg",
  amber: "/manus-storage/product-amber-cinder_d25f2c1e.jpg",
  fig: "/manus-storage/product-fig-salt_59b1634b.jpg",
  narcissus: "/manus-storage/product-narcissus_d3274a46.jpg",
  rose: "/manus-storage/product-smoked-rose_e6a6354d.jpg",
  pomelo: "/manus-storage/product-pomelo_492f5c97.jpg",
  men: "/manus-storage/category-men_84c086f8.jpg",
  women: "/manus-storage/category-women_48a886a5.jpg",
  unisex: "/manus-storage/category-unisex_8143bed6.jpg",
  attar: "/manus-storage/category-attar_f92a84e5.jpg",
  gift: "/manus-storage/category-gift_dd0c39e6.jpg",
};

const coreVariants = (prefix: string, price: number, stock: number): Variant[] => [
  { size: "30ml", price: Math.round(price * 0.68 / 50) * 50, sku: `${prefix}-30`, stock: Math.max(0, Math.floor(stock * 0.65)) },
  { size: "50ml", price, sku: `${prefix}-50`, stock },
  { size: "100ml", price: Math.round(price * 1.7 / 50) * 50, sku: `${prefix}-100`, stock: Math.max(0, Math.floor(stock * 0.4)) },
];

export const productCatalog: StoreProduct[] = [
  { id: "cypress-veil", slug: "cypress-veil", name: "Cypress Veil", brand: "Aurelia", category: "Men", gender: "Men", family: "Woody · green · mineral", families: ["Woody", "Fresh", "Citrus"], price: 4800, originalPrice: 5400, image: media.cypress, hoverImage: media.hero, gallery: [media.cypress, media.hero, media.men, media.ingredient], video: "/manus-storage/cypress-veil-product-film_7b2b0513.mp4", badge: "House edit", tone: "cypress", stock: 12, variants: coreVariants("AUR-CV", 4800, 12), featuredRank: 1, notes: { top: ["Bergamot", "Juniper", "Green mandarin"], middle: ["Cypress sap", "Black tea", "Violet leaf"], base: ["Cedar", "Musk", "Mineral amber"] }, longevity: "6–8 hours", sillage: "Close to moderate", concentration: "Eau de parfum", ingredients: "Alcohol denat., parfum, bergamot oil, cypress leaf extract, tea accord, cedarwood oil, linalool, limonene.", usage: "Mist once at the neck and once at the wrist. Let the composition settle before layering.", story: "A clean vertical of resinous green, brightened by a short-lived citrus opening and softened with the paper-dry quality of black tea." },
  { id: "amber-cinder", slug: "amber-cinder", name: "Amber Cinder", brand: "Aurelia", category: "Men", gender: "Men", family: "Amber · cedar · smoke", families: ["Oriental", "Woody", "Spicy"], price: 5100, originalPrice: 5800, image: media.amber, hoverImage: media.men, gallery: [media.amber, media.men, media.ingredient], badge: "-12%", tone: "ink", stock: 7, variants: coreVariants("AUR-AC", 5100, 7), featuredRank: 2, notes: { top: ["Black pepper", "Orange peel"], middle: ["Burnt cedar", "Labdanum"], base: ["Amber", "Vanilla", "Smoke accord"] }, longevity: "7–9 hours", sillage: "Moderate", concentration: "Eau de parfum", ingredients: "Alcohol denat., parfum, amber accord, cedarwood oil, black pepper oil, coumarin.", usage: "Apply to pulse points in the evening or on cool days.", story: "Warm resin and dry cedar are held in a calm, low-burning composition." },
  { id: "iris-afterlight", slug: "iris-afterlight", name: "Iris Afterlight", brand: "Atelier Numa", category: "Women", gender: "Women", family: "Floral · tea · musk", families: ["Floral", "Musky", "Fresh"], price: 4600, image: media.iris, hoverImage: media.women, gallery: [media.iris, media.women, media.ingredient], tone: "rose", stock: 9, variants: coreVariants("NUM-IA", 4600, 9), featuredRank: 3, notes: { top: ["Pear", "Violet leaf"], middle: ["Iris", "Black tea"], base: ["Skin musk", "Pale woods"] }, longevity: "5–7 hours", sillage: "Soft", concentration: "Eau de parfum", ingredients: "Alcohol denat., parfum, iris absolute, tea accord, linalool, musk accord.", usage: "Wear on the inside of the elbows and at the collarbone.", story: "A quiet floral built around the powdery clarity of iris and the soft warmth of skin." },
  { id: "fig-and-salt", slug: "fig-and-salt", name: "Fig & Salt", brand: "Aurelia", category: "Unisex", gender: "Unisex", family: "Fig leaf · mineral · cedar", families: ["Fresh", "Fruity", "Woody"], price: 4300, originalPrice: 4900, image: media.fig, hoverImage: media.unisex, gallery: [media.fig, media.unisex, media.ingredient], badge: "-10%", tone: "stone", stock: 16, variants: coreVariants("AUR-FS", 4300, 16), featuredRank: 4, notes: { top: ["Fig leaf", "Sea salt"], middle: ["Coconut water", "Violet"], base: ["Cedar", "Driftwood"] }, longevity: "5–6 hours", sillage: "Close", concentration: "Eau de parfum", ingredients: "Alcohol denat., parfum, fig leaf accord, mineral salt accord, cedarwood oil.", usage: "Mist over bare skin after showering for a closer trail.", story: "Green fig leaves and a mineral breeze held against dry, sun-warmed wood." },
  { id: "narcissus-paper", slug: "narcissus-paper", name: "Narcissus Paper", brand: "Veilworks", category: "Women", gender: "Women", family: "Narcissus · paper · skin", families: ["Floral", "Musky"], price: 4950, image: media.narcissus, hoverImage: media.women, gallery: [media.narcissus, media.women, media.ingredient], badge: "New", tone: "stone", stock: 6, variants: coreVariants("VEI-NP", 4950, 6), featuredRank: 5, isNew: true, notes: { top: ["Aldehydes", "Lemon leaf"], middle: ["Narcissus", "White tea"], base: ["Paper accord", "Musk"] }, longevity: "6–7 hours", sillage: "Soft", concentration: "Eau de parfum", ingredients: "Alcohol denat., parfum, narcissus accord, aldehydes, musk accord.", usage: "Apply lightly to the nape and wrists.", story: "A flower pressed inside a book: clean paper, a trace of pollen, and skin warmth." },
  { id: "smoked-rose", slug: "smoked-rose", name: "Smoked Rose", brand: "Atelier Numa", category: "Women", gender: "Women", family: "Rose absolute · resin · wood", families: ["Floral", "Oriental", "Spicy"], price: 5200, image: media.rose, hoverImage: media.women, gallery: [media.rose, media.women, media.ingredient], badge: "New", tone: "rose", stock: 5, variants: coreVariants("NUM-SR", 5200, 5), featuredRank: 6, isNew: true, notes: { top: ["Saffron", "Pink pepper"], middle: ["Rose absolute", "Incense"], base: ["Myrrh", "Patchouli", "Cedar"] }, longevity: "7–8 hours", sillage: "Moderate", concentration: "Eau de parfum", ingredients: "Alcohol denat., parfum, rose absolute, incense accord, patchouli oil, eugenol.", usage: "Use one mist only; this composition opens generously.", story: "Rose stripped of sweetness and held in the shadow of smoke and resin." },
  { id: "pomelo-moss", slug: "pomelo-moss", name: "Pomelo Moss", brand: "Aurelia", category: "Unisex", gender: "Unisex", family: "Pomelo · moss · soft amber", families: ["Citrus", "Fresh", "Woody"], price: 4700, image: media.pomelo, hoverImage: media.unisex, gallery: [media.pomelo, media.unisex, media.ingredient], badge: "New", tone: "cypress", stock: 14, variants: coreVariants("AUR-PM", 4700, 14), featuredRank: 7, isNew: true, notes: { top: ["Pomelo", "Bitter orange"], middle: ["Moss", "Mate"], base: ["Amber", "Vetiver"] }, longevity: "6–7 hours", sillage: "Moderate", concentration: "Eau de parfum", ingredients: "Alcohol denat., parfum, pomelo oil, moss accord, vetiver oil, limonene.", usage: "Apply after dressing for a brighter first impression.", story: "A generously bitter citrus that dries down into cool moss and a muted amber glow." },
  { id: "resin-quiet", slug: "resin-quiet", name: "Resin Quiet", brand: "Aurelia", category: "Attar", gender: "Unisex", family: "Resin · sandalwood · cardamom", families: ["Oriental", "Spicy", "Woody"], price: 3600, image: media.attar, hoverImage: media.ingredient, gallery: [media.attar, media.ingredient, media.unisex], tone: "ink", stock: 4, variants: [{ size: "30ml", price: 3600, sku: "AUR-RQ-30", stock: 4 }, { size: "50ml", price: 5200, sku: "AUR-RQ-50", stock: 2 }, { size: "100ml", price: 8700, sku: "AUR-RQ-100", stock: 0 }], featuredRank: 8, notes: { top: ["Cardamom", "Saffron"], middle: ["Frankincense", "Rosewood"], base: ["Sandalwood", "Amber resin"] }, longevity: "8–10 hours", sillage: "Close", concentration: "Perfume oil", ingredients: "Jojoba oil, perfume concentrate, sandalwood oil, frankincense resinoid, cardamom oil.", usage: "Roll lightly across wrists; do not rub. A small amount is enough.", story: "A close-wearing perfume oil that trades volume for warmth and lasting texture." },
  { id: "gift-of-quiet", slug: "gift-of-quiet", name: "Gift of Quiet", brand: "Aurelia", category: "Gift Sets", gender: "Unisex", family: "Two discovery scents · note card", families: ["Fresh", "Floral", "Woody"], price: 6800, originalPrice: 7500, image: media.gift, hoverImage: media.hero, gallery: [media.gift, media.hero, media.ingredient], badge: "Limited", tone: "stone", stock: 0, variants: [{ size: "30ml", price: 6800, originalPrice: 7500, sku: "AUR-GQ-SET", stock: 0 }, { size: "50ml", price: 9500, sku: "AUR-GQ-50", stock: 0 }, { size: "100ml", price: 15500, sku: "AUR-GQ-100", stock: 0 }], featuredRank: 9, notes: { top: ["Bergamot", "Pear"], middle: ["Iris", "Cypress"], base: ["Cedar", "Skin musk"] }, longevity: "Varies by scent", sillage: "Close to moderate", concentration: "Eau de parfum", ingredients: "Two 30ml perfume studies, presentation box, blank note card.", usage: "Choose a scent for the morning, and another for the evening.", story: "A small box for a person who prefers objects with a point of view." },
  { id: "inked-neroli", slug: "inked-neroli", name: "Inked Neroli", brand: "Veilworks", category: "Unisex", gender: "Unisex", family: "Neroli · ink · cedar", families: ["Citrus", "Woody", "Musky"], price: 4550, image: media.men, hoverImage: media.pomelo, gallery: [media.men, media.pomelo, media.ingredient], tone: "ink", stock: 11, variants: coreVariants("VEI-IN", 4550, 11), featuredRank: 10, notes: { top: ["Neroli", "Petitgrain"], middle: ["Ink accord", "Orange blossom"], base: ["Cedar", "White musk"] }, longevity: "6–8 hours", sillage: "Moderate", concentration: "Eau de parfum", ingredients: "Alcohol denat., parfum, neroli oil, petitgrain oil, cedarwood oil, linalool.", usage: "Mist behind ears for a clear, close projection.", story: "Citrus light darkened by paper, ink, and a slender cedar line." },
];

export const storefrontNav = ["Shop", "Men", "Women", "Unisex", "Attar", "Gift Sets"];
export const storeCategories: StoreCategory[] = [
  { title: "Men", note: "Structure, depth, and quiet confidence.", image: media.men, position: "left" },
  { title: "Women", note: "Floral studies with a modern pulse.", image: media.women, position: "right" },
  { title: "Unisex", note: "Scent beyond expectation.", image: media.unisex, position: "center" },
  { title: "Attar", note: "Concentrated rituals in miniature.", image: media.attar, position: "left" },
  { title: "Gift Sets", note: "A considered gesture, beautifully kept.", image: media.gift, position: "right" },
];
export const bestSellers = productCatalog.filter((product) => product.featuredRank <= 4);
export const newArrivals = productCatalog.filter((product) => product.isNew);
export const fragranceFamilies: FragranceFamily[] = ["Woody", "Floral", "Fresh", "Oriental", "Citrus", "Fruity", "Musky", "Spicy"];
export const footerGroups = [
  { title: "Shop", links: ["Men", "Women", "Unisex", "Attar", "Gift Sets"] },
  { title: "Customer Care", links: ["Contact", "FAQ", "Shipping", "Returns", "Order Tracking"] },
  { title: "Company", links: ["About", "Privacy Policy", "Terms & Conditions"] },
];
export const categoryLinks = ["Men", "Women", "Unisex", "Attar", "Gift Sets"];
