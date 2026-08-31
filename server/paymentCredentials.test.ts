import { describe, expect, it } from "vitest";

describe("SSLCOMMERZ sandbox credentials", () => {
  it("can create a sandbox payment-session probe without exposing credentials to the client", async () => {
    const storeId = process.env.SSLCOMMERZ_SANDBOX_STORE_ID;
    const storePassword = process.env.SSLCOMMERZ_SANDBOX_STORE_PASSWORD;
    expect(storeId).toBeTruthy();
    expect(storePassword).toBeTruthy();

    const form = new URLSearchParams({
      store_id: storeId!,
      store_passwd: storePassword!,
      total_amount: "1.00",
      currency: "BDT",
      tran_id: `AURELIA-PROBE-${Date.now()}`,
      success_url: "https://example.invalid/payment/success",
      fail_url: "https://example.invalid/payment/fail",
      cancel_url: "https://example.invalid/payment/cancel",
      cus_name: "Aurelia Sandbox Probe",
      cus_email: "sandbox-probe@example.test",
      cus_add1: "Sandbox verification",
      cus_city: "Dhaka",
      cus_country: "Bangladesh",
      cus_phone: "01700000000",
      shipping_method: "NO",
      product_name: "Sandbox credential verification",
      product_category: "Testing",
      product_profile: "general",
    });
    const response = await fetch("https://sandbox.sslcommerz.com/gwprocess/v4/api.php", { method: "POST", body: form });
    expect(response.ok).toBe(true);
    const payload = await response.json() as { status?: string; GatewayPageURL?: string };
    expect(payload.status).toBe("SUCCESS");
    expect(payload.GatewayPageURL).toMatch(/^https?:\/\//);
  }, 30_000);
});
