# Wire CMS (API) ↔ Storefront (WYSIWYG catalog)

## Roles

| Piece | URL (now) | Purpose |
|---|---|---|
| **CMS** | `http://159.89.173.5:9000/app` | Medusa Admin — products, prices, SEO meta, stock, promos |
| **API** | `http://159.89.173.5:9000` | Same process; storefront talks here |
| **Shop** | `http://localhost:8000` (local) or Vercel later | Customer storefront |

No domain required for this step. CMS stays on **API IP**.

---

## 1) On the droplet — allow the shop origin (CORS)

```bash
cd ~/peculiar-sport-storefront/platform
git pull origin main
bash scripts/droplet-wire-storefront-cors.sh http://localhost:8000
```

When you host the shop on a domain later:

```bash
bash scripts/droplet-wire-storefront-cors.sh https://stage.onecurve.in
```

---

## 2) On your Mac — storefront env

```bash
cd platform/apps/storefront
cp .env.example .env.local
```

Edit `.env.local` (use your real pk_ from CMS bootstrap):

```bash
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://159.89.173.5:9000
MEDUSA_BACKEND_URL=http://159.89.173.5:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_afd4cb6af601da39989d1d354c39d7b7916780107413f045d14baa08fa356f90
NEXT_PUBLIC_BASE_URL=http://localhost:8000
NEXT_PUBLIC_DEFAULT_REGION=in
NEXT_PUBLIC_OC_ENV=stage
CATALOG_REVALIDATE_SECONDS=15
NEXT_IMAGE_HOSTS=159.89.173.5
REVALIDATE_SECRET=change-me-stage
```

Get publishable key if needed:

```bash
# on droplet
docker compose --env-file .env exec -T postgres psql -U medusa -d medusa -tAc \
  "select token from api_key where type='publishable' limit 1;"
```

---

## 3) Run the shop

```bash
cd platform
./dev.sh
# or only storefront if backend is remote:
# cd apps/storefront && npm run dev
```

Open **http://localhost:8000/in**

---

## 4) WYSIWYG: Admin edit → shop

| You change in CMS (`/app`) | Shop shows |
|---|---|
| Title, description, images | Yes (within revalidate window) |
| Price on variant | Yes |
| Stock / publish draft | Yes |
| Category assignment | Yes |
| SEO `metadata.seo_title` / `seo_desc` | Yes (PDP meta) |
| Promotions | Yes at cart/checkout once configured |

### How fresh?

- Default **stage**: catalog re-fetches every **~15 seconds** (`CATALOG_REVALIDATE_SECONDS`)
- Soft refresh the shop page (or wait 15s + refresh)
- **Instant** after big edits:

```bash
curl -X POST http://localhost:8000/api/revalidate \
  -H "x-revalidate-secret: change-me-stage"
```

(Hard refresh browser after revalidate.)

### Not WYSIWYG (by design)

| Content | Where |
|---|---|
| Home hero / brand story | Code (`BRAND.md` / React) |
| Legal pages | Code |
| Blog posts (today) | Code `lib/blog/posts.ts` |

Those need a deploy (or later a marketing CMS). **Catalog is always Medusa.**

---

## 5) Verify end-to-end

1. CMS: edit a product title or price → Save  
2. Wait ~15s or hit `/api/revalidate`  
3. Shop: hard refresh product page → new title/price  

```bash
# API has the change immediately:
curl -s -H "x-publishable-api-key: pk_…" \
  "http://159.89.173.5:9000/store/products?limit=1" | head
```

---

## 6) Production note

When shop is on Vercel:

- Same env vars, `NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api…` or IP with HTTPS later  
- `CATALOG_REVALIDATE_SECONDS=60`  
- Always set `REVALIDATE_SECRET`  
- CORS: add Vercel origin via `droplet-wire-storefront-cors.sh https://your-shop.vercel.app`
