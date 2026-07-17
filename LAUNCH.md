# OneCurve — Production Launch Plan (living)

**Status:** implementing · **Last updated:** 2026-07-17  
**Rule:** build & harden on **dev + stage**; flip to **prod** with one script when ready.

---

## 1. Direct answers

### Is the tech stack good?

**Yes — keep it.** Medusa v2 + Next.js + Postgres + Redis + Razorpay is the right
trade-off for a solo-owned India cricket shop:

| Need | How this stack meets it |
|---|---|
| Prod standards | SSR SEO, server-side payments, admin RBAC, typed monorepo, CI |
| Limited budget | No Shopify tax; ~₹1.5–3k/mo infra; open source |
| Employee ops | Medusa Admin (products, stock, orders) + Bookkeeping UI |
| Data ownership | Your Postgres — export anytime |
| Speed | Catalog + storefront largely built; finish payments + host |

**Do not** add Shopify, WooCommerce, or a second storefront. **Do not** grow
the stack with Meilisearch/Payload/POS until after first paid orders.

### Which cloud today? (Railway trial ended)

**Recommended: DigitalOcean Droplet (Bangalore) + Docker Compose + Cloudflare**

| Option | ~₹/mo | Verdict |
|---|---|---|
| **DO Bangalore 4GB Docker droplet** ⭐ | ~₹1,800–2,200 | Best: India latency, one box, exact `docker-compose.yml`, simple backups |
| Hetzner CX32 (EU) | ~₹1,300 | Cheaper but ~140ms from India — worse storefront SSR |
| Render / Fly.io split | ~₹2,000–4,000 | Fine, more moving parts |
| Vercel storefront + Neon + Upstash | ~₹0–2,500 | OK short-term; two vendors; cold starts |
| Railway (paid) | usage-based | Only if you already like it; trial ending is not a blocker to leave |

**Stage + prod on one droplet** with two compose projects (or two droplets when
revenue justifies). Cloudflare proxy for free TLS + DDoS. R2 for images (~₹0–100).

```bash
# On the droplet (after DNS)
cd platform
./scripts/flip-env.sh stage   # or prod --yes when ready
docker compose --env-file .env up -d --build
```

Full steps: [DEPLOY.md](DEPLOY.md) Path A.

---

## 2. Environments & feature flags

| Env | Purpose | Payments | Badge |
|---|---|---|---|
| **dev** | Local Mac | Manual only | DEV |
| **stage** | Partner/employee preview | Razorpay **test** keys | STAGE |
| **prod** | Live onecurve.in | Razorpay **live** keys; manual **off** | hidden |

```bash
cd platform
./scripts/flip-env.sh dev      # daily work
./scripts/flip-env.sh stage    # deploy preview
./scripts/flip-env.sh prod     # type "prod" to confirm — LIVE
./scripts/flip-env.sh status
npm run flags:validate
```

Flags live in `platform/config/flags/{dev,stage,prod}.json`.  
Secrets templates: `platform/config/env/*.env.example` → copy to `*.env` (gitignored).

**Prod flip is intentionally rebuild-based** (not a remote flag service): cheap,
auditable, e2e-deterministic. Storefront must rebuild after flip so
`NEXT_PUBLIC_*` flags bake in.

---

## 3. Implementation roadmap (phased)

### Phase A — Foundations (this PR / now) ✅ in progress
- [x] Feature flags + flip script
- [x] Env templates (dev/stage/prod)
- [x] Bookkeeping module + admin UI + CSV export
- [x] Legal pages (privacy, terms, shipping-returns)
- [x] Env badge (dev/stage)
- [x] Playwright e2e package (smoke / regression / usability)
- [ ] Wire Razorpay in **storefront** checkout (still P0)
- [ ] Free shipping rule ≥ ₹2,999 in Medusa shipping/promotions
- [ ] Order confirmation email

### Phase B — Employee-ready backend (stage)
- [ ] Deploy stage droplet; admin URL to staff
- [ ] Create staff users in Medusa Admin (Settings → Users)
- [ ] Train: products, stock, orders, bookkeeping expense entry
- [ ] Run e2e smoke against stage
- [ ] Nightly `pg_dump` cron → R2/local

