# Indianet Express — Admin production guide

Admin URL: https://indianetexpress.equvinoxis.com/admin/login

---

## 1. Categories (use **Add Category** only)

Skip **Add Main Sub**, **Add Sub**, **Add Header** for launch — only main categories needed.

### Example 1 — Industrial Tools
| Field | Value |
|-------|--------|
| Name | `Industrial Tools` |
| Image | JPG/PNG square 500×500+ (grinder or drill photo) |

### Example 2 — Electrical & Electronics
| Field | Value |
|-------|--------|
| Name | `Electrical & Electronics` |
| Image | Multimeter / wire photo |

### Example 3 — Safety Equipment
| Field | Value |
|-------|--------|
| Name | `Safety Equipment` |
| Image | Helmet / gloves photo |

**Also add (recommended):** Motors & Pumps, Bearings & Power Transmission, Packaging & Material Handling.

After each add → click **Show Categories** to verify the table fills.

---

## 2. Layouts — full homepage setup

### A) Slider 1 (hero) — 3 examples

Click **Add Slider** for each:

| # | Title | Button Name | Button Link | Content | Sub Content |
|---|-------|-------------|-------------|---------|-------------|
| 1 | `INDUSTRIAL SUPPLIES` | `Shop Now` | `https://indianetexpress.equvinoxis.com/categories` | `Tools & equipment delivered across India` | `Verified sellers · Secure checkout` |
| 2 | `TOP DEALS` | `Browse Deals` | `https://indianetexpress.equvinoxis.com/categories` | `Save on electrical & safety gear` | `Limited stock this week` |
| 3 | `SELL FREE` | `Start Selling` | `https://indianetexpress.equvinoxis.com/vendor/register` | `List products on Indianet Express` | `No subscription fee` |

Image size: **1920×600 px** per slide.

### B) Section One (SHOP grid)

**Add Section Items** → Section One:

| Field | Value |
|-------|--------|
| Title | `SHOP` |
| Sub Title | `Browse categories and order online with fast delivery across India` |

Search each category → click **Add** on the right → **Submit**.

### C) Section Two (Top Deals — products)

After vendors/admin add **published** products:

| Field | Value |
|-------|--------|
| Title | `Top Deals` |
| Sub Title | `Best prices on tools, electrical & safety gear` |

Search products → **Add** 6–8 items → **Submit**.

### D) Slider 2 + Banner

| Type | Link |
|------|------|
| **Add Slider 2** | `https://indianetexpress.equvinoxis.com/categories` |
| **Add Banner** (sell CTA) | `https://indianetexpress.equvinoxis.com/vendor/register` |

---

## 3. Sample products (vendor or Admin → Products → Add)

| Product | Category | Price ₹ | MRP ₹ |
|---------|----------|---------|-------|
| Angle Grinder 4" 850W | Industrial Tools | 2499 | 3200 |
| Digital Multimeter DT-830 | Electrical & Electronics | 899 | 1299 |
| Safety Helmet ISI | Safety Equipment | 450 | 699 |

Vendor products: Settings → **Pickup address** first, then publish.

---

## 4. Admin panel — what each menu does

| Menu | Purpose |
|------|---------|
| **Dashboard** | Total delivered / return / cancelled / revenue + recent orders (all vendors) |
| **Products** | **All products** — platform + every vendor (search by name) |
| **Categories** | Homepage shop categories |
| **Orders** | **All orders** — every vendor + platform (search by customer name) |
| **Settlements** | Vendor payouts due after 30 days — mark **Paid** after bank transfer |
| **Coupons** | Discount codes at checkout |
| **Vendors** | Approve / reject seller registrations |
| **Layouts** | Homepage sliders, sections, banners |

---

## 5. Coupons — 3 examples

**Coupons** → Add:

| Code | Min order ₹ | Discount % |
|------|-------------|------------|
| `WELCOME10` | 500 | 10 |
| `INDIA15` | 1000 | 15 |
| `BULK20` | 2500 | 20 |

- **Min** = cart subtotal must reach this before coupon applies  
- **Discount** = percent off (enter `10` for 10%)

Buyer enters code at checkout.

---

## 6. Settlements — how it works

| Card | Meaning |
|------|---------|
| Platform revenue | 15% + ₹30 per line collected from buyers |
| Vendor payout pending | Not yet 30 days old |
| Vendor payout due now | Ready to pay vendor |
| Vendor payout settled | Already paid |

**Action:** After you bank-transfer the vendor their **listed product price**, click **Mark paid** on that row.

**Example:** Product listed ₹1,000 → vendor receives ₹1,000 (platform already kept 15% + ₹30 from buyer).

---

## 7. Orders — admin workflow

1. **Orders** → see product name, **vendor**, customer, payment (COD/Razorpay), status  
2. Click **Edit** on a row  
3. Update status: Pending → Processing → Shipped → Delivered  
4. Customer gets notifications (if email/WhatsApp configured)

---

## 8. Vendors

1. Seller registers at `/vendor/register`  
2. **Vendors** → find pending → **Accept**  
3. Seller adds pickup address + products  
4. Products appear in **Admin → Products** and on storefront  

---

## 9. Production launch checklist

| Step | Done |
|------|------|
| S3 + env vars correct (bucket `indianet-equvinoxis`) | ☐ |
| 3+ categories with images | ☐ |
| Slider 1 (3 slides) | ☐ |
| Section 1 (categories) | ☐ |
| 1+ vendor approved + 3+ published products | ☐ |
| Section 2 (Top Deals) | ☐ |
| Test checkout (Razorpay test card) | ☐ |
| Coupon `WELCOME10` created | ☐ |

---

## 10. Razorpay test checkout

Card: `4111 1111 1111 1111` · any future expiry · any CVV

---

*See also `FULL_OPERATIONS_GUIDE.md` and `Client/.env.example` for Railway variables.*
