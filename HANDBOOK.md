# OneCurve — CTO Handbook

The single source of truth for how the OneCurve platform is built, run,
secured, and taken live. Written for the owner (non-developer) + any future
engineer. Last updated 2026-06-16.

---

## 1. What this is, in one paragraph

OneCurve is a self-owned e-commerce platform for cricket equipment (India,
INR). It is **not** a SaaS you rent — you own the code and the data. Two apps:
a **Medusa v2** backend (commerce engine + admin) and a **Next.js** storefront,
sharing **one** inventory across web and (future) in-store POS. Everything is
open source; the only paid pieces are hosting (~₹0 now) and Razorpay's ~2% per
transaction. Full architecture rationale: [PLATFORM.md](PLATFORM.md).

---

## 2. Current status (what's live vs pending)

| Piece | Status |
|---|---|
| Backend (Medusa) on Railway | ✅ **LIVE** — https://peculiar-sport-storefront-staging.up.railway.app — note: the ROOT url shows "Cannot GET /", that is normal; use `/app` (admin) or `/health` |
| Admin UI | ✅ live at `…railway.app/app` |
| PostgreSQL + Redis (Railway) | ✅ live |
| Catalog (22 products, images, pricing) | ✅ seeded on the live DB |
| Storefront on Vercel | ⏳ **your next step** (~10 min, §7) |
| Smart search | ✅ built (goes live with storefront) |
| AI customer care (open-source LLM) | ✅ built; add a key to make it conversational (§6) |
| Razorpay payments | ⏳ code done, dormant — add keys (§6) |
| CI (GitHub Actions) | ✅ builds both apps on every push |
| CD (auto-deploy) | ✅ Railway auto-deploys `platform-phase-1`; Vercel will too |
| Custom domain onecurve.in | ⏳ point DNS after Vercel (§7) |

---

## 3. What we've built (feature inventory)

**Storefront (Next.js, server-rendered for SEO)**
- Home (dark, immersive), category, product (PDP), cart, guest + account checkout,
  order history, wishlist, reviews scaffolding.
- **Smart search** — instant results overlay (Cmd/Ctrl+K), thumbnails + prices.
- **AI customer-care chat** — floating widget, 24×7, grounded in catalog + policies.
- **Blog** — 3 SEO articles, server-rendered.
- **SEO** — Product/Offer/Breadcrumb/Article/Organization JSON-LD, dynamic
  `sitemap.xml`, `robots.txt`, canonical, OpenGraph/Twitter, MRP-discount pricing.
- Hybrid theme: dark home + light shop, gold-on-brand.

**Backend (Medusa v2)**
- Products, variants, ONE shared inventory, orders, customers, coupons.
- Admin UI (manage everything, no developer needed).
- Online Store + POS sales channels on one stock location.
- **Razorpay** payment provider (server-side order + signature verify + refund + webhook).
- **/store/assistant** AI endpoint (pluggable open-source LLM).
- Self-diagnosing boot (`start.sh`) + business report script.

**Ops**
- Dockerised backend; `docker-compose.yml` for a one-box VPS deploy.
- GitHub Actions CI; Railway/Vercel CD.
- Deploy guide ([DEPLOY.md](DEPLOY.md)), Codespaces test env ([CODESPACES.md](CODESPACES.md)).

---

## 4. Architecture / the ecosystem

```
                 ┌─────────────── Vercel ───────────────┐
 Shoppers ─────▶ │  Next.js storefront (SSR + edge CDN)  │
 Googlebot ────▶ │  search overlay · AI chat widget      │
                 └───────┬───────────────────┬───────────┘
                store API│                    │ /store/assistant
                         ▼                    ▼
                 ┌──────────────────── Railway ─────────────────────┐
 You (admin) ──▶ │  Medusa backend (:9000)  admin UI at /app        │
                 │   • catalog · ONE inventory · orders · customers  │
                 │   • Razorpay provider · AI assistant route        │
                 │  PostgreSQL   ◀── source of truth (exportable)    │
                 │  Redis        ◀── events / jobs / cache           │
                 └───────┬───────────────┬──────────────┬───────────┘
                         │               │              │
                  Razorpay API      Open-source LLM   Cloudflare R2
                  (UPI/cards)       Groq(Gemma/Llama) (admin-uploaded
                                    or self-host Ollama  images)
```

**Repo layout** (monorepo, npm workspaces + turborepo):
```
/                       legacy vanilla site (revenue bridge, being retired)
platform/
  apps/backend/         Medusa v2  (commerce API + admin)
  apps/storefront/      Next.js    (shop)
  docker-compose.yml    one-box VPS option
data/products.json      catalog source of truth
.github/workflows/ci.yml  CI
```

