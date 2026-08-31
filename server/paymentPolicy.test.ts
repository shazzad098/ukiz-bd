import { describe, expect, it } from "vitest";
import { amountsMatch, callbackFingerprint, isRetryablePayment, outcomeFromSslStatus, PaymentValidationError } from "./paymentPolicy";

describe("payment policy", () => {
  it("maps verified provider outcomes without trusting arbitrary states", () => { expect(outcomeFromSslStatus("VALID")).toBe("paid"); expect(outcomeFromSslStatus("FAILED")).toBe("failed"); expect(outcomeFromSslStatus("CANCELLED")).toBe("cancelled"); expect(() => outcomeFromSslStatus("APPROVED_IN_BROWSER")).toThrow(PaymentValidationError); });
  it("accepts only cent-accurate server totals", () => { expect(amountsMatch(4880, "4880.00")).toBe(true); expect(amountsMatch(4880, "4879.98")).toBe(false); });
  it("generates stable callback fingerprints and only allows retryable pending orders", () => { expect(callbackFingerprint({ tran_id: "x", status: "VALID" })).toBe(callbackFingerprint({ status: "VALID", tran_id: "x" })); expect(isRetryablePayment("failed", "pending")).toBe(true); expect(isRetryablePayment("paid", "confirmed")).toBe(false); expect(isRetryablePayment("cancelled", "cancelled")).toBe(false); });
});
