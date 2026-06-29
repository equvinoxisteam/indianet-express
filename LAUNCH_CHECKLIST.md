# Indianet Express — Launch checklist (admin setup)

## Admin login

1. Open **https://indianetexpress.equvinoxis.com/admin/login**
2. Email: `team@equvinoxis.com` (your `ADMIN_EMAIL`)
3. Password: your `ADMIN_PASSWORD` from Railway

---

## Step 1 — Add categories (Admin → Categories)

Add these with a **square image** for each:

| # | Category name | Example slug |
|---|---------------|--------------|
| 1 | Industrial Tools | industrial-tools |
| 2 | Electrical & Electronics | electrical-electronics |
| 3 | Safety Equipment | safety-equipment |
| 4 | Motors & Pumps | motors-pumps |
| 5 | Bearings & Power Transmission | bearings-power |
| 6 | Packaging & Material Handling | packaging-handling |

---

## Step 2 — Homepage layouts (Admin → Layouts)

### Slider One (hero banner)
Upload **2–3 slides** with:
- Title: e.g. `Industrial supplies delivered fast`
- Button text: `Shop Now`
- Button link: `/categories`
- Image: 1920×600 promo banner

### Section One (SHOP grid title)
- Title: `SHOP`
- Subtitle: `Browse categories and order online`
- Add all 6 categories to section one

### Section Two — Featured products
- Title: `Top Deals`
- Subtitle: `Best prices this week`
- Add 8–12 products after vendors/admin add them

### Slider Two (mid-page banner)
- Upload 1–2 promo images linking to `/categories`

### Banner
- One wide banner image → link `/vendor/register` (Sell on Indianet Express)

---

## Step 3 — Products to add (vendor or admin)

Approve 1 test vendor, then add sample products:

| Product | Category | Price ₹ | MRP ₹ | Weight kg |
|---------|----------|---------|-------|-----------|
| Angle Grinder 4" | Industrial Tools | 2499 | 3200 | 2.5 |
| Digital Multimeter | Electrical & Electronics | 899 | 1299 | 0.5 |
| Safety Helmet ISI | Safety Equipment | 450 | 699 | 0.8 |
| Monoblock Pump 1HP | Motors & Pumps | 4200 | 5500 | 8 |
| Ball Bearing 6205 | Bearings & Power | 180 | 250 | 0.3 |
| Stretch Wrap Roll | Packaging & Handling | 320 | 450 | 1.2 |

Each product needs:
- 1 thumbnail + up to 3 gallery images
- Weight, length, breadth, height (for Shiprocket)
- COD + Online payment enabled
- **Publish** status

---

## Step 4 — Test buyer flow

1. **Join Free** → create buyer account
2. Add product to **cart** (header icon)
3. **Checkout** → enter PIN → see shipping + GST + platform fee
4. Place test order (COD if Razorpay not set)
5. **Orders** button in header (login required) → track order

---

## Step 5 — Vendor flow

1. **Sell Now** → `/vendor/register`
2. Admin → **Vendors** → Accept
3. Vendor adds products → publish
4. Vendor → **Orders** → update status when shipping

---

## Step 6 — Settlements (Admin → Settlements)

After orders, platform fee (15% + ₹30) shows in admin. Mark vendor payout **paid** after 30 days.

---

Support: team@equvinoxis.com
