# OneCurve Sports — Platform Proposal & Architecture (v2)

> Status: **PROPOSAL — awaiting owner confirmation of platform choice.**
> Once confirmed, this document becomes the README of the new platform repo.
> Prepared 2026-06-12. All costs are estimates in INR.

---

## 1. The decision: three realistic options

Your requirements that drive the choice:

- ONE shared inventory across online store and in-store POS
- Self-manageable CMS (no developer for daily operations)
- SEO is critical: full HTML to crawlers, structured data, fast mobile pages
- Razorpay with server-side order creation + signature verification
- Full data ownership and export at any time — no lock-in
- Open source preferred, but it must be secure
- Speed-to-revenue and low maintenance

### Option A — Shopify (SaaS)

| Factor | Assessment |
|---|---|
| Time to launch | **1–2 weeks** — fastest by far |
| Monthly cost | ~₹2,000–7,500 plan + ~2% Razorpay fees + apps (reviews, recommendations, POS Pro) → realistically **₹5,000–12,000/mo forever** |
| Lock-in | **Moderate-high.** Products/orders/customers export as CSV (meets your minimum bar), but themes, apps, reviews, and customizations are not portable. Migrating off later is a real project. |
| POS | Shopify POS app included (Lite); shares inventory natively |
| SEO | Good out of the box (server-rendered, automatic sitemap), limited deep control |
| Maintenance | Near zero — Shopify handles security, PCI, uptime |
| Open source | No |

**Take:** the right answer if revenue in the next two weeks matters more than
anything else. The wrong answer for "I own my platform and my data, open
source, no recurring platform tax."

### Option B — Open-source headless: Medusa + Next.js ⭐ RECOMMENDED

| Factor | Assessment |
|---|---|
| Time to launch | **8–10 weeks** to full v1 (phased; storefront + payments live around week 4) |
| Monthly cost | **₹1,000–3,000/mo** infra total (VPS, storage, email). No license fees. Razorpay ~2%/transaction. |
| Lock-in | **None.** Everything lives in your own PostgreSQL database on your own server. Export is `pg_dump` plus built-in CSV export. MIT-licensed software. |
| POS | Built as a thin screen on the **same** commerce API — shared inventory is architectural, not a sync job |
| SEO | First-class: Next.js server-rendering, full control of slugs, meta, schema.org, sitemap, Core Web Vitals |
| Maintenance | Real but automatable: dependency updates, server patches, monitored backups. You depend on a developer (Claude Code) for changes beyond the admin — but **all daily operations live in the admin UI**. |
| Open source | Yes — every component (see stack below) |

**Take:** the only option that meets *all ten acceptance criteria without
compromise*. The trade is time: ~2 months of build instead of 2 weeks.

### Option C — WooCommerce (open-source middle path)

| Factor | Assessment |
|---|---|
| Time to launch | 3–4 weeks |
| Monthly cost | ₹800–3,000/mo hosting + ~₹10,000–25,000/yr premium plugins |
| Lock-in | Low — data in your own MySQL |
| POS | Third-party plugins only (quality varies; real-time shared inventory works but is plugin-dependent) |
| SEO | Good (server-rendered PHP + RankMath/Yoast), but "good" mobile Core Web Vitals requires careful caching work |
| Maintenance | **Highest security overhead** — WordPress's plugin ecosystem is the most-attacked surface on the web; needs disciplined updates, hardening, WAF |
| Open source | Yes |

**Take:** a legitimate compromise, but it trades your two stated priorities
against each other — it's neither the fastest nor the most secure/ownable,
and POS (a non-negotiable) is its weakest link.

### Recommendation

**Option B — Medusa + Next.js.** Reasons, against your goals:

1. Single shared inventory is *native* — POS and storefront are two clients of
   one inventory service. No sync, no race conditions, no plugin lottery.
2. Data ownership is absolute: your Postgres, your server, MIT licenses.
3. SEO ceiling is the highest of the three (and SEO is your growth engine).
4. Lowest recurring cost; no platform tax compounding for years.
5. The "no developer" requirement is satisfied where it matters: every daily
   task (products, stock, prices, orders, coupons, pages, banners) happens in
   admin UIs. Development is only needed for new *features*, and Claude Code
   is the standing dev partner.

**Bridge option (optional):** the current Netlify site is ~1 day from taking
real Razorpay payments (per the existing execution list). We can light that up
to start revenue immediately while the real platform is built, then 301 it.

