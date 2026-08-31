import { describe, expect, it } from "vitest";
import { assertQuantityAvailable, getVariantStock } from "./catalogStock";

describe("catalog stock guard", () => {
  it("returns configured stock for a known product variant", () => { expect(getVariantStock("cypress-veil", "50ml")).toBe(12); });
  it("rejects quantities that exceed the server-side stock", () => { expect(() => assertQuantityAvailable("cypress-veil", "50ml", 13)).toThrow("Only 12 units"); });
  it("rejects unavailable variants", () => { expect(() => assertQuantityAvailable("gift-of-quiet", "30ml", 1)).toThrow("currently unavailable"); });
});
