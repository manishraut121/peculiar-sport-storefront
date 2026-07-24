# OneCurve — Sales cutover (stage → prod)

**Goal:** one live shop, one inventory (Medusa), real Razorpay, vanilla bridge off.

---

## Architecture (what is connected)

```
Medusa Admin  ──API──►  Next.js storefront  ──Razorpay──►  paid order
   /app                  platform/apps/storefront

Vanilla index.html / Netlify  =  SEPARATE (do not sell on both)
```

| Piece | Stage now | Prod target |
|-------|-----------|-------------|
| CMS/API | `http://159.89.173.5:9000` | `https://api.onecurve.in` |
| Shop | localhost:8000 or Vercel stage | `https://onecurve.in` |
| Payments | Razorpay **test** | Razorpay **live** |

---

## Phase 1 — Stage money path (do today)

### A. On droplet — Razorpay test keys

```bash
ssh root@159.89.173.5
cd ~/peculiar-sport-storefront/platform   # or your clone path
git pull origin main

export RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
export RAZORPAY_KEY_SECRET=xxxxxxxx
export SHOP_ORIGIN=http://localhost:8000   # or https://your-stage-shop
bash scripts/droplet-enable-razorpay-stage.sh
```

### B. On your Mac — storefront

```bash
cd platform/apps/storefront
# .env.local already points at droplet; ensure:
# NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://159.89.173.5:9000
# NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_…
# NEXT_PUBLIC_OC_ENV=stage
# NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_…   # optional fallback

cd ../..
./dev.sh   # or: cd apps/storefront && npm run dev
```

### C. Test order

1. Open `http://localhost:8000/in`
2. Add product → checkout → address (India)
3. Shipping → Payment → **UPI · Cards · Net banking**
4. Review → **Pay with UPI / Cards**
5. Razorpay test modal → use [test instruments](https://razorpay.com/docs/payments/payments/test-card-upi-details/)
6. Order confirmation page + Admin → **Orders**

If only “Manual Payment” shows: Razorpay provider not registered or not linked to region — re-run `enable-razorpay-region` after backend restart.

---

## Phase 2 — Public stage shop (HTTPS)

1. Deploy Next storefront (Vercel recommended) from `platform/apps/storefront`
2. Env on host:

```bash
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://159.89.173.5:9000   # or https://api-stage…
MEDUSA_BACKEND_URL=same
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_…
NEXT_PUBLIC_BASE_URL=https://stage.onecurve.in
NEXT_PUBLIC_OC_ENV=stage
NEXT_PUBLIC_DEFAULT_REGION=in
CATALOG_REVALIDATE_SECONDS=15
REVALIDATE_SECRET=long-random
NEXT_IMAGE_HOSTS=159.89.173.5
```

3. On droplet:

```bash
bash scripts/droplet-wire-storefront-cors.sh https://stage.onecurve.in
```

4. DNS: `stage.onecurve.in` → Vercel; later `api-stage` → droplet with TLS.

---

## Phase 3 — Prod flip

```bash
# On droplet (or prod host)
cp config/env/prod.env.example config/env/prod.env
# Fill: POSTGRES_*, JWT_*, COOKIE_*, RAZORPAY live keys, URLs, secrets
./scripts/flip-env.sh prod    # type "prod"
docker compose --env-file .env up -d --build

# Link live Razorpay to region (if new DB)
docker compose exec backend npx medusa exec ./src/scripts/enable-razorpay-region.ts
```

Storefront prod rebuild with:

- `NEXT_PUBLIC_OC_ENV=prod`
- `NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.onecurve.in`
- live publishable key
- `manual_checkout` off via flags (baked at build)

DNS:

- `onecurve.in` → Next shop  
- `api.onecurve.in` → Medusa  
- `COOKIE_SECURE` / HTTPS only  

---

## Phase 4 — Kill vanilla dual-checkout

Repo root Netlify SPA must **not** take money after cutover.

### Option A — Netlify redirect entire site to platform (recommended)

In root `netlify.toml` (after platform is live):

```toml
[[redirects]]
  from = "/*"
  to = "https://onecurve.in/:splat"
  status = 301
  force = true
```

### Option B — Keep vanity pages only, block checkout paths

Redirect `/` and shop paths; leave nothing that calls Razorpay.

### Checklist

- [ ] No Netlify env with `rzp_live` still serving checkout  
- [ ] Search Console: sitemap points at platform URLs  
- [ ] One inventory = Medusa only  

---

## Phase 5 — Sales readiness (ops)

- [ ] 3+ products with **real photos** + stock  
- [ ] Free shipping ₹2,999 matches shipping option / promo  
- [ ] Order email or WhatsApp alert to owner  
- [ ] Nightly DB backup (`pg_dump`)  
- [ ] Returns process you can execute in 7 days  
- [ ] Support@ mailbox monitored  

---

## Code shipped for this cutover

| Item | Path |
|------|------|
| Razorpay Checkout UI | `storefront/.../payment-button` |
| Signature confirm API | `backend/src/api/store/razorpay/confirm` |
| Region link script | `backend/src/scripts/enable-razorpay-region.ts` |
| Droplet stage helper | `scripts/droplet-enable-razorpay-stage.sh` |
| Flag defaults stage/prod | `storefront/src/lib/flags.ts` |

---

## Done when

One test **live** payment succeeds on prod domain, order is in Admin, customer sees confirmation, vanilla Netlify cannot create a second order.
