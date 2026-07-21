#!/usr/bin/env bash
# One-shot: copy enable-razorpay-region.ts into the running backend container and exec it.
# Use after Razorpay keys are already in .env and backend shows razorpay=on.
#
#   bash scripts/droplet-link-razorpay-region.sh
#
set -euo pipefail
cd "$(dirname "$0")/.."

SCRIPT_HOST="apps/backend/src/scripts/enable-razorpay-region.ts"
[[ -f "$SCRIPT_HOST" ]] || { echo "✗ Missing $SCRIPT_HOST — git pull origin main"; exit 1; }

echo "▶ Ensure /app/src/scripts in backend container"
docker compose --env-file .env exec -T backend mkdir -p /app/src/scripts

echo "▶ Copy script into container"
if ! docker compose --env-file .env cp "$SCRIPT_HOST" backend:/app/src/scripts/enable-razorpay-region.ts 2>/dev/null; then
  CID="$(docker compose --env-file .env ps -q backend)"
  docker cp "$SCRIPT_HOST" "${CID}:/app/src/scripts/enable-razorpay-region.ts"
fi

echo "▶ medusa exec enable-razorpay-region"
docker compose --env-file .env exec -T backend \
  npx medusa exec ./src/scripts/enable-razorpay-region.ts

echo "✓ Done. In Admin → Settings → Regions → India you should see Razorpay enabled."
echo "  Checkout should list: UPI · Cards · Net banking"
