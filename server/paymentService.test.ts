import { describe, expect, it } from "vitest";
import { PaymentValidationError } from "./paymentPolicy";
import { safeOrigin } from "./paymentService";

describe("payment callback origin policy", () => {
  it("normalizes a managed preview proxy to its public HTTPS origin", () => {
    expect(safeOrigin("http://3000-example.us5.manus.computer")).toBe("https://3000-example.us5.manus.computer");
  });

  it("permits only secure public origins or explicit development loopback", () => {
    expect(safeOrigin("https://store.example.com/path")).toBe("https://store.example.com");
    expect(safeOrigin("http://127.0.0.1:3000")).toBe("http://127.0.0.1:3000");
    expect(() => safeOrigin("http://store.example.com")).toThrow(PaymentValidationError);
    expect(() => safeOrigin("not-a-url")).toThrow(PaymentValidationError);
  });
});