---

## 2. Recommended architecture (Option B)

Every component below is open source unless marked.

```
                        ┌──────────────────────────────────────────┐
                        │      VPS (Docker Compose, Caddy TLS)     │
                        │                                          │
 Shoppers ──HTTPS──▶    │  Next.js storefront (SSR)  ──┐           │
 Googlebot ─HTTPS──▶    │   + Payload CMS (pages,     │           │
                        │     banners, embedded)      │           │
                        │                             ▼           │
 You (admin) ──────▶    │  Medusa admin ──▶  Medusa backend       │
                        │                    (commerce API)       │
 Staff (POS) ──────▶    │  POS screen ────▶  • products/variants  │
                        │  (Next.js route,   • ONE inventory      │
                        │   staff auth)      • orders (channel-   │
                        │                      tagged)            │
                        │                    • customers, coupons │
                        │                             │           │
                        │  Meilisearch ◀── index ─────┤           │
                        │  PostgreSQL ◀───────────────┘           │
                        │  Redis (jobs/events)                    │
                        └──────────┬───────────────┬──────────────┘
                                   │               │
                          Razorpay API        SMTP (transactional
                          (server-side order   + abandoned-cart /
                           create + HMAC        back-in-stock email)
                           signature verify)
                                   │
                          Object storage (R2/B2):
                          product images + nightly
                          encrypted DB backups
```

### Stack components

| Layer | Choice | License | Why |
|---|---|---|---|
| Commerce backend | **Medusa v2** (Node/TypeScript) | MIT | Products, variants, ONE inventory, carts, orders, customers, coupons, sales channels (online/POS tags), admin UI, CSV import/export, role-based access |
| Storefront | **Next.js** (App Router, SSR) | MIT | Full HTML to crawlers, image optimization (WebP/AVIF), best-in-class Core Web Vitals control |
| Content CMS | **Payload CMS 3** (embeds inside the Next.js app) | MIT | Owner edits static pages, banners, merchandising blocks, per-page SEO fields — no developer |
| Database | **PostgreSQL** | PostgreSQL lic. | Single source of truth; trivially exportable |
| Search | **Meilisearch** | MIT | Instant search with filters (category, brand, size, price) + sorting |
| Payments | **Razorpay** (hosted checkout) | SaaS (unavoidable) | Cards, UPI, net-banking, wallets; PCI scope stays with Razorpay |
| Email | SMTP (Amazon SES or Zoho — ~₹0–500/mo) | SaaS | Order confirmations, abandoned cart, back-in-stock, owner alerts |
| Reverse proxy | **Caddy** | Apache-2.0 | Automatic HTTPS/HSTS, rate limiting, security headers |
| Hosting | Any VPS (Hetzner/DigitalOcean/Indian provider) | — | ~₹500–1,500/mo; Docker Compose, portable anywhere |
| Backups | nightly `pg_dump` → Cloudflare R2/Backblaze B2, restore-tested monthly | — | ~₹100/mo |

### Payment flow (never trusts the client)

1. Client submits cart → **server** recalculates prices, totals, GST, shipping
   from the database (client values ignored), checks stock.
2. Server creates a Razorpay Order (`amount` in paise) via secret key
   (env var on server only — never in client code or the repo).
3. Razorpay checkout opens on the client.
4. On payment, **server verifies the HMAC-SHA256 signature**
   (`razorpay_order_id|razorpay_payment_id` against key secret) **and** the
   webhook signature independently. Only then is the order marked paid,
   stock committed, and the confirmation email sent.
5. Failure/abandonment: order stays `pending_payment`; abandoned-cart email
   after a delay; stock is never reserved-forever.
6. Refunds: issued from the Medusa admin via Razorpay's refund API.
7. COD: optional toggle, order created as `pending_cod`, marked paid in POS/admin.

### POS (in-store screen)

- A staff-authenticated route in the same app: product search/barcode → cart →
  payment method (cash / card / UPI-QR) → order placed through the **same
  Medusa API** with sales channel `pos`. Inventory decrements instantly;
  online stock reflects within seconds (same row in the same database).
- Receipt: browser print (A6/thermal-friendly template) and/or email.
- Unified order list with channel tag; **daily reconciliation report**: cash
  total vs card/UPI total vs orders, exportable CSV.

