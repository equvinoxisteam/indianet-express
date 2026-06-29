# Indianet Express — Full category tree + layout examples

## How the category system works

```
TOP NAV (Header = true)     HOMEPAGE SHOP GRID (Section One)
        │                              │
   Main Category ──────────────────────┘
        │
   Main Sub (group in mega menu)
        │
   Sub (link under main sub in mega menu)
```

| Admin button | What it creates | Where it shows |
|--------------|-----------------|----------------|
| **Add Category** | Main category + image | Shop grid, category pages `/c/slug` |
| **Add Main Sub** | Sub-group under a main category | Header mega menu (column heading) |
| **Add Sub** | Small link under a main sub | Header mega menu (links under heading) |
| **Add Header** | Marks category `header: true` | Top navigation bar on storefront |

**Order to build:** Category → Main Sub → Sub → Add Header (set true).

---

## STEP 1 — Add all 6 main categories

**Categories → Add Category** (Name + square image each):

| # | Name | Image idea |
|---|------|------------|
| 1 | Industrial Tools | Grinder / drill |
| 2 | Electrical & Electronics | Multimeter |
| 3 | Safety Equipment | Helmet |
| 4 | Motors & Pumps | Water pump |
| 5 | Bearings & Power Transmission | Bearings |
| 6 | Packaging & Material Handling | Stretch wrap |

Click **Show Categories** to verify.

---

## STEP 2 — Main Sub categories (examples for ALL 6)

**Categories → Add Main Sub** → Name + search & select parent category:

### 1. Industrial Tools
| Main Sub name | Parent category |
|---------------|-----------------|
| Power Tools | Industrial Tools |
| Hand Tools | Industrial Tools |
| Cutting Tools | Industrial Tools |

### 2. Electrical & Electronics
| Main Sub name | Parent category |
|---------------|-----------------|
| Test & Measurement | Electrical & Electronics |
| Cables & Wires | Electrical & Electronics |
| Switches & MCB | Electrical & Electronics |

### 3. Safety Equipment
| Main Sub name | Parent category |
|---------------|-----------------|
| Head Protection | Safety Equipment |
| Hand Protection | Safety Equipment |
| Eye Protection | Safety Equipment |

### 4. Motors & Pumps
| Main Sub name | Parent category |
|---------------|-----------------|
| Water Pumps | Motors & Pumps |
| Electric Motors | Motors & Pumps |
| Pump Accessories | Motors & Pumps |

### 5. Bearings & Power Transmission
| Main Sub name | Parent category |
|---------------|-----------------|
| Ball Bearings | Bearings & Power Transmission |
| Roller Bearings | Bearings & Power Transmission |
| Belts & Chains | Bearings & Power Transmission |

### 6. Packaging & Material Handling
| Main Sub name | Parent category |
|---------------|-----------------|
| Stretch Wrap | Packaging & Material Handling |
| Trolleys & Carts | Packaging & Material Handling |
| Warehouse Labels | Packaging & Material Handling |

Click **Show Main Sub** to verify (18 rows).

---

## STEP 3 — Sub categories (3 per main sub — examples)

**Categories → Add Sub** → Name + search main sub + select from dropdown.

### Industrial Tools → Power Tools
| Sub name | Select main sub |
|----------|-----------------|
| Angle Grinders | Power Tools |
| Drills | Power Tools |
| Impact Drivers | Power Tools |

### Industrial Tools → Hand Tools
| Sub name | Select main sub |
|----------|-----------------|
| Spanners | Hand Tools |
| Pliers | Hand Tools |
| Screwdriver Sets | Hand Tools |

### Electrical → Test & Measurement
| Sub name | Select main sub |
|----------|-----------------|
| Digital Multimeters | Test & Measurement |
| Clamp Meters | Test & Measurement |
| Insulation Testers | Test & Measurement |

### Electrical → Cables & Wires
| Sub name | Select main sub |
|----------|-----------------|
| House Wire | Cables & Wires |
| Flexible Cable | Cables & Wires |
| Coaxial Cable | Cables & Wires |

