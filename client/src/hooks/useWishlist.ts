import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export function useWishlist() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const list = trpc.wishlist.list.useQuery(undefined, { enabled: isAuthenticated });
  const add = trpc.wishlist.add.useMutation({ onSuccess: () => utils.wishlist.list.invalidate() });
  const remove = trpc.wishlist.remove.useMutation({ onSuccess: () => utils.wishlist.list.invalidate() });
  const toggle = async (productSlug: string) => {
    if (!isAuthenticated) { toast.message("Sign in to save scents — redirecting to login."); setLocation("/auth"); return; }
    const exists = (list.data ?? []).some((item) => item.productSlug === productSlug);
    if (exists) { await remove.mutateAsync({ productSlug }); toast.success("Removed from your wishlist."); }
    else { await add.mutateAsync({ productSlug }); toast.success("Saved to your wishlist."); }
  };
  return { items: list.data ?? [], loading: list.isLoading, isAuthenticated, toggle };
}
