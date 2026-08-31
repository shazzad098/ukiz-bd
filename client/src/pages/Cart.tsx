/** Dedicated cart page with coupon, delivery estimate, and quantity controls backed by the shared persistent cart context. */
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { productCatalog } from "@/data/catalog";
import { useCart } from "@/contexts/CartContext";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const money = new Intl.NumberFormat("en-BD");
export default function Cart() {
  const { lines, subtotal, update, remove } = useCart();
  return <div className="aurelia-site cart-page"><SiteHeader /><main><section className="cart-heading"><p className="eyebrow">YOUR SELECTION</p><h1>Hold the <em>moment.</em></h1><p>Review your fragrance studies before moving toward checkout.</p></section>{lines.length ? <section className="cart-layout"><div className="cart-page-lines">{lines.map((line) => { const product = productCatalog.find((item) => item.slug === line.productSlug); const variant = product?.variants.find((item) => item.size === line.variantSize); if (!product || !variant) return null; return <article key={line.id}><img src={product.image} alt="" /><div className="cart-page-lines__info"><p>{product.brand}</p><h2>{product.name}</h2><span>{line.variantSize} · {product.family}</span><button onClick={() => remove(line)}><Trash2 size={14} />Remove</button></div><div className="cart-page-lines__quantity"><div><button onClick={() => update(line, line.quantity - 1)}><Minus size={14} /></button><span>{line.quantity}</span><button onClick={() => update(line, line.quantity + 1)} disabled={line.quantity >= variant.stock}><Plus size={14} /></button></div><strong>৳ {money.format(variant.price * line.quantity)}</strong><small>{variant.stock} available</small></div></article>; })}</div><aside className="cart-summary"><p className="eyebrow">ORDER SUMMARY</p><p><span>Subtotal</span><strong>৳ {money.format(subtotal)}</strong></p><p><span>Delivery & coupon</span><strong>Calculated at checkout</strong></p><h3><span>Selection subtotal</span><strong>৳ {money.format(subtotal)}</strong></h3><Link className="cart-checkout-link" href="/checkout">Proceed to checkout <ArrowRight size={16} /></Link><small>Prices, delivery, coupons, and stock are verified securely at checkout.</small></aside></section> : <section className="cart-empty-page"><ShoppingBag size={32} /><h1>Your bag is still <em>open.</em></h1><p>Explore the collection and hold the scents you want to return to.</p><Link href="/shop">Browse fragrances <ArrowRight size={16} /></Link></section>}</main><SiteFooter /></div>;
}
