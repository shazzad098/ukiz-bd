/** Compact off-canvas bag summary shared by the storefront and dedicated cart page. */
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Link } from "wouter";
import { productCatalog } from "@/data/catalog";
import { useCart } from "@/contexts/CartContext";

const money = new Intl.NumberFormat("en-BD");
export function CartDrawer() {
  const { lines, open, setOpen, update, remove, subtotal } = useCart();
  return <div className={`cart-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}><div className="cart-drawer__scrim" onClick={() => setOpen(false)} /><aside><header><span>Your bag</span><button onClick={() => setOpen(false)} aria-label="Close cart"><X size={20} /></button></header><div className="cart-drawer__lines">{lines.length ? lines.map((line) => { const product = productCatalog.find((item) => item.slug === line.productSlug); const variant = product?.variants.find((item) => item.size === line.variantSize); if (!product || !variant) return null; return <article key={line.id}><img src={product.image} alt="" /><div><small>{product.brand}</small><h3>{product.name}</h3><p>{line.variantSize} · ৳ {money.format(variant.price)}</p><div className="cart-line-actions"><button onClick={() => update(line, line.quantity - 1)}><Minus size={13} /></button><span>{line.quantity}</span><button onClick={() => update(line, line.quantity + 1)} disabled={line.quantity >= variant.stock}><Plus size={13} /></button><button className="remove-line" onClick={() => remove(line)}><Trash2 size={14} /></button></div></div></article>; }) : <div className="cart-empty"><ShoppingBag size={28} /><h3>Your bag is waiting.</h3><p>Start with a scent study that feels like yours.</p><Link href="/shop" onClick={() => setOpen(false)}>Browse the collection</Link></div>}</div>{lines.length > 0 && <footer><p><span>Subtotal</span><strong>৳ {money.format(subtotal)}</strong></p><p><span>Delivery</span><strong>Calculated at checkout</strong></p><Link href="/cart" onClick={() => setOpen(false)}>View bag <ShoppingBag size={15} /></Link></footer>}</aside></div>;
}
