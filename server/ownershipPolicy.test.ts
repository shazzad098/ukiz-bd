import { describe, expect, it } from "vitest";
import { onlyForCustomer } from "./ownershipPolicy";

describe("customer record ownership guard", () => {
  it("returns a record only to its matching customer", () => { expect(onlyForCustomer({ userId: 7, id: 22 }, 7)).toEqual({ userId: 7, id: 22 }); });
  it("withholds another customer’s order-like record", () => { expect(onlyForCustomer({ userId: 7, id: 22 }, 8)).toBeUndefined(); });
});
