#!/bin/bash
# OneCurve platform — local development, one command, self-healing.
#   cd platform && ./dev.sh
# Starts Postgres + Redis (brew), creates/migrates the database if needed,
# boots the backend (:9000), WAITS until it is healthy, then boots the
# storefront (:8000). Ctrl-C stops both. Logs: /tmp/oc-backend.log,
# /tmp/oc-storefront.log
set -e
cd "$(dirname "$0")"

export PATH="/usr/local/opt/node@22/bin:/opt/homebrew/opt/node@22/bin:$PATH"
PG_BIN="$(ls -d /usr/local/opt/postgresql@16/bin /opt/homebrew/opt/postgresql@16/bin 2>/dev/null | head -1)"

command -v node >/dev/null || { echo "✗ Node not found — run: brew install node@22"; exit 1; }
[ -d node_modules ] || { echo "▶ Installing dependencies (first run)…"; npm install --no-audit --no-fund; }

echo "▶ Ensuring Postgres + Redis are running…"
brew services start postgresql@16 >/dev/null 2>&1 || true
brew services start redis >/dev/null 2>&1 || true
for i in $(seq 1 10); do "$PG_BIN/pg_isready" -h localhost -q && break; sleep 1; done

# Self-repair: after an unclean shutdown (Mac restart/sleep) Postgres can be
# blocked by a stale postmaster.pid whose PID now belongs to some other
# process. Detect that safely and clear it.
if ! "$PG_BIN/pg_isready" -h localhost -q; then
  PGDATA="$(dirname "$PG_BIN")/../var/postgresql@16"
  [ -d "$PGDATA" ] || PGDATA="/usr/local/var/postgresql@16"
  PIDFILE="$PGDATA/postmaster.pid"
  if [ -f "$PIDFILE" ]; then
    OLDPID="$(head -1 "$PIDFILE")"
    if ! ps -p "$OLDPID" -o comm= 2>/dev/null | grep -qi postgres; then
      echo "  repairing: removing stale postmaster.pid (PID $OLDPID is not postgres)"
      rm -f "$PIDFILE"
      brew services restart postgresql@16 >/dev/null 2>&1 || true
      for i in $(seq 1 15); do "$PG_BIN/pg_isready" -h localhost -q && break; sleep 2; done
    fi
  fi
fi
"$PG_BIN/pg_isready" -h localhost -q || { echo "✗ Postgres is not starting — see /usr/local/var/log/postgresql@16.log"; exit 1; }

echo "▶ Ensuring database exists…"
if ! "$PG_BIN/psql" -lqt | cut -d'|' -f1 | grep -qw onecurve; then
  "$PG_BIN/createdb" onecurve
  echo "  created database 'onecurve'"
fi
# Migrate + seed if the schema isn't there yet (idempotent, skipped when present)
if ! "$PG_BIN/psql" -d onecurve -tAc "select 1 from information_schema.tables where table_name='product' limit 1" | grep -q 1; then
  echo "▶ First run: migrating + seeding catalog (takes ~1 min)…"
  (cd apps/backend && npx medusa db:migrate)
  PW_FILE=".admin-initial-password.txt"
  [ -f "$PW_FILE" ] || openssl rand -base64 12 | tr '+/' 'Aa' > "$PW_FILE"
  (cd apps/backend && npx medusa user -e admin@onecurve.in -p "$(cat $PW_FILE)") || true
  echo "  admin: admin@onecurve.in  password: $(cat $PW_FILE)"
fi

# Free the ports from any stale runs
lsof -ti:9000 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:8000 2>/dev/null | xargs kill -9 2>/dev/null || true

trap 'kill 0' EXIT INT TERM

echo "▶ Starting backend (:9000)…"
(cd apps/backend && npm run dev > /tmp/oc-backend.log 2>&1) &

echo "▶ Waiting for backend health…"
for i in $(seq 1 60); do
  curl -s -o /dev/null --max-time 2 http://localhost:9000/health && BACKEND_UP=1 && break
  sleep 2
done
[ -n "$BACKEND_UP" ] || { echo "✗ Backend did not become healthy — see /tmp/oc-backend.log"; exit 1; }
echo "  ✓ backend healthy"

# Always sync a REAL publishable key from the DB into storefront/.env.local
# (flip-env templates use pk_dev_placeholder which causes runtime errors).
echo "▶ Syncing publishable API key → storefront…"
if ./scripts/sync-publishable-key.sh; then
  echo "  ✓ publishable key synced"
else
  echo "  ⚠ could not sync key — storefront may show 'valid publishable key required'"
  echo "    Fix: ./scripts/sync-publishable-key.sh   or Admin → Settings → Publishable API Keys"
fi

echo "▶ Starting storefront (:8000)…"
(cd apps/storefront && npm run dev > /tmp/oc-storefront.log 2>&1) &

echo ""
echo "  ✅ Storefront : http://localhost:8000/in   (first load compiles ~30s)"
echo "  ✅ Admin      : http://localhost:9000/app"
echo "  Logs: tail -f /tmp/oc-backend.log /tmp/oc-storefront.log"
echo "  Stop: Ctrl-C"
echo "  Re-sync key anytime: ./scripts/sync-publishable-key.sh"
echo ""
wait
