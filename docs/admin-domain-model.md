# Admin Domain Model

The protected operations workspace treats **database-managed catalog records** as the administrative source of truth while retaining the existing checkout order, inventory reservation, customer, coupon, and payment-attempt tables. Existing storefront records remain available during migration; new admin routines must never trust a browser-provided price, inventory quantity, payment state, or customer identifier.

| Domain | Administrative records | Compatibility rule |
|---|---|---|
| Catalog | `catalogProducts`, `catalogVariants`, `catalogMedia` | A product is archived rather than deleted when it may be referenced by an order. Variant stock remains synchronized with `catalogInventory`. |
| Categories | `catalogCategories` | Enabled categories are available to storefront discovery and homepage placements. |
| Merchandising | `homepageSlots` | Hero, campaign, featured, best-seller, and new-arrival slots are editable and fall back to the original composition until populated. |
| Orders and customers | Existing `orders`, `orderItems`, `users`, `customerProfiles` | Admin actions are server-only and retain the existing customer access rules. |
| Operations | `adminSettings`, `adminNotifications` | Low-stock thresholds and operational alerts are stored centrally and are visible only to administrators. |

## Authorization boundary

Every `admin.*` tRPC procedure uses `adminProcedure`. This guard rejects unauthenticated callers and users without the `admin` role before any database query or mutation. The `/admin` page also checks the authenticated role to provide an appropriate client-side experience, but the server guard remains the authorization authority.

## Catalog mutation rules

Admin catalog updates validate unique product slugs and SKUs, non-negative prices and stock, and known size values. Archive/unpublish actions retain historical rows. Order and payment status updates are limited to enumerated workflow states; paid orders are never marked paid from the browser alone.