---

## 5. Environments & branches

| Env | Storefront | Backend | Database |
|---|---|---|---|
| **Local** (your Mac) | localhost:8000 | localhost:9000 | Homebrew Postgres `onecurve` |
| **Cloud** | Vercel (pending) | Railway (live) | Railway Postgres |

- Git branches: **`dev`** = daily work (your local machine tracks this),
  **`platform-phase-1`** = deploy branch (Railway/Vercel build from it; merge
  dev → platform-phase-1 to release), **`main`** = stable (merge PR #1 when
  ready to crown it).
- **CD:** every push to `platform-phase-1` auto-redeploys Railway (and Vercel
  once connected). CI runs first and fails the build on TS/compile errors.
- To promote to `main`: merge PR #1 (main becomes the source of truth; repoint
  Railway/Vercel to `main`).

---

## 6. API keys & secrets — the full inventory

**Golden rule:** secrets live ONLY in each platform's env-var store (Railway
Variables, Vercel Environment Variables). They are NEVER committed — `.env` /
`.env.local` are git-ignored, and `git check-ignore` is used to confirm before
every commit. Rotate by editing the variable + redeploy.

| Secret / key | What it's for | Where to get it | Where it goes | Required? |
|---|---|---|---|---|
| `DATABASE_URL` | Postgres connection | Railway (auto) | Railway backend | ✅ |
| `REDIS_URL` | Redis connection | Railway (auto) | Railway backend | ✅ |
| `JWT_SECRET`, `COOKIE_SECRET`, `AUTH_MFA_ENCRYPTION_KEY` | Session/auth signing | `openssl rand -hex 32` | Railway backend | ✅ |
| `MEDUSA_ADMIN_EMAIL` / `MEDUSA_ADMIN_PASSWORD` | Auto-creates your admin login on boot | you choose | Railway backend | ✅ (recommended) |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` (`pk_…`) | Storefront ↔ backend (public, safe to expose) | backend boot log | Vercel | ✅ |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Real payments | dashboard.razorpay.com → API Keys | Railway backend | for payments |
| `RAZORPAY_WEBHOOK_SECRET` | Verify payment webhooks | Razorpay → Webhooks | Railway backend | optional |
| `GROQ_API_KEY` (+ `ASSISTANT_MODEL=gemma2-9b-it`) | Free hosted open-source LLM for the chat | console.groq.com (free) | Railway backend | optional |
| `OLLAMA_URL` (+ `ASSISTANT_MODEL=gemma2:2b`) | Self-hosted LLM (alt to Groq) | your Ollama host | Railway backend | optional |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` / `S3_BUCKET` / `S3_ENDPOINT` / `S3_FILE_URL` | Cloudflare R2 for admin-uploaded images | Cloudflare R2 | Railway backend | when you upload new photos |

**Publishable vs secret:** `pk_…` is *publishable* — it's meant to be in the
browser; not a secret. Everything else in the table above IS secret.

---

## 7. Go-live checklist (your steps)

1. **Backend admin login** — Railway → backend → Variables → add
   `MEDUSA_ADMIN_EMAIL=admin@onecurve.in` and `MEDUSA_ADMIN_PASSWORD=<strong>`.
   Redeploy. Log in at `…railway.app/app`.
2. **Get the storefront key** — Railway → backend → Deployments → latest → Logs
   → copy the `pk_…` from the `OC BOOT CHECK` line.
3. **Deploy the storefront on Vercel** ([DEPLOY.md](DEPLOY.md) §2): import the
   repo, root dir `platform/apps/storefront`, branch `platform-phase-1`, add the
   5 env vars (incl. the `pk_…` and the Railway backend URL). Deploy.
4. **Wire CORS** — put the Vercel URL into Railway's `STORE_CORS` /`AUTH_CORS` /
   `NEXT_PUBLIC_BASE_URL`; redeploy backend. **The Vercel URL is your live/test store.**
5. **Turn on AI (optional)** — add `GROQ_API_KEY` + `ASSISTANT_MODEL=gemma2-9b-it`.
6. **Turn on payments** — complete Razorpay KYC, add `RAZORPAY_KEY_ID` /
   `RAZORPAY_KEY_SECRET` (test first, then live).
7. **Custom domain** — Vercel → Domains → add `onecurve.in`, follow DNS records;
   point `api.onecurve.in` at Railway; update the URL/CORS vars.

