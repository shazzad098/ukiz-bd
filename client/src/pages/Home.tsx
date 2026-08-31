/**
 * Design reminder — Signature Fragrance replica:
 * The home route delegates to the reusable storefront composition and carries no duplicate layout logic.
 */
import Storefront from "./Storefront";

export default function Home() {
  return <Storefront />;
}
