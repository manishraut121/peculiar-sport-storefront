#!/usr/bin/env bash
# =============================================================================
# GET THE BACKEND RUNNING — no on-server `medusa db:migrate`
#
# Medusa migrate OOMs / fails on small DO boxes. We ship a pre-migrated DB
# dump (22 products + full schema) and restore it instead.
#
# On the droplet:
#   cd ~/peculiar-sport-storefront/platform
#   git pull origin main
#   bash scripts/droplet-bootstrap-from-seed.sh
#
# Cost: same $6–12 droplet. No upgrade required.
# =============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."

SEED="deploy/db/medusa-seed.sql.gz"
if [ ! -f "$SEED" ]; then
  echo "✗ Missing $SEED — git pull origin main"
  exit 1
fi

if [ ! -f .env ]; then
  echo "✗ No .env — create stage env first (flip-env or manual)"
  exit 1
fi

# shellcheck disable=SC1091
set -a
# shellcheck source=/dev/null
source .env
set +a

IP=$(curl -s --max-time 5 ifconfig.me 2>/dev/null || curl -s --max-time 5 icanhazip.com 2>/dev/null || echo "")
PUBLIC_BACKEND="${BACKEND_URL:-http://${IP}:9000}"
# strip trailing slash
PUBLIC_BACKEND="${PUBLIC_BACKEND%/}"

echo "════════════════════════════════════════════"
echo "  OneCurve bootstrap FROM SEED (no migrate)"
echo "  Public API: $PUBLIC_BACKEND"
echo "════════════════════════════════════════════"

echo "▶ Stop crash-loop backend…"
docker compose --env-file .env stop backend 2>/dev/null || true
docker compose --env-file .env rm -f backend 2>/dev/null || true

echo "▶ Reset Postgres volume…"
docker compose --env-file .env stop postgres 2>/dev/null || true
docker compose --env-file .env rm -f postgres 2>/dev/null || true
VOL=$(docker volume ls -q | grep -E 'pgdata$' | head -1 || true)
if [ -n "${VOL:-}" ]; then
  docker volume rm "$VOL" || true
  echo "  removed $VOL"
fi

echo "▶ Start Postgres + Redis…"
docker compose --env-file .env up -d postgres redis
for i in $(seq 1 40); do
  docker compose --env-file .env exec -T postgres pg_isready -U medusa && break
  sleep 2
done
docker compose --env-file .env exec -T postgres pg_isready -U medusa

echo "▶ Restore seed dump (schema + 22 products)…"
# Wait a beat for first-time init
sleep 3
gunzip -c "$SEED" | docker compose --env-file .env exec -T postgres \
  psql -U medusa -d medusa -v ON_ERROR_STOP=1

echo "▶ Rewrite image/localhost URLs → $PUBLIC_BACKEND …"
docker compose --env-file .env exec -T postgres psql -U medusa -d medusa -v ON_ERROR_STOP=1 <<SQL
UPDATE image SET url = replace(url, 'http://localhost:9000', '${PUBLIC_BACKEND}')
  WHERE url LIKE 'http://localhost:9000%';
UPDATE image SET url = replace(url, 'https://localhost:9000', '${PUBLIC_BACKEND}')
  WHERE url LIKE 'https://localhost:9000%';
SQL

echo "▶ Force SKIP_DB_MIGRATE=1 in .env …"
if grep -q '^SKIP_DB_MIGRATE=' .env; then
  sed -i 's/^SKIP_DB_MIGRATE=.*/SKIP_DB_MIGRATE=1/' .env
else
  echo 'SKIP_DB_MIGRATE=1' >> .env
fi

echo "▶ Ensure admin password from .env (re-create if needed)…"
# Start backend once to run user create via one-off
docker compose --env-file .env up -d --build backend

echo "▶ Waiting for /health (up to 4 min)…"
OK=0
for i in $(seq 1 48); do
  if curl -sf --max-time 3 http://127.0.0.1:9000/health >/dev/null 2>&1; then
    OK=1
    break
  fi
  # show progress
  if [ $((i % 6)) -eq 0 ]; then
    echo "  … still starting ($((i*5))s) — $(docker compose ps backend --format '{{.Status}}' 2>/dev/null || true)"
  fi
  sleep 5
done

if [ "$OK" != "1" ]; then
  echo "✗ Health not OK. Logs:"
  docker compose logs backend --tail 60
  exit 1
fi

echo "▶ Create/ensure admin user…"
if [ -n "${MEDUSA_ADMIN_EMAIL:-}" ] && [ -n "${MEDUSA_ADMIN_PASSWORD:-}" ]; then
  docker compose --env-file .env exec -T backend \
    sh -c "npx medusa user -e \"$MEDUSA_ADMIN_EMAIL\" -p \"$MEDUSA_ADMIN_PASSWORD\"" \
    2>/dev/null || echo "  (admin may already exist — ok)"
fi

PK=$(docker compose --env-file .env exec -T postgres psql -U medusa -d medusa -tAc \
  "select token from api_key where type='publishable' and deleted_at is null limit 1;" | tr -d '[:space:]')

echo ""
echo "════════════════════════════════════════════"
echo "  ✓ BACKEND IS UP"
echo "════════════════════════════════════════════"
echo "  Health : $PUBLIC_BACKEND/health"
echo "  Admin  : $PUBLIC_BACKEND/app"
echo "  Email  : ${MEDUSA_ADMIN_EMAIL:-admin@onecurve.in}"
echo "  Pass   : (from your .env MEDUSA_ADMIN_PASSWORD)"
echo "  PubKey : $PK"
echo ""
echo "  Open port 9000 in DO firewall if phone can't load Admin."
echo "  Storefront later: set NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$PK"
echo "════════════════════════════════════════════"

# Persist key into .env for storefront later
if [ -n "$PK" ]; then
  if grep -q '^MEDUSA_PUBLISHABLE_KEY=' .env; then
    sed -i "s|^MEDUSA_PUBLISHABLE_KEY=.*|MEDUSA_PUBLISHABLE_KEY=$PK|" .env
  else
    echo "MEDUSA_PUBLISHABLE_KEY=$PK" >> .env
  fi
fi

curl -s http://127.0.0.1:9000/health || true
echo ""