---

## 8. How to manage the ecosystem (day-to-day)

**Everything commercial → the Admin UI** (`…/app`), no developer:
- Products, variants, prices, stock, images, categories, collections.
- Orders (online + POS, channel-tagged), fulfilment, refunds.
- Discounts/coupons, customers, staff accounts & roles.
- Bulk CSV import/export of products, and data export for orders/customers.

**Content (blog, static copy)** is code-managed today (in the repo). Migrating
this to an in-admin CMS (Payload) is a Phase-3 item if you want to edit posts
without a developer.

**Business snapshot from the terminal:**
```
cd platform/apps/backend && npx medusa exec ./src/scripts/report.ts
```
→ prints product count, low-stock items, order count, revenue.

---

## 9. How to query the database

Three ways, easiest first:

1. **Railway Data tab** — Railway → Postgres service → **Data**. A point-and-click
   table browser + a **Query** box for SQL. No install.
2. **The report script** (§8) for the common business numbers.
3. **psql / any SQL client** — Railway → Postgres → **Connect** → copy the
   connection string:
   ```
   psql "postgresql://…@…railway.app:5432/railway"
   ```
   Example queries:
   ```sql
   -- catalog
   select title, status from product order by title;
   -- stock by SKU
   select ii.sku, ll.stocked_quantity
     from inventory_item ii
     join inventory_level ll on ll.inventory_item_id = ii.id
     order by ll.stocked_quantity;
   -- recent orders
   select display_id, email, total, created_at
     from "order" order by created_at desc limit 20;
   ```

**Exports / no lock-in:** admin CSV export, or a full dump anytime:
```
pg_dump "postgresql://…railway.app:5432/railway" > onecurve-backup.sql
```

---

## 10. CI/CD, logs, backups

- **CI** — `.github/workflows/ci.yml` runs `medusa build` + `next build` on every
  push/PR. This is the strict compile that catches TypeScript errors *before*
  they reach a deploy (it would have caught the error that failed our first
  Railway build). See the ✓/✗ on each commit in GitHub → Actions.
- **CD** — push to `platform-phase-1` → Railway rebuilds the backend; Vercel
  rebuilds the storefront (once connected). Roll back from each platform's
  Deployments list (one click → "Redeploy" an older build).
- **Logs** — Railway → backend → Deployments → View Logs. Boot prints
  `STEP 1/4…4/4` and `OC BOOT CHECK: products=N publishable_key=pk_…`.
- **Backups** — Railway Postgres has automated backups; take manual `pg_dump`s
  before big changes. Nightly off-site dump to R2/B2 is a recommended add.

---

## 11. Security posture (what's already handled)

- HTTPS everywhere (Vercel/Railway terminate TLS); secrets only in env stores.
- Server-side price/stock validation; Razorpay HMAC signature verification.
- Store API requires a publishable key; admin behind login (enable 2FA).
- AI endpoint: catalog/policy-grounded, per-IP + global rate limits, no secret leakage.
- **Private data never in public product metadata** (wholesale cost was leaked
  and has been removed — do not re-add it; metadata is world-readable via the API).
- PCI scope minimised — card data never touches our servers (Razorpay hosted).

**Recommended next:** admin 2FA, nightly off-site DB backup with a monthly
restore test, a WAF/rate-limit in front of `/store` if abuse appears.

---

## 12. What I need from you

- **Decisions:** GST display (inclusive vs added line), COD on/off, coupon
  rules, launch date. (Prices are set; shipping is ₹199 / free ≥ ₹2,999.)
- **Keys/accounts to create:** Vercel, (optional) Groq for the AI, Razorpay KYC.
- **The `pk_…`** from the Railway boot log so I can walk you through Vercel.

---

## 13. Roadmap (remaining phases)

- **Now:** storefront on Vercel → full store live for your partner + customers.
- **Phase 4:** in-store POS screen (shares the same inventory), receipts,
  daily cash reconciliation.
- **Phase 5:** recommendations (related / frequently-bought), abandoned-cart +
  back-in-stock emails, admin CMS for blog/pages, real product photos,
  hardening + onecurve.in cutover with 301s.
- **Real-server option (recommended over Railway long-term):** a single
  Mumbai/Bangalore VPS running `platform/docker-compose.yml` — flat ~₹2,000/mo,
  full control, no trial-credit surprises. It is deploy-ready today:
  `cp .env.example .env`, fill secrets, `docker compose up -d --build`.
  See DEPLOY.md "Your own VPS".
