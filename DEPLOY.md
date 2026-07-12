# Deploy OneCurve

Two supported paths. **A** is your own server (recommended long-term — flat
cost, full control, no platform surprises). **B** is the managed
Vercel + Railway combo (fastest to stand up; currently running).

---

## Path A — Your own VPS (the "real server")

One Mumbai/Bangalore VPS runs the whole stack via Docker Compose — database,
backend, storefront. ~₹2,000/mo flat (e.g. DigitalOcean 4GB, Bangalore).

1. Create the VPS: DigitalOcean → Droplet → **Bangalore** → the "Docker on
   Ubuntu" marketplace image → 4 GB RAM. Add your SSH key.
2. On the server:
   ```bash
   git clone https://github.com/manishraut121/peculiar-sport-storefront.git
   cd peculiar-sport-storefront/platform
   cp .env.example .env
   nano .env        # fill: POSTGRES_PASSWORD, JWT/COOKIE/MFA secrets,
                    # MEDUSA_ADMIN_EMAIL/PASSWORD, BACKEND_URL, STOREFRONT_URL,
                    # MEDUSA_PUBLISHABLE_KEY (after first boot — see below)
   docker compose up -d --build
   docker compose logs -f backend   # watch STEP 1/4..4/4 + OC BOOT CHECK
   ```
3. First boot prints `OC BOOT CHECK: … publishable_key=pk_…` — put that in
   `.env` as `MEDUSA_PUBLISHABLE_KEY`, then `docker compose up -d --build storefront`.
4. TLS + domains: point `onecurve.in` → server IP (storefront :8000) and
   `api.onecurve.in` → server IP (backend :9000), then put Caddy or the
   Cloudflare proxy in front for HTTPS. Update the CORS/URL vars in `.env`.
5. Updates: `git pull && docker compose up -d --build`.
   Backups: `docker compose exec postgres pg_dump -U medusa medusa > backup.sql`
   (nightly cron + copy off-server recommended).

---

## Path B — Managed cloud (Vercel + Railway + Cloudflare R2)

A permanent, public, 24/7 store — no Mac needed. This is also the foundation
you launch on. ~₹0 to start; scales with traffic.

```
 Shoppers ─▶ Vercel (Next.js storefront)  ──store API──▶  Railway
                                                           ├─ Medusa backend (admin + API)
                                                           ├─ PostgreSQL  (catalog/orders/customers)
                                                           └─ Redis
 Product images (admin uploads) ─▶ Cloudflare R2
```

You'll create 3 free accounts and click through the steps below. Everything
deploys **from this GitHub repo** — no uploading files by hand.

---

## 1. Railway — backend + database + redis (one project)

1. Sign up at **railway.app** with your GitHub account.
2. **New Project → Deploy from GitHub repo** → pick `peculiar-sport-storefront`.
3. When it asks what to deploy, set the service **Root Directory** to
   `platform/apps/backend` (it will use the Dockerfile there automatically).
4. In the project, **+ New → Database → PostgreSQL**, then again **+ New →
   Database → Redis**. Railway wires their connection strings into the project.
5. Open the **backend service → Variables** and add:
   ```
   DATABASE_URL   = ${{Postgres.DATABASE_URL}}
   REDIS_URL      = ${{Redis.REDIS_URL}}
   JWT_SECRET     = <run: openssl rand -hex 32>
   COOKIE_SECRET  = <run: openssl rand -hex 32>
   AUTH_MFA_ENCRYPTION_KEY = <run: openssl rand -hex 32>
   STORE_CORS     = https://<your-vercel-app>.vercel.app
   ADMIN_CORS     = https://<your-railway-backend>.up.railway.app
   AUTH_CORS      = https://<your-vercel-app>.vercel.app,https://<your-railway-backend>.up.railway.app
   MEDUSA_BACKEND_URL      = https://<your-railway-backend>.up.railway.app
   MEDUSA_IMAGE_BASE_URL   = https://<your-railway-backend>.up.railway.app
   MEDUSA_ADMIN_EMAIL      = admin@onecurve.in
   MEDUSA_ADMIN_PASSWORD   = <choose a strong password>
   ```
   (Fill the Vercel/Railway URLs after they exist; edits redeploy
   automatically. Boot runs migrations + seeds the catalog + creates the
   admin user from MEDUSA_ADMIN_* — no shell needed. The server always
   listens on port 9000, so the domain's target port must be 9000; a PORT
   variable is not needed.)
