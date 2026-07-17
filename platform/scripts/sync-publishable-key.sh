#!/usr/bin/env bash
# Pull the Medusa publishable API key from Postgres and write it into
# storefront/.env.local (+ platform/.env if present).
#
#   ./scripts/sync-publishable-key.sh
#   DATABASE_URL=postgres://… ./scripts/sync-publishable-key.sh
#
# Fixes: "A valid publishable key is required to proceed with the request"
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="/usr/local/opt/node@22/bin:/opt/homebrew/opt/node@22/bin:/usr/local/opt/postgresql@16/bin:/opt/homebrew/opt/postgresql@16/bin:$PATH"

# Resolve DATABASE_URL
if [[ -z "${DATABASE_URL:-}" ]]; then
  if [[ -f apps/backend/.env ]]; then
    # shellcheck disable=SC1091
    set -a; source apps/backend/.env; set +a
  fi
fi
DATABASE_URL="${DATABASE_URL:-postgres://localhost/onecurve}"

fetch_key() {
  # Prefer node+pg (works even when psql client is odd)
  if [[ -d apps/backend/node_modules/pg ]] || [[ -d node_modules/pg ]]; then
    node -e '
const { Client } = require("pg");
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  try {
    const r = await c.query(
      "select token from api_key where type='\''publishable'\'' and deleted_at is null order by created_at asc limit 1"
    );
    if (!r.rows[0]?.token) process.exit(2);
    process.stdout.write(r.rows[0].token);
  } finally { await c.end(); }
})().catch((e) => { console.error(e.message); process.exit(1); });
' && return 0
  fi
  if command -v psql >/dev/null 2>&1; then
    # Derive db name from URL roughly, or use onecurve
    local db="onecurve"
    if [[ "$DATABASE_URL" == *"/"* ]]; then
      db="${DATABASE_URL##*/}"
      db="${db%%\?*}"
    fi
    psql -d "$db" -tAc "select token from api_key where type='publishable' and deleted_at is null order by created_at asc limit 1;" | tr -d '[:space:]'
    return 0
  fi
  return 1
}

export DATABASE_URL
KEY="$(fetch_key || true)"
if [[ -z "$KEY" || "$KEY" == "NONE" ]]; then
  echo "✗ No publishable key in DB."
  echo "  Is the backend seeded? Try:"
  echo "    cd apps/backend && npx medusa db:migrate"
  echo "    # then open admin → Settings → Publishable API Keys"
  exit 1
fi

if [[ "$KEY" != pk_* ]]; then
  echo "✗ Unexpected key format: ${KEY:0:20}…"
  exit 1
fi

echo "✓ Found publishable key: ${KEY:0:12}…"

upsert_env() {
  local file="$1"
  local var="$2"
  local val="$3"
  mkdir -p "$(dirname "$file")"
  touch "$file"
  local tmp
  tmp="$(mktemp)"
  # Drop ALL existing lines for this var (avoids duplicates from flip-env), then append once
  grep -v "^${var}=" "$file" > "$tmp" || true
  echo "${var}=${val}" >> "$tmp"
  mv "$tmp" "$file"
}

# Storefront (Next reads this) — rewrite critical keys cleanly
SF="$ROOT/apps/storefront/.env.local"
# Strip placeholders and duplicate publishable lines first
if [[ -f "$SF" ]]; then
  tmp="$(mktemp)"
  grep -v -E '^(NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY|MEDUSA_PUBLISHABLE_KEY)=' "$SF" \
    | grep -v 'pk_dev_placeholder' > "$tmp" || true
  mv "$tmp" "$SF"
fi
upsert_env "$SF" "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY" "$KEY"
upsert_env "$SF" "NEXT_PUBLIC_MEDUSA_BACKEND_URL" "${NEXT_PUBLIC_MEDUSA_BACKEND_URL:-http://localhost:9000}"
upsert_env "$SF" "MEDUSA_BACKEND_URL" "${MEDUSA_BACKEND_URL:-http://localhost:9000}"
upsert_env "$SF" "NEXT_PUBLIC_BASE_URL" "${NEXT_PUBLIC_BASE_URL:-http://localhost:8000}"
upsert_env "$SF" "NEXT_PUBLIC_DEFAULT_REGION" "${NEXT_PUBLIC_DEFAULT_REGION:-in}"
# Remove obsolete non-NEXT publishable var that confuses debugging
if [[ -f "$SF" ]]; then
  tmp="$(mktemp)"
  grep -v '^MEDUSA_PUBLISHABLE_KEY=' "$SF" > "$tmp" || true
  mv "$tmp" "$SF"
fi
echo "  wrote $SF"

# platform/.env for docker-compose
if [[ -f "$ROOT/.env" ]]; then
  upsert_env "$ROOT/.env" "MEDUSA_PUBLISHABLE_KEY" "$KEY"
  upsert_env "$ROOT/.env" "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY" "$KEY"
  echo "  updated platform/.env"
fi

# config/env/dev.env if present (keeps flip-env honest)
if [[ -f "$ROOT/config/env/dev.env" ]]; then
  upsert_env "$ROOT/config/env/dev.env" "MEDUSA_PUBLISHABLE_KEY" "$KEY"
  upsert_env "$ROOT/config/env/dev.env" "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY" "$KEY"
fi

echo ""
echo "Restart the storefront so Next.js reloads env:"
echo "  (if using ./dev.sh — Ctrl-C and re-run, or kill :8000 and start again)"
echo "  curl -s -H \"x-publishable-api-key: \$KEY\" http://localhost:9000/store/products | head"
echo ""
echo "DONE. Verify: open http://localhost:8000/in — products should load without publishable-key error."
