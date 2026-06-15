#!/usr/bin/env bash
# One-time Codespaces setup. Postgres + Redis come from sibling containers
# (see docker-compose.yml) — NO sudo / apt needed. Installs deps, seeds the
# DB, creates the admin user, and writes env files wired to the Codespace's
# public forwarded URLs.
set -e
cd "$(dirname "$0")/.."   # repo root

DB_HOST=db
REDIS_HOST=redis

echo "▶ Waiting for Postgres at ${DB_HOST}:5432 ..."
for i in $(seq 1 30); do
  if node -e "require('net').connect(5432,'${DB_HOST}').on('connect',()=>process.exit(0)).on('error',()=>process.exit(1))" 2>/dev/null; then
    echo "  Postgres is up."; break
  fi
  sleep 2
done

# --- Public Codespaces URLs -------------------------------------------------
DOMAIN="${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
STOREFRONT_URL="https://${CODESPACE_NAME}-8000.${DOMAIN}"
BACKEND_URL="https://${CODESPACE_NAME}-9000.${DOMAIN}"
echo "▶ Storefront: $STOREFRONT_URL"
echo "▶ Backend:    $BACKEND_URL"

echo "▶ Installing npm dependencies (this takes a few minutes) ..."
cd platform
npm install --no-audit --no-fund

# --- Backend env ------------------------------------------------------------
JWT=$(openssl rand -hex 32); COOKIE=$(openssl rand -hex 32); MFA=$(openssl rand -hex 32)
cat > apps/backend/.env <<EOF
DATABASE_URL=postgres://medusa:medusa@${DB_HOST}:5432/onecurve
REDIS_URL=redis://${REDIS_HOST}:6379
STORE_CORS=${STOREFRONT_URL}
ADMIN_CORS=${BACKEND_URL}
AUTH_CORS=${STOREFRONT_URL},${BACKEND_URL}
JWT_SECRET=${JWT}
COOKIE_SECRET=${COOKIE}
AUTH_MFA_ENCRYPTION_KEY=${MFA}
MEDUSA_BACKEND_URL=${BACKEND_URL}
MEDUSA_IMAGE_BASE_URL=${BACKEND_URL}
EOF

echo "▶ Running migrations + seeding catalog ..."
cd apps/backend
npx medusa db:migrate 2>&1 | tee /tmp/oc-seed.log
PK=$(grep -o 'pk_[0-9a-f]\{16,\}' /tmp/oc-seed.log | tail -1)

echo "▶ Creating admin user (admin@onecurve.in / onecurve123) ..."
npx medusa user -e admin@onecurve.in -p onecurve123 || true

# --- Storefront env ---------------------------------------------------------
cd ../storefront
cat > .env.local <<EOF
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${PK}
NEXT_PUBLIC_MEDUSA_BACKEND_URL=${BACKEND_URL}
MEDUSA_BACKEND_URL=${BACKEND_URL}
NEXT_PUBLIC_BASE_URL=${STOREFRONT_URL}
NEXT_PUBLIC_DEFAULT_REGION=in
NODE_ENV=development
EOF

echo "✅ Setup complete. Publishable key: ${PK:-<NOT FOUND — check /tmp/oc-seed.log>}"
echo "   Next: servers auto-start (postStart). Give the shop ~1–2 min to compile."
