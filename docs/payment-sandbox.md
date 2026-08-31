# SSLCOMMERZ Sandbox Payment Setup

The Aurelia payment adapter uses **SSLCOMMERZ Sandbox** for hosted checkout sessions. It keeps the Store ID and Store Password on the server, sends shoppers only to the hosted gateway URL, and verifies successful callbacks through the provider validation API before an order can become paid.

| Environment variable | Purpose | Required for |
|---|---|---|
| `SSLCOMMERZ_SANDBOX_STORE_ID` | Sandbox merchant Store ID | Creating SSLCOMMERZ test sessions |
| `SSLCOMMERZ_SANDBOX_STORE_PASSWORD` | Sandbox merchant Store Password | Creating and validating test transactions |

The callback paths are `/api/payments/sslcommerz/success`, `/failed`, `/cancel`, and `/ipn`. Configure the IPN listener in the SSLCOMMERZ merchant panel only after the deployed site has a stable public HTTPS URL. The adapter verifies `val_id`, provider transaction ID, currency, and amount server-side. It records each payment attempt with a unique transaction ID so duplicate callbacks do not create duplicate state transitions.

The local sandbox simulator is intentionally development-only. It exercises paid, failed, cancelled, and network-failure state transitions without sending card or wallet data anywhere. Do not use the simulator in production.
