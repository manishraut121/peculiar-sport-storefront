# Go live TODAY — backend for your team

**Goal:** employees can open Admin, manage products/stock/orders/bookkeeping  
**Not required today:** perfect storefront polish, live Razorpay, custom domain (nice-to-have)

---

## The pick (one sentence)

| Priority | Provider | Why |
|---|---|---|
| **⭐ Do this** | **DigitalOcean Droplet · Bangalore · 4 GB · Docker** | Fits Medusa + Postgres + Redis on one box, India latency, flat **~$24/mo (~₹2,000)**, you already have `docker-compose.yml` |
| Fastest if account still works | **Railway (paid, $5–10 credit)** | You already ran this stack there — add card, redeploy, 15–20 min |
| Avoid for Medusa prod | Free-tier Render / free Railway / e2-micro GCP | Sleeps, OOM kills, or too little RAM |

**Storefront (shop) today (optional):** Vercel free → root `platform/apps/storefront` once API URL is public.  
**Admin does not need the storefront** — staff only need `https://api…/app`.

---

## Why not the others (today)

| Option | Verdict |
|---|---|
| Railway free trial | Ended — paid still fine if you want zero re-learning |
| Render free | Sleeps + underpowered for Medusa build/boot |
| Render paid multi-service | Works, but **3 billable services** (API+PG+Redis) often **>$25–40/mo** and more wiring |
| Fly.io | Fine engineering, slower “first day” DX for this stack |
| AWS/GCP | Overkill cost/complexity for OneCurve v1 |
| Vercel for **backend** | Wrong tool (serverless); Vercel is for the **Next** shop only |

---

## Path ⭐ — DigitalOcean (recommended permanent home)

### What you create (15–20 min account + droplet)

