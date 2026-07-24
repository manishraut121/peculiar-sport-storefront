#!/usr/bin/env bash
# Link Razorpay to India region. Prefers SQL (reliable on prod image).
# Fallback: medusa exec script.
#
#   bash scripts/droplet-link-razorpay-region.sh
#
set -euo pipefail
cd "$(dirname "$0")/.."

echo "▶ Prefer SQL link (no medusa exec)"
if bash scripts/droplet-link-razorpay-sql.sh; then
  echo "✓ Linked via SQL"
  exit 0
fi

echo "⚠ SQL path failed — trying medusa exec…"
SCRIPT_HOST="apps/backend/src/scripts/enable-razorpay-region.ts"
[[ -f "$SCRIPT_HOST" ]] || { echo "✗ Missing $SCRIPT_HOST — git pull origin main"; exit 1; }

docker compose --env-file .env exec -T backend mkdir -p /app/src/scripts
if ! docker compose --env-file .env cp "$SCRIPT_HOST" backend:/app/src/scripts/enable-razorpay-region.ts 2>/dev/null; then
  CID="$(docker compose --env-file .env ps -q backend)"
  docker cp "$SCRIPT_HOST" "${CID}:/app/src/scripts/enable-razorpay-region.ts"
fi

docker compose --env-file .env exec -T backend \
  npx medusa exec ./src/scripts/enable-razorpay-region.ts

echo "✓ Done. Checkout should list: UPI · Cards · Net banking"
