import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const anonymousContext = { user: null, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] } as TrpcContext;
describe("customer commerce authorization", () => {
  it("does not expose carts, wishlists, addresses, or orders without an authenticated customer", async () => {
    const caller = appRouter.createCaller(anonymousContext);
    await expect(caller.cart.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.wishlist.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.wishlist.add({ productSlug: "cypress-veil" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.customer.addresses()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.customer.createAddress({ label: "Home", division: "Dhaka", district: "Dhaka", thana: "Gulshan", detailedAddress: "17 Lake Road", phone: "01700000000" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.customer.orders()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
