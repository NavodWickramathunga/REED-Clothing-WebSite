# Security Specification (TDD) for REƎD Apparel

## 1. Data Invariants

* **Products**: Publicly viewable and listed for anyone. Only verified admin user (`navodwickramathunga@gmail.com`) can write, modify, or delete.
* **Orders**: Anyone can submit an anonymous checkout order. Only the verified admin (`navodwickramathunga@gmail.com`) can query/list all orders, read any order in bulk, or update status/fulfillment flags.
* **WhatsApp Config**: Publicly readable (single configuration document). Only the verified admin can update the routing number.

## 2. The "Dirty Dozen" Payloads (Mitigation Scenarios)

1. **Unauthenticated Catalog Poisoning**: An attacker tries to write/edit a product profile. Rejected as `auth == null`.
2. **Anonymous Order Scraping**: A script tries to list all user orders. Rejected as `resource.data` and overall list are locked to Admin role.
3. **Admin Email Spoofing**: An attacker signs up as `navodwickramathunga@gmail.com` on a spoofed provider without verifying email. Rejected by requiring `email_verified == true`.
4. **WhatsApp Route Hijacking**: An attacker tries to edit `whatsapp_config/main` to redirect orders to their own phone number. Rejected as they are not the admin.
5. **Product Price Deflation**: Attackers attempt to modify product price fields to zero. Prevented by schema checks (`priceUSD > 0`).
6. **Order Creation Shadow Insertion**: Attempting to include arbitrary extra fields into an order document. Prevented by strict size checks on the schema.
7. **Temporal Fraud**: Setting order `timestamp` to a future date. Enforced with `request.time` constraints or validated strings.
8. **Malicious Long ID Injection**: Attempt to write an order ID that is 50KB in length to exhaust storage. Guarded by `isValidId(orderId)`.
9. **Duplicate Order ID Overwrites**: Attackers trying to overwrite someone else's order. Prevented by denying order updates/overwrites.
10. **Order Status Tampering**: Anyone trying to mark their order as 'Paid' or 'Shipped'. Restricted to admin only post-creation.
11. **Negative Quantities**: Submitting order items with quantity <= 0. Guarded by item collection maps.
12. **Blanket Collection Scans**: Scanning `/products` recursively with non-indexed fields. Prevented by standard secure lists limits.

---

## 3. Test Runner Design

This specifies that all test suites running requests for unauthenticated readers or non-verified users attempting to perform write operations or list orders result in strict permissions denials.
