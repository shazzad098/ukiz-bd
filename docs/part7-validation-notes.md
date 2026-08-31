# Part 7 Validation Notes

The protected admin workspace was reviewed at desktop and mobile breakpoints. The overview, catalog, inventory, coupon, category, homepage-merchandising, order, customer, report, and settings routes resolve within the shared administrator shell. The route guard presents an administrator-only access state when no session is available, while server tests separately confirm anonymous and standard-customer callers cannot invoke `admin.*` procedures.

The existing storefront catalog was seeded into the managed catalog tables without creating customer records. The homepage consumes enabled administrator-controlled slots, and the product shelves consume only published, non-archived managed records. Browser verification at the best-seller shelf confirmed the catalog media URLs render normally. The managed-card primary price was corrected to select the 50ml variant, matching server checkout quotes; Cypress Veil now displays **৳ 4,800** rather than the lexically first 100ml variant price.

The quality gate passed after the final changes: TypeScript validation, 28 unit/integration tests, and the production build all completed successfully. The production bundle still emits the existing size advisory from Vite; it is non-blocking and can be addressed with a future route-level split of the admin workspace.

## Owner-browser access remediation

The reported sign-in issue was isolated to an unavailable owner-browser connection. After enabling the existing **My Browser** connection, the owner session opened `/admin` successfully as an administrator. The live workspace displayed the current sales, order, stock, and payment-alert data; the protected `/admin/products` route also loaded the catalog list with media previews and management actions. The client guard continues to show the administrator-only message for a browser without a session, while the protected server procedures enforce the role independently.

The owner-browser walkthrough also opened the protected orders register with search and state filters and the live product catalog with edit/archive controls. The inventory workspace rendered all variant stock controls, and an unchanged Cypress Veil stock value was saved through the live administrator mutation to confirm the authenticated write path without changing inventory. Product edit, order detail, invoice printing, coupon/category creation, and customer-history controls remain available in the UI; the workflow test suite re-saves representative existing operational values without introducing test catalog, order, or coupon data.

The live Cypress Veil product editor was opened successfully in the owner browser without submitting edits. It exposes the product identity and taxonomy fields, publish/new flags, full variant and stock controls, image/video upload controls with existing media removal, and fragrance-detail fields. This confirms the client route reaches the protected catalog-management form after owner authentication.

The authenticated customer-management route was also opened. It rendered the protected customer search and history layout correctly; the current database contains no registered customer records, so no live customer-history row was available to open without fabricating customer data.

The authenticated coupon and category-management routes were opened in the owner browser. The coupon form exposes code, discount type, amount, minimum order, usage limit, and save controls; the register is currently empty. The category route exposes creation fields and image upload, and rendered the existing enabled Men, Women, Unisex, Attar, and Gift Sets cards with archive controls. No test promotions or categories were created.

The owner browser opened a live pending order detail for **AUR-2026-N4G2NOYX** without altering it. The protected register displayed order items, customer and delivery details, fulfillment-state control, payment-state control, and the invoice-print entry point. The currently selected values were left unchanged.

Customer management now includes authenticated staff accounts alongside customer accounts, while dashboard customer totals remain limited to `user` roles. The owner account appeared in the protected customer register with its two genuine orders, and its customer-history panel was opened successfully in the owner browser. No customer, catalog, promotion, or order records were fabricated for validation.
