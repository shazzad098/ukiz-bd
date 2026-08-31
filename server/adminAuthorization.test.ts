import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { NOT_ADMIN_ERR_MSG } from "../shared/const";

function contextFor(role: "admin" | "user" | null): TrpcContext {
  return {
    user: role ? { id: 77, openId: `${role}-test`, name: `${role} test`, email: `${role}@example.test`, loginMethod: "test", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() } : null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("admin authorization", () => {
  it("rejects anonymous callers before the dashboard can query operations data", async () => {
    await expect(appRouter.createCaller(contextFor(null)).admin.dashboard()).rejects.toMatchObject({ message: NOT_ADMIN_ERR_MSG });
  });

  it("rejects standard customers from catalog, order, and customer management procedures", async () => {
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.admin.products()).rejects.toMatchObject({ message: NOT_ADMIN_ERR_MSG });
    await expect(caller.admin.orders()).rejects.toMatchObject({ message: NOT_ADMIN_ERR_MSG });
    await expect(caller.admin.customers()).rejects.toMatchObject({ message: NOT_ADMIN_ERR_MSG });
  });
});
