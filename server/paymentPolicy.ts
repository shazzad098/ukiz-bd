import { createHash } from "node:crypto";

export type PaymentOutcome = "paid" | "failed" | "cancelled";
export type PaymentAttemptState = "initiated" | "pending" | PaymentOutcome | "refunded";

export class PaymentValidationError extends Error {}

export function isRetryablePayment(status: string, orderStatus: string) {
  return status !== "paid" && status !== "refunded" && orderStatus === "pending";
}

export function outcomeFromSslStatus(status: string | undefined): PaymentOutcome {
  const normalized = (status ?? "").trim().toUpperCase();
  if (normalized === "VALID" || normalized === "VALIDATED") return "paid";
  if (normalized === "FAILED") return "failed";
  if (normalized === "CANCELLED") return "cancelled";
  throw new PaymentValidationError("The payment provider returned an unrecognized transaction state.");
}

export function amountsMatch(expected: number, received: string | number | undefined) {
  const numeric = Number(received);
  return Number.isFinite(numeric) && Math.abs(expected - numeric) < 0.01;
}

export function callbackFingerprint(payload: Record<string, unknown>) {
  const normalized = Object.entries(payload).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${String(value)}`).join("&");
  return createHash("sha256").update(normalized).digest("hex");
}
