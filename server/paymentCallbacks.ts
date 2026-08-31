import type { Express, Request, Response } from "express";
import { PaymentValidationError } from "./paymentPolicy";
import { processSslCommerzCallback } from "./paymentService";

function payloadFrom(req: Request) { const source = { ...(req.query as Record<string, unknown>), ...(req.body as Record<string, unknown>) }; return Object.fromEntries(Object.entries(source).map(([key, value]) => [key, typeof value === "string" ? value : String(value ?? "")])); }
function redirectConfirmation(res: Response, result: { orderNumber?: string; accessToken?: string; outcome?: unknown }, fallback: string) { if (!result.orderNumber) return res.redirect(303, `/payment-result?state=${encodeURIComponent(fallback)}`); const query = new URLSearchParams({ payment: String(result.outcome ?? fallback) }); if (result.accessToken) query.set("token", result.accessToken); return res.redirect(303, `/order-confirmation/${encodeURIComponent(result.orderNumber)}?${query.toString()}`); }
export function registerPaymentCallbackRoutes(app: Express) {
  const handler = (kind: "success" | "failed" | "cancelled" | "ipn") => async (req: Request, res: Response) => { try { const result = await processSslCommerzCallback(kind, payloadFrom(req)); if (kind === "ipn") return res.status(200).json({ received: true, outcome: result.outcome }); return redirectConfirmation(res, result, "verification_failed"); } catch (error) { const message = error instanceof PaymentValidationError ? "verification_failed" : "payment_error"; if (kind === "ipn") return res.status(400).json({ received: false, error: message }); return res.redirect(303, `/payment-result?state=${message}`); } };
  app.post("/api/payments/sslcommerz/success", handler("success")); app.post("/api/payments/sslcommerz/failed", handler("failed")); app.post("/api/payments/sslcommerz/cancel", handler("cancelled")); app.post("/api/payments/sslcommerz/ipn", handler("ipn"));
}