1. Sign up: [digitalocean.com](https://www.digitalocean.com)  
2. **Create → Droplets**  
   - Region: **Bangalore (BLR1)**  
   - Image: **Marketplace → Docker** (Ubuntu + Docker preinstalled)  
   - Size: **Basic · Regular · 4 GB RAM / 2 vCPU** (~$24/mo)  
   - Auth: **SSH key** (recommended) or password  
3. Create droplet → copy **public IPv4**

### On the droplet (copy-paste)

```bash
# SSH in
ssh root@YOUR_DROPLET_IP

# App directory
git clone https://github.com/manishraut121/peculiar-sport-storefront.git
cd peculiar-sport-storefront/platform

# Stage env for team (not live payments yet)
cp config/env/stage.env.example config/env/stage.env
nano config/env/stage.env
```

**Minimum values to set in `config/env/stage.env`:**

```bash
POSTGRES_PASSWORD=          # long random
JWT_SECRET=                 # openssl rand -hex 32
COOKIE_SECRET=              # openssl rand -hex 32
AUTH_MFA_ENCRYPTION_KEY=    # openssl rand -hex 32
MEDUSA_ADMIN_EMAIL=admin@onecurve.in
MEDUSA_ADMIN_PASSWORD=      # strong password you share with staff carefully

# Temporary URLs using the droplet IP (HTTPS later via Cloudflare)
STOREFRONT_URL=http://YOUR_DROPLET_IP:8000
BACKEND_URL=http://YOUR_DROPLET_IP:9000
STORE_CORS=http://YOUR_DROPLET_IP:8000
ADMIN_CORS=http://YOUR_DROPLET_IP:9000
AUTH_CORS=http://YOUR_DROPLET_IP:8000,http://YOUR_DROPLET_IP:9000

# leave Razorpay empty for now
MEDUSA_PUBLISHABLE_KEY=pk_will_fill_after_boot
```

```bash
./scripts/flip-env.sh stage

# First: backend + db only
docker compose --env-file .env up -d --build postgres redis backend

# Watch boot (5–10 min first time)
docker compose logs -f backend
# Wait for:  == OC BOOT CHECK: products=… publishable_key=pk_… ==
```

Copy `pk_…` into `config/env/stage.env` as `MEDUSA_PUBLISHABLE_KEY`, then:

```bash
./scripts/flip-env.sh stage
docker compose --env-file .env up -d --build storefront   # optional today
```

### Open firewall ports

DigitalOcean → Droplet → **Networking → Firewalls** (or `ufw`):

- **22** SSH  
- **9000** backend/admin (required today)  
- **8000** storefront (optional today)

```bash
ufw allow 22 && ufw allow 9000 && ufw allow 8000 && ufw enable
```

### Give your folks access **today**

| Who | URL | Login |
|---|---|---|
| All staff | `http://YOUR_DROPLET_IP:9000/app` | `MEDUSA_ADMIN_EMAIL` / password you set |
| Health check | `http://YOUR_DROPLET_IP:9000/health` | — |
| Bookkeeping | `http://YOUR_DROPLET_IP:9000/app/bookkeeping` | after migrate (auto on boot) |

**Staff users:** Admin → **Settings → Users** → invite/create employees (don’t share the owner password forever).

### Same day upgrades (when DNS is ready)

1. Cloudflare → `api-stage.onecurve.in` → droplet IP (proxied)  
2. Or install Caddy for free HTTPS on the droplet  
3. Update `BACKEND_URL` / CORS in `stage.env` → `flip-env` → `docker compose up -d`

---

## Path B — Railway paid (fastest if you already know it)

1. railway.app → project → **Add credit / payment method**  
2. Redeploy service root: `platform/apps/backend`  
3. Ensure Postgres + Redis attached  
4. Env vars (same as before): `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `COOKIE_SECRET`,  
   `MEDUSA_ADMIN_EMAIL`, `MEDUSA_ADMIN_PASSWORD`, `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS`  
5. Public domain → port **9000**  
6. Logs → copy `pk_…` for storefront later  

Staff URL: `https://YOUR-RAILWAY-DOMAIN/app`

---

## What “live for folks” means (checklist)

- [ ] Backend `/health` returns OK from phone (not only your Mac)  
- [ ] `/app` login works  
- [ ] Products list shows seeded catalog (or you can create one)  
- [ ] At least one employee account created  
- [ ] Bookkeeping page opens (expense entry)  
- [ ] You saved admin password in a password manager  

Storefront + Razorpay + `onecurve.in` can follow **after** staff are in.

---

## Cost envelope

| Setup | ~Monthly |
|---|---|
| DO Bangalore 4 GB (all-in) | **₹1,800–2,200** |
| Railway hobby usage | **₹500–2,000** (variable) |
| + Cloudflare | ₹0 |
| + R2 images later | ₹0–100 |

---

## Decision rule

```
Need staff on admin in the next 2 hours?
  └─ Railway account + card handy?  → Path B (Railway paid)
  └─ Starting fresh / want stable India box? → Path ⭐ (DO Bangalore)

Need public shop + payments this week?
  └─ Same DO box (compose already includes storefront)
  └─ Or Vercel storefront → this backend
```

---

## If something fails

| Symptom | Fix |
|---|---|
| `npx medusa build` exit code 1 on 1GB | **Almost always OOM.** Run low-mem prep (below), retry. Or resize droplet to **2 GB (~$12)**. |
| `publishable key` on shop | After boot: copy `pk_…` from logs; storefront env |
| Admin 502 | `docker compose logs backend` — wait for STEP 4/4 |
| Can’t reach from phone | Open port 9000 / Cloudflare proxy |
| Empty products | Boot seed; or Admin → create product |
| SSH “Connection closed” mid-build | Normal if laptop sleeps; build may still run — re-SSH and check `docker ps` / logs |

### Backend “migrations failed” / never gets job done (USE THIS)

**Do not upgrade DigitalOcean.** Do not re-run migrate in a restart loop.

Pre-migrated DB dump is in the repo. On the droplet:

```bash
cd ~/peculiar-sport-storefront/platform
git pull origin main
bash scripts/droplet-bootstrap-from-seed.sh
```

That **restores** schema + 22 products and starts Admin **without** `medusa db:migrate` on the server.

Then open: `http://YOUR_IP:9000/app`

### 1GB droplet: medusa build failed (exit 1)

SSH back in and run:

```bash
cd /root/peculiar-sport-storefront/platform
git pull origin main
bash scripts/droplet-lowmem.sh          # 4G swap + docker prune

# rebuild with log file (so we can debug if it fails again)
docker compose --env-file .env build backend 2>&1 | tee /tmp/backend-build.log

# if build OK:
docker compose --env-file .env up -d postgres redis backend
docker compose logs -f backend
# wait for: OC BOOT CHECK … publishable_key=pk_…
```

If build still dies after ~5–15 min with exit 1 and almost no error text → **resize droplet to 2 GB** in DO UI (power off → resize → power on), then rebuild. Medusa admin compile needs more RAM than $6 can comfortably give.

To see the real error:

```bash
tail -100 /tmp/backend-build.log
dmesg | tail -30 | grep -i -E 'kill|oom' || true
```

Local reference still works: `cd platform && ./dev.sh` → http://localhost:9000/app