6. **Settings → Networking → Generate Domain** to get the backend's public
   URL — set its target port to **9000**.
7. Watch **Deployments → View Logs**. Boot prints clear markers:
   `== OneCurve boot: STEP 1/4 ... STEP 4/4 ==` and
   `== OC BOOT CHECK: products=22 publishable_key=pk_... ==` —
   copy that `pk_...` for step 2 (Vercel).

### AI customer care (optional but recommended)
The storefront ships with a 24×7 assistant grounded in your catalog +
policies. Without any key it answers from built-in rules. To power it with an
open-source LLM, add ONE of these to the backend variables:
   ```
   GROQ_API_KEY    = gsk_...   # free at console.groq.com — open models
   ASSISTANT_MODEL = gemma2-9b-it   # optional; default llama-3.1-8b-instant
   ```
   or self-hosted (e.g. a small VM running Ollama with Gemma):
   ```
   OLLAMA_URL      = https://your-ollama-host:11434
   ASSISTANT_MODEL = gemma2:2b
   ```

## 2. Vercel — storefront

1. Sign up at **vercel.com** with GitHub. **Add New → Project →** import
   `peculiar-sport-storefront`.
2. Set **Root Directory** to `platform/apps/storefront`. Framework: Next.js
   (auto-detected).
3. **Environment Variables:**
   ```
   NEXT_PUBLIC_MEDUSA_BACKEND_URL      = https://<your-railway-backend>.up.railway.app
   MEDUSA_BACKEND_URL                  = https://<your-railway-backend>.up.railway.app
   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY  = pk_... (from step 1.8)
   NEXT_PUBLIC_BASE_URL                = https://<your-vercel-app>.vercel.app
   NEXT_PUBLIC_DEFAULT_REGION          = in
   ```
4. **Deploy.** When done, copy the Vercel URL and paste it into Railway's
   `STORE_CORS` / `AUTH_CORS` / `NEXT_PUBLIC_BASE_URL` (step 1.5), then redeploy
   the backend. **That Vercel URL is your partner's test link.**

## 3. Cloudflare R2 — product images (for admin uploads)

The 22 seeded images are bundled into the backend already, so the store shows
images immediately. R2 is needed so that **new photos you upload in the admin**
survive restarts.

1. Sign up at **cloudflare.com → R2 → Create bucket** (e.g. `onecurve-media`).
2. **R2 → Manage API Tokens → Create** (Object Read & Write). Note the
   Access Key ID + Secret.
3. Enable a public URL for the bucket (R2 → bucket → Settings → Public access),
   or attach a custom domain like `media.onecurve.in`.
4. Add to Railway backend Variables, then redeploy:
   ```
   S3_ACCESS_KEY_ID     = <key id>
   S3_SECRET_ACCESS_KEY = <secret>
   S3_BUCKET            = onecurve-media
   S3_ENDPOINT          = https://<account_id>.r2.cloudflarestorage.com
   S3_REGION            = auto
   S3_FILE_URL          = https://<your-public-r2-url>
   ```

## 4. Go live on onecurve.in (when ready)

- **Vercel → Domains:** add `onecurve.in` and `www`, follow the DNS records.
- Point a subdomain (e.g. `api.onecurve.in`) at the Railway backend, and update
  the `*_CORS`, `MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_*` URLs accordingly.
- Razorpay: add `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` (test, then live) to
  Railway — the provider is already wired and turns on automatically.

## Security notes (already handled)
- HTTPS everywhere (Vercel + Railway + Cloudflare terminate TLS automatically).
- Secrets live only in each platform's env var store — never in the repo.
- Server-side price/stock validation + Razorpay signature verification are in
  the code already.
- Backups: Railway Postgres has automated backups; you can also `pg_dump` anytime.

## Cost
- **Now:** Vercel Hobby free + Railway trial credit + R2 free tier ≈ ₹0.
- **With real traffic:** ~₹400–800/mo Railway usage + Vercel Pro (optional
  ₹1,700/mo) + R2 ~₹0–100. Move to a single Mumbai VPS (see PLATFORM.md) if you
  later want lowest flat cost + full control.
