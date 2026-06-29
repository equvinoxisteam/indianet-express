# Indianet Express — Production Guide

End-to-end multi-vendor e-commerce: buyer orders → vendor fulfills → Shiprocket delivers.

**Live URLs**
- Storefront: https://indianetexpress.equvinoxis.com
- API: https://api.indianetexpress.equvinoxis.com
- Health: https://api.indianetexpress.equvinoxis.com/health

---

## 1. Admin login

1. Open **https://indianetexpress.equvinoxis.com/admin/login**
2. Sign in with your Railway backend env:
   - **Email:** `ADMIN_EMAIL` (e.g. `team@equvinoxis.com`)
   - **Password:** `ADMIN_PASSWORD`
3. On first server start, the admin account is created/updated from these env vars.

### Admin tasks

| Task | Where |
|------|--------|
| Approve vendors | Admin → Vendors → Accept |
| Manage categories | Admin → Categories |
| Homepage banners & sliders | Admin → Layouts |
| Featured products (sections 2–4) | Admin → Layouts |
| All orders | Admin → Orders |
| Coupons | Admin → Coupons |

---

## 2. Homepage setup (robocraze-style)

The homepage shows:

1. **Hero slider** — Admin → Layouts → Slider One (upload images + titles)
2. **SHOP grid** — Auto-loads all categories with “from ₹X” pricing
3. **Promo banners** — Slider Two + Banner in Layouts
4. **Product carousels** — Sections 2, 3, 4 in Layouts (pick products)

**Minimum to go live:**
1. Admin → **Categories** — add categories with images
2. Admin → **Layouts** — upload at least one hero slide
3. Vendors add products (or admin adds products) with price, weight, dimensions

---

## 3. Seller (vendor) flow — no subscription fees

1. Seller registers: `/vendor/register`
2. Admin approves vendor → **free seller plan** auto-activated (unlimited products)
3. Seller adds products with:
   - Price, MRP, images
   - Weight (kg), length/breadth/height (cm) — required for shipping quotes
   - Warehouse PIN code in vendor settings
4. Seller publishes products
5. Orders appear in **Vendor → Orders**
6. Seller packs item → updates status: **Processing → Shipped**
7. Shiprocket picks up and delivers; buyer gets email + WhatsApp

---

## 4. Buyer flow

1. Browse homepage **SHOP** categories or search
2. Add to cart → Checkout
3. Enter PIN → shipping + GST recalculated (Shiprocket rates)
4. Pay via **Razorpay** or **COD**
5. Track order: **My Account → Orders**

---

## 5. Required env vars (Railway backend)

```env
# Core
DB_NAME=indianet-express
CLIENT_URL=https://indianetexpress.equvinoxis.com
CORS_ORIGINS=https://indianetexpress.equvinoxis.com

# Payments (replace placeholders)
RAZORPAY_ID=rzp_live_xxxxx
RAZORPAY_SECREt=your_secret

# Shipping (replace placeholders)
SHIPROCKET_EMAIL=your@shiprocket.in
SHIPROCKET_PASS=your_password
SHIPROCKET_PICKUP_POSTCODE=110001
SHIPROCKET_PICKUPID=Primary
```

**Frontend (2 vars only):**
```env
ServerUrl=https://api.indianetexpress.equvinoxis.com/api
ServerId=https://indianet-express-equvinoxis.s3.eu-north-1.amazonaws.com
```

### Shiprocket setup

1. Create account at shiprocket.in
2. Add a **pickup location** matching `SHIPROCKET_PICKUPID`
3. Set `SHIPROCKET_PICKUP_POSTCODE` to that warehouse PIN
4. Each vendor should set their PIN in **Vendor → Settings** (used for multi-vendor shipping estimates)

---

## 6. Order → delivery flow

```
Buyer checkout (Razorpay/COD)
  → Order saved in MongoDB
  → Shiprocket adhoc order created per line item
  → Email + WhatsApp to buyer, vendor, admin
Vendor packs → marks Shipped
  → Shiprocket courier pickup
  → Buyer tracks AWB in My Orders
  → Status auto-updates via Shiprocket tracking
```

---

## 7. Legal pages

- Terms: `/terms`
- Privacy: `/privacy-policy`
- Shipping: `/shipping`
- Help: `/help`

---

## 8. Deploy after code push

1. Push to `indianet-express` repo on GitHub
2. Railway auto-redeploys Client + SERVER services
3. Verify `/health` returns `{"ok":true,"db":true,"storage":"s3"}`
4. Test admin login, add category, vendor product, test checkout

---

Support: team@equvinoxis.com
