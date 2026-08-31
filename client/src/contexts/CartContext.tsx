/**
 * Design reminder — Aurelia Scent House:
 * Cart state is quiet but reliable: guests retain their selections locally, while signed-in customers use protected server records and merge only by product and variant.
 */
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { productCatalog } from "@/data/catalog";
import { parseGuestCart } from "../../../shared/cartPolicy";

export type CartLine = { id: string; productSlug: string; variantSize: "30ml" | "50ml" | "100ml"; quantity: number };
type CartContextValue = { lines: CartLine[]; open: boolean; setOpen: (value: boolean) => void; add: (slug: string, size: CartLine["variantSize"], quantity?: number) => Promise<void>; update: (line: CartLine, quantity: number) => Promise<void>; remove: (line: CartLine) => Promise<void>; clearAfterCheckout: () => Promise<void>; itemCount: number; subtotal: number; loading: boolean; };
const CartContext = createContext<CartContextValue | null>(null);
const guestKey = "aurelia-guest-cart-v1";

function variantFor(line: CartLine) { return productCatalog.find((product) => product.slug === line.productSlug)?.variants.find((variant) => variant.size === line.variantSize); }
function loadGuestCart(): CartLine[] { return parseGuestCart(localStorage.getItem(guestKey)).map((line) => ({ ...line, id: `${line.productSlug}:${line.variantSize}` })); }

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [guestLines, setGuestLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const synced = useRef(false);
  const serverCart = trpc.cart.list.useQuery(undefined, { enabled: isAuthenticated });
  const setItem = trpc.cart.setItem.useMutation({ onSuccess: () => utils.cart.list.invalidate() });
  const removeItem = trpc.cart.removeItem.useMutation({ onSuccess: () => utils.cart.list.invalidate() });
  const mergeGuest = trpc.cart.mergeGuest.useMutation({ onSuccess: () => utils.cart.list.invalidate() });

  useEffect(() => { setGuestLines(loadGuestCart()); setHydrated(true); }, []);
  useEffect(() => { if (hydrated && !isAuthenticated) localStorage.setItem(guestKey, JSON.stringify(guestLines)); }, [guestLines, hydrated, isAuthenticated]);
  useEffect(() => { if (!isAuthenticated) synced.current = false; }, [isAuthenticated]);
  useEffect(() => {
    if (!isAuthenticated || !hydrated || synced.current || !guestLines.length) return;
    synced.current = true;
    mergeGuest.mutate(guestLines.map(({ productSlug, variantSize, quantity }) => ({ productSlug, variantSize, quantity })), { onSuccess: () => { setGuestLines([]); localStorage.removeItem(guestKey); toast.success("Your guest bag has been merged with your account."); }, onError: () => { synced.current = false; toast.error("We could not synchronize your guest bag just yet."); } });
  }, [guestLines, hydrated, isAuthenticated, mergeGuest]);

  const lines = useMemo<CartLine[]>(() => isAuthenticated ? (serverCart.data ?? []).map((item) => ({ id: String(item.id), productSlug: item.productSlug, variantSize: item.variantSize as CartLine["variantSize"], quantity: item.quantity })) : guestLines, [guestLines, isAuthenticated, serverCart.data]);
  const add = useCallback(async (productSlug: string, variantSize: CartLine["variantSize"], quantity = 1) => {
    const variant = variantFor({ id: "", productSlug, variantSize, quantity });
    if (!variant?.stock) { toast.error("This scent is currently unavailable in that size."); return; }
    const existing = lines.find((line) => line.productSlug === productSlug && line.variantSize === variantSize);
    const nextQuantity = Math.min(variant.stock, (existing?.quantity ?? 0) + quantity);
    if (isAuthenticated) await setItem.mutateAsync({ productSlug, variantSize, quantity: nextQuantity });
    else setGuestLines((current) => existing ? current.map((line) => line.id === existing.id ? { ...line, quantity: nextQuantity } : line) : [...current, { id: `${productSlug}:${variantSize}`, productSlug, variantSize, quantity: nextQuantity }]);
    toast.success("Added to your bag."); setOpen(true);
  }, [isAuthenticated, lines, setItem]);
  const update = useCallback(async (line: CartLine, quantity: number) => { const variant = variantFor(line); if (!variant) return; if (quantity < 1) return remove(line); if (quantity > variant.stock) { toast.error(`Only ${variant.stock} available in ${line.variantSize}.`); return; } if (isAuthenticated) await setItem.mutateAsync({ productSlug: line.productSlug, variantSize: line.variantSize, quantity }); else setGuestLines((current) => current.map((item) => item.id === line.id ? { ...item, quantity } : item)); }, [isAuthenticated, removeItem, setItem]);
  const remove = useCallback(async (line: CartLine) => { if (isAuthenticated) await removeItem.mutateAsync({ itemId: Number(line.id) }); else setGuestLines((current) => current.filter((item) => item.id !== line.id)); }, [isAuthenticated, removeItem]);
  const clearAfterCheckout = useCallback(async () => { if (isAuthenticated) await utils.cart.list.invalidate(); else { setGuestLines([]); localStorage.removeItem(guestKey); } }, [isAuthenticated, utils]);
  const subtotal = lines.reduce((total, line) => total + (variantFor(line)?.price ?? 0) * line.quantity, 0);
  return <CartContext.Provider value={{ lines, open, setOpen, add, update, remove, clearAfterCheckout, itemCount: lines.reduce((total, line) => total + line.quantity, 0), subtotal, loading: serverCart.isLoading || !hydrated }}>{children}</CartContext.Provider>;
}
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error("useCart must be used within CartProvider"); return context; }
