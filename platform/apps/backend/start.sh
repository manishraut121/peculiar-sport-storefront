#!/bin/sh
# OneCurve backend boot (Dockerfile CMD).
# Server pinned to 0.0.0.0:9000.
set -e

export MEDUSA_DISABLE_TELEMETRY="${MEDUSA_DISABLE_TELEMETRY:-1}"
# 768MB heap is safer on 2GB boxes (Postgres+Redis share RAM)
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=768}"

echo "== OneCurve boot: env redis=${REDIS_URL:-MISSING} db=${DATABASE_URL:+set} skip_migrate=${SKIP_DB_MIGRATE:-0} =="

if [ "${SKIP_DB_MIGRATE}" = "1" ] || [ "${SKIP_DB_MIGRATE}" = "true" ]; then
  echo "== OneCurve boot: STEP 1/4 — SKIP migrations (SKIP_DB_MIGRATE=1) =="
else
  echo "== OneCurve boot: STEP 1/4 — database migrations =="
  echo "== $(date -u +%Y-%m-%dT%H:%MZ) migrate start =="
  # Capture full error (restart loops used to hide the real stack)
  if ! npx medusa db:migrate 2>&1 | tee /tmp/oc-migrate.log; then
    echo "== FATAL: migrations failed at $(date -u +%Y-%m-%dT%H:%MZ) =="
    echo "== ---- last 80 lines of /tmp/oc-migrate.log ---- =="
    tail -80 /tmp/oc-migrate.log || true
    echo "== ---- end migrate log ---- =="
    echo "== Fix: run one-shot migrate (no restart loop): =="
    echo "==   bash scripts/droplet-fix-migrate.sh =="
    # Don't tight-loop: long sleep so logs stay readable
    sleep 120
    exit 1
  fi
  echo "== $(date -u +%Y-%m-%dT%H:%MZ) migrations done =="
fi

echo "== OneCurve boot: STEP 2/4 — ensure admin user =="
if [ -n "$MEDUSA_ADMIN_EMAIL" ] && [ -n "$MEDUSA_ADMIN_PASSWORD" ]; then
  # Do not hide errors — silent failure left people unable to log in after seed restore
  if npx medusa user -e "$MEDUSA_ADMIN_EMAIL" -p "$MEDUSA_ADMIN_PASSWORD"; then
    echo "== admin user ready: $MEDUSA_ADMIN_EMAIL =="
  else
    echo "== admin user create returned non-zero (may already exist) =="
    echo "== if login fails, run: bash scripts/droplet-set-admin.sh =="
  fi
else
  echo "== skipped (set MEDUSA_ADMIN_EMAIL + MEDUSA_ADMIN_PASSWORD) =="
  echo "== or run: bash scripts/droplet-set-admin.sh your@email.com 'YourPassword' =="
fi

echo "== OneCurve boot: STEP 3/4 — boot check =="
node ./boot-check.js || echo "== boot check failed (non-fatal) =="

echo "== OneCurve boot: STEP 4/4 — starting server on 0.0.0.0:9000 =="
exec npx medusa start -H 0.0.0.0 -p 9000
