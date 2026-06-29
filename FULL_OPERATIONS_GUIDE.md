# Indianet Express — Full Operations Guide

Live URLs:
- **Storefront:** https://indianetexpress.equvinoxis.com
- **API:** https://api.indianetexpress.equvinoxis.com

---

## 1. Login URLs

| Role | URL | Credentials |
|------|-----|-------------|
| **Admin** | `/admin/login` | `ADMIN_EMAIL` + `ADMIN_PASSWORD` (Railway SERVER env) |
| **Vendor** | `/vendor/login` | Email OTP (registered vendor email) |
| **Customer** | Header → **Join Free** / **Login** | Email OTP signup/login |

**Admin example:** `https://indianetexpress.equvinoxis.com/admin/login`

---

## 2. Admin — Homepage layout (robocraze-style)

| Step | Admin menu | Action |
|------|------------|--------|
| 1 | **Categories** | Create categories (e.g. Sensors, Motors, Arduino). Upload image + slug. |
| 2 | **Layouts** | Create homepage sections: type **slider** (banners) or **shop grid** (category tiles). Assign category + order. |
| 3 | **Products** (optional) | Admin can list own products (uses platform `SHIPROCKET_PICKUPID`). |
| 4 | **Vendors** | Approve pending vendor registrations. |
| 5 | **Settlements** | View vendor payouts due after 30 days. Mark paid when transferred. |

**Why homepage is empty:** No categories, layout rows, or published products in DB yet. Admin must add them first.

---

## 3. Vendor flow (end-to-end)

| Step | Page | What to do |
|------|------|------------|
| 1 | `/vendor/register` | Register store (KYC, address, bank). |
| 2 | Wait for admin | Admin approves in **Vendors**. |
| 3 | `/vendor/settings` → **Pickup addresses** | Add warehouse(s): label, address, city, state, PIN. Mark one as default. Syncs to Shiprocket. |
| 4 | `/vendor/products/add` | Add product: images, price, category, **pickup address**, weight/dimensions. Publish. |
| 5 | `/vendor/orders` | Fulfill orders; Shiprocket label uses product `pickup_location`. |
| 6 | `/vendor/dashboard` | See sales + settlement due in 30 days. |

---

## 4. Pickup address → product → shipping

| Layer | Field | Purpose |
|-------|-------|---------|
| Vendor document | `pickupAddresses[]` | List of warehouses (id, label, pinCode, shiprocketNickname) |
| Product | `pickupAddressId` | Vendor selects one address per product |
| Product | `pickupPinCode` | Used for Shiprocket rate API (origin PIN) |
| Product | `pickup_location` | Shiprocket nickname for label creation |
| Checkout | Cart grouping | Items grouped by pickup PIN (separate shipment per warehouse) |

**Example:**

| Product | Pickup address | PIN | Shiprocket nickname |
|---------|----------------|-----|---------------------|
| Arduino Uno | Main warehouse | 560001 | `IEabc123def456` |
| Motor driver | Delhi shop | 110001 | `IEabc123ghi789` |

Customer cart with both → **2 shipping estimates** (one per pickup PIN).

---

## 5. Commission model (15% + ₹30)

| Party | Gets / pays |
|-------|-------------|
| **Vendor sets** | Listed price (e.g. ₹1,000) — **vendor receives full ₹1,000** after settlement |
| **Platform fee** | 15% of line + ₹30 per line item |
| **Customer GST** | 18% on product subtotal |
| **Shipping** | Shiprocket live rate (pickup PIN → delivery PIN) |
| **Settlement** | Vendor paid **30 days** after order (admin **Settlements** page) |

### Example — single product ₹1,000 (excl. shipping)

| Line item | Amount (₹) |
|-----------|------------|
| Product price (vendor list) | 1,000 |
| Platform 15% | 150 |
| Platform fixed fee | 30 |
| **Customer subtotal (product + platform)** | **1,180** |
| GST 18% on product | 180 |
| **Customer pays (before shipping)** | **1,360** |
| Vendor receives (after 30 days) | 1,000 |
| Platform keeps | 180 |

### Multi-item cart example

| Item | Vendor price | Platform fee (15%+₹30) |
|------|--------------|--------------------------|
| Product A | ₹500 | ₹105 |
| Product B | ₹800 | ₹150 |
| **Subtotal** | ₹1,300 | ₹255 |
| GST 18% | | ₹234 |
| Shipping | | (Shiprocket quote) |

---

## 6. Customer (storefront) flow

| Step | Page | Action |
|------|------|--------|
| 1 | `/` | Browse categories / products |
| 2 | Product page | Add to cart or Buy now |
| 3 | `/checkout` | Enter delivery address + PIN → sees breakdown (product + platform fee + GST + shipping) |
| 4 | Pay | Razorpay (test/live keys on SERVER) or COD |
| 5 | `/orders` | Track order (login required) |

---

## 7. Razorpay test mode

| Env variable (SERVER) | Value |
|-----------------------|-------|
| `RAZORPAY_ID` | `rzp_test_...` |
| `RAZORPAY_SECREt` | test secret (note typo in env name is intentional in code) |

**Test card:** 4111 1111 1111 1111, any future expiry, any CVV.

Flow: `createRazorpayPayment` → checkout modal → `order-item-razorpay` verifies signature.

---

## 8. Shiprocket env (SERVER)

| Variable | Purpose |
|----------|---------|
| `SHIPROCKET_EMAIL` | API login |
| `SHIPROCKET_PASS` | API password |
| `SHIPROCKET_PICKUP_POSTCODE` | Fallback / pincode check |
| `SHIPROCKET_PICKUPID` | Admin-only products pickup nickname |

Vendor products use **per-product pickup** from vendor portal (not platform PIN).

---

## 9. API summary (pickup addresses)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vendor/pickupAddresses` | List vendor pickup addresses |
| POST | `/vendor/pickupAddresses` | Add address (+ Shiprocket sync) |
| PUT | `/vendor/pickupAddresses/:id` | Update address |
| DELETE | `/vendor/pickupAddresses/:id` | Remove address |

Product add/edit sends `pickupAddressId` → server sets `pickupPinCode`, `pickup_location`, `pickupLabel`.

---

## 10. Quick launch checklist

| # | Task | Owner |
|---|------|-------|
| 1 | Set Railway env (Mongo, AWS, Razorpay test, Shiprocket, admin) | DevOps |
| 2 | Admin login → add 3–5 categories | Admin |
| 3 | Admin → Layouts: slider + shop grid | Admin |
| 4 | Approve 1 test vendor | Admin |
| 5 | Vendor → pickup address + 2 products | Vendor |
| 6 | Customer signup → checkout test payment | QA |
| 7 | Admin → Settlements (after test order) | Admin |

---

## 11. Product document fields (reference)

| Field | Type | Set by |
|-------|------|--------|
| `name`, `price`, `mrp` | string/number | Vendor |
| `category`, `categorySlug` | string | Vendor |
| `pickupAddressId` | string | Vendor (product form) |
| `pickupPinCode` | string | Server (from address) |
| `pickup_location` | string | Server (Shiprocket nickname) |
| `weightKg`, `lengthCm`, `breadthCm`, `heightCm` | number | Vendor |
| `publishStatus` | draft / published | Vendor |
| `vendorId` | string | Server |

---

*For deploy details see `PRODUCTION_GUIDE.md`. For content seeding see `LAUNCH_CHECKLIST.md`.*