### Safety → Head Protection
| Sub name | Select main sub |
|----------|-----------------|
| Safety Helmets | Head Protection |
| Bump Caps | Head Protection |

### Safety → Hand Protection
| Sub name | Select main sub |
|----------|-----------------|
| Cut Resistant Gloves | Hand Protection |
| Latex Gloves | Hand Protection |

*(Repeat pattern for other main subs — 2–3 sub links each is enough for launch.)*

Click **Show Sub** to verify.

---

## STEP 4 — Add to header (top nav)

**Categories → Add Header** for each category you want in the top menu:

| Search category | Header Available |
|-----------------|------------------|
| Industrial Tools | **true** |
| Electrical & Electronics | **true** |
| Safety Equipment | **true** |
| Motors & Pumps | **true** |
| Bearings & Power Transmission | **true** |
| Packaging & Material Handling | **true** |

Only categories with `header: true` appear in the storefront top navigation mega menu.

---

## STEP 5 — Full layout setup

### Slider 1 (Hero) — 3 slides

| Slide | Title | Button | Link | Sub content |
|-------|-------|--------|------|-------------|
| 1 | INDUSTRIAL SUPPLIES | Shop Now | `/categories` | Tools, electrical & safety — delivered across India |
| 2 | TOP DEALS | Browse Deals | `/categories` | Best prices from verified sellers |
| 3 | SELL FREE | Start Selling | `/vendor/register` | List products — no subscription fee |

Image: **1920×600 px** each.

### Section One — SHOP grid
| Title | `SHOP` |
| Sub Title | `Browse categories and order online` |
| Items | Add all **6 main categories** |

### Section Two — Top Deals
| Title | `Top Deals` |
| Sub Title | `Best prices this week` |
| Items | Add **8–12 published products** |

### Section Three — New Arrivals
| Title | `New Arrivals` |
| Sub Title | `Fresh listings from verified sellers` |
| Items | Add **6–8 different products** |

### Section Four — Best Sellers
| Title | `Best Sellers` |
| Sub Title | `Most ordered industrial products` |
| Items | Add **6–8 products** |

### Slider 2 (mid banner)
| Image | Link |
|-------|------|
| Promo banner 1920×400 | `https://indianetexpress.equvinoxis.com/categories` |

### Bottom Banner
| Image | Link |
|-------|------|
| Sell on Indianet 1200×300 | `https://indianetexpress.equvinoxis.com/vendor/register` |

---

## STEP 6 — Products must use category names

When vendor/admin adds a product, **Category** dropdown must match a **main category name** exactly, e.g.:
- `Industrial Tools`
- `Electrical & Electronics`

Example products:

| Product | Category | Price ₹ |
|---------|----------|---------|
| Angle Grinder 4" | Industrial Tools | 2499 |
| Digital Multimeter | Electrical & Electronics | 899 |
| Safety Helmet ISI | Safety Equipment | 450 |
| Monoblock Pump 1HP | Motors & Pumps | 4200 |
| Ball Bearing 6205 | Bearings & Power Transmission | 180 |
| Stretch Wrap Roll | Packaging & Material Handling | 320 |

---

## Quick checklist

| Step | Action | Verify |
|------|--------|--------|
| 1 | 6 categories + images | Show Categories |
| 2 | 18 main subs (3 each) | Show Main Sub |
| 3 | 2–3 subs per main sub | Show Sub |
| 4 | Header true on all 6 | Top nav on website |
| 5 | Slider 1 (3 slides) | Show Slider 1 |
| 6 | Section 1 (6 categories) | Show Section 1 |
| 7 | Products published | Section 2–4 |
| 8 | Slider 2 + Banner | Homepage complete |

---

## Build order (important)

```
1. Add Category (×6)
2. Add Main Sub (×18)
3. Add Sub (×36 or fewer for launch)
4. Add Header (×6, all true)
5. Layouts: Slider 1 → Section 1 → products → Sections 2–4 → Slider 2 → Banner
```
