/**
 * Design reminder — Aurelia Scent House:
 * A refined retail header balances clear shop navigation with compact service controls and a calm editorial wordmark.
 */
import { Heart, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { storefrontNav } from "@/data/catalog";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [, setLocation] = useLocation();
  const { itemCount, setOpen } = useCart();
  const managedCategories = trpc.storefront.categories.useQuery(undefined, { retry: false });
  const navigation = managedCategories.data === undefined ? storefrontNav : ["Shop", ...managedCategories.data.map((category: any) => category.name)];
  const goTo = (label: string) => { setMenuOpen(false); if (label === "Shop") { setLocation("/shop"); return; } setLocation(`/shop?category=${encodeURIComponent(label)}`); };
  const submitSearch = (event: React.FormEvent) => { event.preventDefault(); if (!query.trim()) { toast.error("Enter a scent, note, or fragrance family to search."); return; } setLocation(`/shop?q=${encodeURIComponent(query.trim())}`); setSearchOpen(false); };
  const goHome = () => setLocation("/");
  return <header className="aurelia-header"><div className="aurelia-header__bar"><button className="aurelia-menu" aria-label="Open navigation" onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? <X size={21} /> : <Menu size={22} />}</button><button className="aurelia-wordmark ukiz-wordmark" aria-label="UKIZ home" onClick={goHome}><img src="/manus-storage/ukiz-logo_b0f17e09.jpg" alt="UKIZ logo, since 2026" /></button><nav className="aurelia-header__nav" aria-label="Primary navigation">{navigation.map((link) => <button onClick={() => goTo(link)} key={link}>{link}</button>)}</nav><div className="aurelia-header__actions"><button aria-label="Search fragrances" onClick={() => setSearchOpen((value) => !value)}><Search size={18} /></button><button className="desktop-action" aria-label="Account" onClick={() => setLocation("/account")}><UserRound size={18} /></button><button aria-label="Wishlist" onClick={() => setLocation("/account?tab=wishlist")}><Heart size={18} /></button><button className="bag-action" aria-label="Shopping bag" onClick={() => setOpen(true)}><ShoppingBag size={18} /><span>{itemCount}</span></button></div></div>{searchOpen && <form className="header-search" onSubmit={submitSearch} role="search"><Search size={17} /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by scent, note, or brand" aria-label="Search fragrances" /><button type="submit">Search</button></form>}{menuOpen && <nav className="aurelia-mobile-menu" aria-label="Mobile navigation">{navigation.map((link) => <button onClick={() => goTo(link)} key={link}>{link}</button>)}<button onClick={() => { setMenuOpen(false); setLocation("/account"); }}>Account</button></nav>}</header>;
}
