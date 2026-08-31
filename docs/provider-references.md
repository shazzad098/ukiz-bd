# Payment Provider References

## SSLCOMMERZ Sandbox

Source: https://developer.sslcommerz.com/

The SSLCOMMERZ Developer Arena describes a three-stage hosted payment flow: a merchant creates a transaction session by HTTP POST, redirects the customer to the returned `GatewayPageURL`, receives an Instant Payment Notification or callback, and validates the transaction through the Order Validation API before updating its own records. The provider documents successful validation states as `VALID` or `VALIDATED`, with failure and cancellation states handled separately. The provider also offers Sandbox Account registration at https://developer.sslcommerz.com/registration/.

The Aurelia adapter follows this contract. It stores credentials server-side, sends a unique transaction reference and return URLs during session creation, validates `val_id` server-side before paid status, and treats browser redirects only as navigation—not proof of payment.
