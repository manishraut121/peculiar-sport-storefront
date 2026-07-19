# OneCurve — How you run the store (CMS & ops)

**Short answer:** You do **not** need WordPress.  
**Medusa Admin is your commerce CMS.** The Next.js storefront **reads** it.  
Marketing pages (about, long guides) can later sit in a light content CMS — products never should.

---

## 1. Who does what (roles)

| Job | Where | Who |
|---|---|---|
| Add/edit products, photos, stock | Medusa Admin → **Products** | You / staff |
| Change **price** | Product → variants → prices (INR) | You / staff |
| **SEO title / description** | Product → Metadata: `seo_title`, `seo_desc` | You / staff |
| Hide product | Set status **Draft** (not published) | You / staff |
| Categories (Bats, Pads, Gym…) | Admin → **Categories** | You |
| Collections (e.g. “Monsoon sale”, “New”) | Admin → **Collections** | You |
| **Promotions / coupons** | Admin → **Promotions** | You |
| Orders, refunds, fulfill | Admin → **Orders** | You / staff |
| Blog / long articles (today) | Code: `storefront/src/lib/blog/posts.ts` | Dev |
| Legal pages | Code: `/legal/*` routes | Dev (rarely change) |
| Bookkeeping expenses | Admin → **Bookkeeping** (when enabled) | You |

Staff CMS login: **`http://cms.onecurve.in:9000/app`** (or your droplet URL + `/app`).  
Bookmark **`/app`** — that is the CMS. Root `/` is not a website homepage.  
Never give staff SSH/root for daily ops.

---

## 2. Product content model (sticky SEO)

Every product should have:

| Field | Where in Admin | Used for |
|---|---|---|
| Title | Product title | H1 / cards |
| Handle (slug) | URL key | `/products/{handle}` |
| Description | Description | PDP body + fallback meta |
| Thumbnail + images | Media | PDP, OG image |
| Category | Categories | Nav, SEO silos |
| Variant price (INR) | Variants → prices | Cart, schema.org Offer |
| Stock | Inventory | Sold out / ATC |
| `metadata.seo_title` | Metadata JSON / custom fields | `<title>` |
| `metadata.seo_desc` | Metadata | meta description |
| `metadata.mrp` | Metadata (optional) | Strike-through MRP |
| `metadata.badge` | Metadata (optional) | “Pro”, “New” |

Storefront already prefers:

```text
seo_title → title tag
seo_desc  → meta description + Product JSON-LD description
```

**Rule:** Never put wholesale cost or secrets in metadata (it is public via the Store API).

### Bulk SEO / catalog from file (optional)

```bash
cd platform/apps/backend
npx medusa exec ./src/scripts/update-catalog.ts
```

Reads `data/products.json` and updates descriptions + `seo_*` on existing products.

---

## 3. Prices & promotions

| Change | How |
|---|---|
| Permanent price | Edit variant price in Admin |
| Sale % / coupon | **Promotions** (e.g. code `DIWALI10`, free shipping over X) |
| Free shipping threshold | Shipping options / promotion rules (target: ≥ ₹2,999) |
| Flash “badge” only | `metadata.badge` + optional MRP |

Customers always see **server-calculated** totals (Medusa cart) — not hard-coded storefront prices.

---

## 4. Multi-sport growth (taxonomy)

Use **Categories** (and later parent categories), not new websites:

```text
Team sports
  └── Cricket (live: bats, pads, gloves, keeping)
  └── Football / Hockey (later)
Training & gym
  └── Strength, mats, accessories (later)
Nutrition
  └── Protein, hydration (later)  — compliance: FSSAI / claims
Recovery
  └── Mobility, care (later)
```

**Home page** sells **verticals** (cricket live; others “Coming soon” or empty category).  
When you add gym SKUs in Admin + assign category, they appear with **no redesign**.

---

## 5. Do you need another CMS?

| Need | Tool | When |
|---|---|---|
| Products, price, stock, SEO fields, promos, orders | **Medusa Admin (now)** | Day 0 |
| Landing page banners, “About”, merchandising blocks without deploy | **Payload CMS** or similar **embedded in Next** | When marketing edits weekly without you |
| Blog at scale with non-dev authors | Payload / Sanity / Tina | When blog > ~10 posts and non-devs write |
| Full marketing site separate from shop | Avoid | Splits SEO and inventory |

**Recommendation:**  
1. **Now–3 months:** Medusa Admin only + rare deploys for legal/blog.  
2. **When it hurts:** Add Payload (or equivalent) **only for pages/banners**, still Medusa for products.  
3. **Never** put product price/stock in a second CMS.

---

## 6. Daily / weekly checklist

**Daily**
- [ ] Orders → pack / mark fulfilled  
- [ ] Low stock (Admin inventory or report script)

**Weekly**
- [ ] New products or restocks  
- [ ] Check 1–2 product SEO titles in Google Search Console  
- [ ] One promotion or collection refresh  

**Monthly**
- [ ] Export orders / bookkeeping CSV for CA  
- [ ] Review category descriptions for SEO  

---

## 7. URLs that stay sticky (SEO)

| Page | Managed by |
|---|---|
| `/` Home | Code (brand) + live products from API |
| `/store` | Code + all published products |
| `/categories/{handle}` | Category name/desc in Admin |
| `/products/{handle}` | Product in Admin |
| `/blog/*` | Code (for now) |
| `/legal/*` | Code |

Changing a product title/slug in Admin updates the live shop after cache refresh — no storefront redeploy for catalog.

---

## 8. Access for employees

1. Owner creates staff in Admin → Settings → Users  
2. They only use `/app`  
3. They **do not** need DigitalOcean SSH  
4. Optional: Cloudflare Access in front of `/app` later  

---

*This is the operating system for OneCurve. Brand story lives in BRAND.md; pixels in the storefront; truth of money and stock in Medusa.*
