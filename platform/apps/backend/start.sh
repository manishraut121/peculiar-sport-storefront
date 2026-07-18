#!/bin/sh
# OneCurve backend boot (Dockerfile CMD).
# Self-diagnosing markers for cloud logs. Server pinned to 0.0.0.0:9000.
set -e

# Quiet + non-interactive (first migrate on small VPS can take 10–30+ min)
export MEDUSA_DISABLE_TELEMETRY="${MEDUSA_DISABLE_TELEMETRY:-1}"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1024}"

echo "== OneCurve boot: env redis=${REDIS_URL:-MISSING} db=${DATABASE_URL:+set} =="
echo "== OneCurve boot: NOTE first migrate is SLOW on 1–2GB — do not Ctrl-C; use tmux =="

echo "== OneCurve boot: STEP 1/4 — database migrations =="
echo "== $(date -u +%Y-%m-%dT%H:%MZ) migrate start =="
if ! npx medusa db:migrate; then
  echo "== FATAL: migrations failed at $(date -u +%Y-%m-%dT%H:%MZ) =="
  echo "== Tip: on a broken half-migrated DB, reset volume once: =="
  echo "==   docker compose down && docker volume rm platform_pgdata =="
  echo "==   then: docker compose --env-file .env up -d postgres redis backend =="
  sleep 30
  exit 1
fi
echo "== $(date -u +%Y-%m-%dT%H:%MZ) migrations done =="

echo "== OneCurve boot: STEP 2/4 — ensure admin user =="
if [ -n "$MEDUSA_ADMIN_EMAIL" ] && [ -n "$MEDUSA_ADMIN_PASSWORD" ]; then
  npx medusa user -e "$MEDUSA_ADMIN_EMAIL" -p "$MEDUSA_ADMIN_PASSWORD" 2>/dev/null \
    && echo "== admin user ready: $MEDUSA_ADMIN_EMAIL ==" \
    || echo "== admin user already exists (ok) =="
else
  echo "== skipped (set MEDUSA_ADMIN_EMAIL + MEDUSA_ADMIN_PASSWORD to auto-create) =="
fi

echo "== OneCurve boot: STEP 3/4 — boot check (products + publishable key) =="
node ./boot-check.js || echo "== boot check failed (non-fatal) =="

echo "== OneCurve boot: STEP 4/4 — starting server on 0.0.0.0:9000 =="
exec npx medusa start -H 0.0.0.0 -p 9000