### Phase C — Commerce complete (stage)
- [ ] Razorpay test checkout green path
- [ ] Free shipping + tax-inclusive pricing locked
- [ ] Manual payment disabled when `OC_ENV=stage` optional; forced off in prod flags
- [ ] Full regression e2e

### Phase D — UI redesign (parallel, no blocker)
Ship standards, not a rewrite:
1. Trust: legal links, shipping bar, order timeline clarity
2. PDP: sticky ATC, size/grade clarity, mobile gallery
3. Checkout: India address UX, UPI-first Razorpay, fewer steps
4. Performance: LCP images, less motion on mobile
5. Keep gold `#C9A84C` + Bebas/DM Sans — brand is non-negotiable

### Phase E — Prod flip
```bash
./scripts/flip-env.sh prod
# fill config/env/prod.env with LIVE secrets first
docker compose --env-file .env up -d --build
npm run test:e2e:smoke   # against prod URL after deploy — read-only checks
```
DNS → onecurve.in + api.onecurve.in · Search Console · first real order.

### Phase F — Post-revenue
POS · abandoned cart · COGS in bookkeeping · Payload CMS · advanced reports.

---

## 4. Bookkeeping (what employees use today)

| Action | Where |
|---|---|
| View sales / expenses / net | Admin → **Bookkeeping** (`/app/bookkeeping`) |
| Add expense | Same page (materials, rent, salary, logistics, …) |
| Export for CA | **Export CSV** or `GET /admin/bookkeeping/export?type=all` |
| Products / stock / orders | Standard Medusa Admin |

**Not yet:** full double-entry, GST returns filing, Tally sync.  
**Export CSV → accountant** is the intentional v1. Net = order totals − expenses.

After deploy, run migrations so the expense table exists:
```bash
cd platform/apps/backend && npx medusa db:migrate
```

---

## 5. QA — agentic (preferred) + optional classic scripts

**Default:** agentic missions (natural language YAML). No selector maintenance.
**Auto:** GitHub Action `Agentic QA` on every push (see secrets below).

```bash
# Terminal 1
cd platform && ./scripts/flip-env.sh dev && ./dev.sh

# Terminal 2
export XAI_API_KEY=...   # or GROQ_API_KEY
export E2E_BASE_URL=http://localhost:8000
npm install
npm run test:agentic:smoke    # deploy gate
npm run test:agentic:all      # all missions
```

| Layer | What | Maintain |
|---|---|---|
| **Agentic** (primary) | AI shopper runs `missions/*.yaml` against live UI | Edit YAML goals only |
| Classic Playwright | Optional `tests/*.spec.ts` | Avoid unless needed |
| Flags validate | Always on CI | `config/flags/*.json` |

### GitHub secrets (enable auto QA on push)

`E2E_BASE_URL` = stage shop URL · `XAI_API_KEY` (or `GROQ_API_KEY`)

Workflow: `.github/workflows/agentic-qa.yml`  
Reports: Actions → run → artifact `agentic-qa-report`

---

## 6. Budget envelope (monthly)

| Item | Estimate |
|---|---|
| DO Bangalore 4GB | ₹1,800–2,200 |
| Cloudflare R2 | ₹0–100 |
| Domain | owned |
| Razorpay | ~2%/txn |
| Email (Resend free tier) | ₹0–500 |
| **Total** | **~₹2,000–3,000 + payment fees** |

---

## 7. Next engineering session (ordered)

1. Razorpay Checkout button in Next storefront (flags-aware)
2. Free shipping promotion / shipping option rules
3. Stage droplet deploy + staff admin accounts
4. Order email (Resend)
5. UI redesign pass on PDP + checkout only
6. Prod flip when smoke + one paid test order pass on stage

---

## 8. Owner / employee cheat-sheet

```
Shop (stage/prod):  https://…/
Admin:              https://api…/app
Bookkeeping:        https://api…/app/bookkeeping
Health:             https://api…/health

Flip env:           cd platform && ./scripts/flip-env.sh <dev|stage|prod>
E2E smoke:          npm run test:e2e:smoke
Flags check:        npm run flags:validate
```
