# OneCurve Platform — Medusa v2 + Next.js

The new OneCurve commerce platform (see [../PLATFORM.md](../PLATFORM.md) for the
full architecture and phased plan). Everything runs from this directory.

```
platform/                  (npm workspaces + turborepo)
├── apps/
│   ├── backend/      Medusa v2 — commerce API, admin UI, ONE shared inventory
│   └── storefront/   Next.js — server-rendered shop (SEO-first)
├── docker-compose.yml   production-style stack (postgres, redis, backend, storefront)
├── .env.example  copy to .env and fill in (never commit .env)
└── dev.sh        one-command local development
```

## Environments (dev / stage / prod)

Feature flags control payments, free-ship thresholds, bookkeeping, AI, etc.

```bash
./scripts/flip-env.sh dev      # local (manual payments)
./scripts/flip-env.sh stage    # Razorpay TEST keys
./scripts/flip-env.sh prod     # LIVE — type "prod" to confirm
./scripts/flip-env.sh status
```

Full launch plan: [../LAUNCH.md](../LAUNCH.md).

## Run it locally (macOS, no Docker needed)

One-time setup (already done on the dev machine):

```bash
brew install node@22 postgresql@16 redis
brew services start postgresql@16
brew services start redis
export PATH="/usr/local/opt/node@22/bin:$PATH"   # add to ~/.zshrc
```

Then, from the repo:

```bash
cd platform
./scripts/flip-env.sh dev
./dev.sh
# If you ever see "valid publishable key is required":
./scripts/sync-publishable-key.sh   # then restart storefront
```

Open:

| What | URL |
|---|---|
| Storefront (shop) | http://localhost:8000 |
| Admin (manage products, stock, orders) | http://localhost:9000/app |
| API health check | http://localhost:9000/health |

Admin login: `admin@onecurve.in` — initial password is in
`platform/.admin-initial-password.txt` on the dev machine (not in git);
change it after first login, or reset any time:

```bash
cd platform/apps/backend && npx medusa user -e admin@onecurve.in -p NEW_PASSWORD
```

## Run it anywhere with Docker

```bash
cd platform
cp .env.example .env    # fill in secrets (openssl rand -hex 32 for each)
docker compose up -d backend      # backend + db first (storefront build needs it)
docker compose up -d storefront
```

Same URLs as above. This is also exactly how the production server runs it.

## Hosting — recommendation

**Short answer: don't use the GCP free tier for production.** Its always-free
VM (e2-micro) has 1 GB RAM shared-CPU in US regions only — too small for
Postgres + Medusa + Next.js, and every shopper request would cross the
Pacific. Fine as a throwaway sandbox, not for a shop taking money.

Recommended (fits the ₹2,500–7,500/mo budget):

| Option | ~Cost/mo | Notes |
|---|---|---|
| **DigitalOcean droplet, Bangalore (4 GB)** ⭐ | ~₹2,000 ($24) | India region = fast for your customers; runs this exact docker-compose; weekly snapshot backups ~₹400 extra |
| Hetzner CX32 (Germany, 8 GB) | ~₹1,300 (€14) | Cheapest for the specs, but ~140 ms from India — noticeably slower SSR |
| GCP e2-small, Mumbai + managed SQL | ~₹4,500+ | Fine, but costs more than DO for the same thing; free tier ≠ Mumbai |

Plan: DO droplet (Docker preinstalled image) → `git clone` this repo →
`docker compose up -d` → point DNS → Caddy/DO load balancer for HTTPS.
Nightly `pg_dump` to Cloudflare R2 (~₹100/mo) for off-site backups.

## Your data, always exportable

- Products/orders/customers: CSV export buttons in the admin UI
- Full database: `pg_dump onecurve > backup.sql` (everything, restorable anywhere)

## Day-to-day (owner + employee cheat-sheet)

- Add/edit products, prices, stock, images, categories: **admin → Products**
- Orders (online + POS together, channel-tagged): **admin → Orders**
- Discounts/coupons: **admin → Promotions**
- Staff accounts: **admin → Settings → Users**
- **Bookkeeping** (sales vs expenses, CSV for CA): **admin → Bookkeeping**

## QA (agentic — auto on push)

```bash
# stack on :8000; needs XAI_API_KEY or GROQ_API_KEY
export E2E_BASE_URL=http://localhost:8000
npm run test:agentic:smoke
```

Missions (edit these, not selectors): `apps/e2e/agentic/missions/*.yaml`  
CI: `.github/workflows/agentic-qa.yml` — set repo secrets `E2E_BASE_URL` + `XAI_API_KEY`.
