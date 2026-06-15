#!/usr/bin/env bash
# One-time Codespaces setup: Postgres + Redis, deps, migrate+seed, admin user,
# and env files wired to the Codespace's public forwarded URLs.
set -e
cd "$(dirname "$0")/.."   # repo root

echo "▶ Installing PostgreSQL + Redis ..."
sudo apt-get update -y >/dev/null
sudo apt-get install -y postgresql postgresql-contrib redis-server >/dev/null
sudo service postgresql start
sudo service redis-server start

echo "▶ Creating database ..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='medusa'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE ROLE medusa LOGIN PASSWORD 'medusa' SUPERUSER;"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='onecurve'" | grep -q 1 || \
  sudo -u postgres createdb -O medusa onecurve

# --- Public Codespaces URLs -------------------------------------------------
DOMAIN="${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
STOREFRONT_URL="https://${CODESPACE_NAME}-8000.${DOMAIN}"
BACKEND_URL="https://${CODESPACE_NAME}-9000.${DOMAIN}"
echo "▶ Storefront: $STOREFRONT_URL"
echo "▶ Backend:    $BACKEND_URL"

echo "▶ Installing npm dependencies ..."
cd platform
npm install --no-audit --no-fund

# --- Backend env ------------------------------------------------------------
JWT=$(openssl rand -hex 32); COOKIE=$(openssl rand -hex 32); MFA=$(openssl rand -hex 32)
cat > apps/backend/.env <<EOF
DATABASE_URL=postgres://medusa:medusa@localhost:5432/onecurve
REDIS_URL=redis://localhost:6379
STORE_CORS=${STOREFRONT_URL}
ADMIN_CORS=${BACKEND_URL}
AUTH_CORS=${STOREFRONT_URL},${BACKEND_URL}
JWT_SECRET=${JWT}
COOKIE_SECRET=${COOKIE}
AUTH_MFA_ENCRYPTION_KEY=${MFA}
MEDUSA_BACKEND_URL=${BACKEND_URL}
MEDUSA_IMAGE_BASE_URL=${BACKEND_URL}
EOF

echo "▶ Running migrations + seed ..."
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

echo "✅ Setup complete. Publishable key: ${PK:-<not found, check /tmp/oc-seed.log>}"
