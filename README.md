# Indianet Express

Industrial e-commerce platform — browse products, add to cart, pay online (Razorpay) or COD, and ship via ShipRocket.

**Live site:** https://www.indianetexpress.equvinoxis.com  
**API:** https://api.indianetexpress.equvinoxis.com

## Stack

- **Client:** Next.js (`Client/`)
- **Server:** Express + MongoDB (`SERVER/`)
- **Storage:** AWS S3 (`indianet-express-equvinoxis`)
- **Payments:** Razorpay
- **Shipping:** ShipRocket
- **Deploy:** Railway (see `RAILWAY_DEPLOY_EXPRESS.md`)

## Quick start (local)

```bash
# Server
cd SERVER && npm install && cp .env.example .env
# Edit .env with your keys, then:
npm run dev

# Client (new terminal)
cd Client && npm install && cp .env.example .env.local
npm run dev
```

## Features

- **Buyers:** Search, product pages, cart, checkout, orders, tracking
- **Vendors:** Product catalogue, orders, fulfilment, subscription plans
- **Admin:** Orders, products, categories, vendors, coupons

No RFQ — pure Amazon-style e-commerce.
