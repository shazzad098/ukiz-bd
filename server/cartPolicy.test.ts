import { describe, expect, it } from "vitest";
import { mergeVariantQuantity, parseGuestCart } from "../shared/cartPolicy";

describe("guest cart persistence and merge policy", () => {
  it("restores valid persisted guest items after a refresh-equivalent deserialize", () => { expect(parseGuestCart('[{"productSlug":"cypress-veil","variantSize":"50ml","quantity":2}]')).toEqual([{ productSlug: "cypress-veil", variantSize: "50ml", quantity: 2 }]); });
  it("rejects malformed or invalid local cart content", () => { expect(parseGuestCart("not-json")).toEqual([]); expect(parseGuestCart('[{"productSlug":"cypress-veil","variantSize":"200ml","quantity":2}]')).toEqual([]); });
  it("merges identical guest and account variants without duplicate rows and respects stock", () => { expect(mergeVariantQuantity(9, 7, 12)).toBe(12); expect(mergeVariantQuantity(2, 3, 12)).toBe(5); });
});
