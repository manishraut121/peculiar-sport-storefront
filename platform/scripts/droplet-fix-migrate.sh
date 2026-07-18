#!/usr/bin/env bash
# Fix failed Medusa migrations on a small DigitalOcean droplet WITHOUT upgrading.
#
# Why migrate fails here (usually):
#   - restart loop hides the real error
#   - half-migrated Postgres volume
#   - RAM pressure (Postgres + Redis + Node migrate together)
#
# This script:
#   1) stops the crash-looping backend
#   2) resets the DB volume (dev/stage only — no real orders)
#   3) runs migrate ONCE (full log on screen)
#   4) starts backend with SKIP_DB_MIGRATE=1 so it just serves
#
#   cd ~/peculiar-sport-storefront/platform && bash scripts/droplet-fix-migrate.sh
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "✗ No .env — run ./scripts/flip-env.sh stage first"
  exit 1
fi

echo "▶ Pull latest…"
git pull origin main || true

echo "▶ Stop backend restart loop…"
docker compose --env-file .env stop backend 2>/dev/null || true
docker compose --env-file .env rm -f backend 2>/dev/null || true

echo "▶ Ensure Postgres + Redis are up…"
docker compose --env-file .env up -d postgres redis
sleep 5
docker compose --env-file .env exec -T postgres pg_isready -U medusa

echo "▶ Reset empty/half-migrated DB volume (STAGE ONLY)…"
docker compose --env-file .env stop postgres 2>/dev/null || true
# volume name is usually platform_pgdata or <dir>_pgdata
VOL=$(docker volume ls -q | grep -E 'pgdata$' | head -1 || true)
if [ -n "${VOL:-}" ]; then
  docker compose --env-file .env rm -f postgres 2>/dev/null || true
  docker volume rm "$VOL" || true
  echo "  removed volume: $VOL"
else
  echo "  (no pgdata volume found — ok if first run)"
fi

docker compose --env-file .env up -d postgres redis
echo "▶ Waiting for Postgres…"
for i in $(seq 1 30); do
  docker compose --env-file .env exec -T postgres pg_isready -U medusa && break
  sleep 2
done

# Swap helps a lot on 2GB
if [ -x scripts/droplet-lowmem.sh ]; then
  bash scripts/droplet-lowmem.sh || true
fi

echo ""
echo "▶ ONE-SHOT migrate (this prints the REAL error if it fails)…"
echo "   Use tmux if SSH drops: tmux new -s migrate"
echo ""

# Run migrate in a one-off container (same image/env as backend)
set +e
docker compose --env-file .env run --rm --no-deps \
  -e MEDUSA_DISABLE_TELEMETRY=1 \
  -e NODE_OPTIONS=--max-old-space-size=768 \
  -e BOOKKEEPING_MODULE=0 \
  backend \
  sh -c 'npx medusa db:migrate' 2>&1 | tee /tmp/oc-migrate-oneshot.log
MIGRATE_RC=${PIPESTATUS[0]}
set -e

if [ "$MIGRATE_RC" -ne 0 ]; then
  echo ""
  echo "✗ Migrate failed (exit $MIGRATE_RC). Full log: /tmp/oc-migrate-oneshot.log"
  echo "Last 60 lines:"
  tail -60 /tmp/oc-migrate-oneshot.log
  echo ""
  echo "Paste that tail to your dev partner. DO is fine — we need the error text."
  exit "$MIGRATE_RC"
fi

echo ""
echo "✓ Migrations OK. Starting API with SKIP_DB_MIGRATE=1 …"
# Export for compose interpolation if we add it; also pass via environment in override
export SKIP_DB_MIGRATE=1
# docker compose doesn't pass shell export unless in .env — append temporarily
if ! grep -q '^SKIP_DB_MIGRATE=' .env 2>/dev/null; then
  echo 'SKIP_DB_MIGRATE=1' >> .env
else
  sed -i 's/^SKIP_DB_MIGRATE=.*/SKIP_DB_MIGRATE=1/' .env
fi

docker compose --env-file .env up -d --build backend

echo ""
echo "▶ Waiting for health (up to ~3 min)…"
for i in $(seq 1 36); do
  if curl -sf http://127.0.0.1:9000/health >/dev/null 2>&1; then
    echo "✓ HEALTH OK"
    curl -s http://127.0.0.1:9000/health || true
    echo ""
    echo "Admin: http://$(curl -s ifconfig.me 2>/dev/null || echo YOUR_IP):9000/app"
    echo "Logs:  docker compose logs -f backend"
    exit 0
  fi
  sleep 5
done

echo "⚠ Not healthy yet — check: docker compose logs backend --tail 80"
docker compose logs backend --tail 40
exit 1