### Recommendations & personalization (v1, rule-based)

- PDP "Related": same category/brand. "Frequently bought together": order-line
  co-occurrence query, refreshed nightly. Popular-items fallback everywhere.
- "Recently viewed": localStorage for guests, server-stored for accounts;
  returning visitors get personalized ordering on the home page.
- Cart cross-sell from the same co-occurrence data.
- Email triggers: abandoned cart (cron over stale carts), back-in-stock
  (notify-me list + inventory event).

### SEO build sheet

- SSR on every product/category/content page; clean slugs (`/products/original-player-edition`)
- Unique, owner-editable title + meta description per product/page (CMS fields)
- Canonical tags; `Product`/`Offer`/`AggregateRating`/`BreadcrumbList` JSON-LD
- Auto-regenerated `sitemap.xml` + `robots.txt`; Google Search Console verified
- Responsive WebP/AVIF images, lazy-loaded, descriptive editable alt text
- OG/Twitter cards; **301 redirects** from every current onecurve.in URL
- Core Web Vitals budget enforced in CI (Lighthouse) for key templates

### Security checklist (enforced, not aspirational)

- HTTPS + HSTS via Caddy; no mixed content
- No card data ever touches our server (Razorpay hosted checkout)
- Secrets only in server env vars; repo scanned for leaked keys in CI
- Argon2/bcrypt password hashing; admin behind strong auth **+ 2FA**
  (Cloudflare Access or Authelia in front of `/app` and `/pos`)
- Server-side validation of every price, total, and stock figure
- Rate limiting on auth, checkout, notify-me, newsletter endpoints
- OWASP Top 10: parameterized queries (ORM), output encoding, CSRF tokens,
  strict CSP and security headers
- Nightly encrypted off-site backups with a **monthly restore drill**
- Privacy policy, analytics consent banner, customer data export/delete on request
- Accessibility: keyboard nav, contrast (gold-on-dark verified), alt text,
  375px-width layout tested on every template

---

## 3. Phased delivery plan

| Phase | Weeks | Delivers | Acceptance criteria covered |
|---|---|---|---|
| 0 (optional bridge) | now | Razorpay wired into current Netlify site → revenue immediately | — |
| 1 — Foundations | 1–2 | VPS + Docker + Caddy HTTPS, Medusa + Postgres + admin live on staging, catalog imported, backups running | 8 (partial), 10 |
| 2 — Storefront + payments | 2–4 | SSR home/category/PDP/search/cart, guest checkout, Razorpay server-verified, order emails, slugs/meta/schema/sitemap/robots, Search Console | 2, 4, 5, 7 |
| 3 — Accounts + CMS | 4–6 | Customer accounts, order history/tracking, wishlist, reviews, notify-me; Payload pages/banners; coupons; staff roles; CSV import/export | 1, 6 (partial), 10 |
| 4 — POS + recommendations | 6–8 | POS screen, receipts, reconciliation report, channel-tagged unified orders; related/FBT/recently-viewed/cross-sell; abandoned-cart + back-in-stock emails | 3, 6 |
| 5 — Hardening + launch | 8–9 | Security checklist pass, CWV tuning, accessibility pass, restore drill, real product images only, DNS cutover + 301s | 7, 8, 9 |

Each phase ends with a demo against the acceptance criteria before the next
begins. Business decisions (GST display, shipping rates, COD policy, coupon
rules, launch date) will be asked, never assumed.

---

## 4. Cost summary (Option B)

| Item | One-time | Monthly |
|---|---|---|
| VPS (4GB) | — | ₹500–1,500 |
| Object storage + backups | — | ~₹100–200 |
| Transactional email | — | ₹0–500 |
| Domain (onecurve.in) | already owned | — |
| Software licenses | ₹0 (all open source) | ₹0 |
| Razorpay | — | ~2% per transaction |
| **Total platform cost** | **₹0** | **~₹1,000–2,500 + payment fees** |

---

## 5. What happens to the current repo

The current vanilla site stays live (optionally with real Razorpay as the
bridge) until Phase 5 cutover. The new platform is built in a new repository.
CLAUDE.md will be rewritten for the new stack on confirmation — several of its
rules (vanilla-JS-only, no npm, SPA) are superseded by this brief; the design
system (gold #C9A84C on near-black, Bebas Neue/DM Sans) carries over unchanged.
