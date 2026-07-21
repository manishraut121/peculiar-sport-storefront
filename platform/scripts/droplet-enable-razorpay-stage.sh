#!/usr/bin/env bash
# Wire Razorpay TEST keys on the stage droplet + link provider to India region.
#
# Usage (on droplet, from platform/):
#   export RAZORPAY_KEY_ID=rzp_test_xxx
#   export RAZORPAY_KEY_SECRET=xxx
#   bash scripts/droplet-enable-razorpay-stage.sh
#
# Optional:
#   RAZORPAY_WEBHOOK_SECRET=whsec_...
#   SHOP_ORIGIN=https://stage.onecurve.in   # or http://localhost:8000
#
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -z "${RAZORPAY_KEY_ID:-}" || -z "${RAZORPAY_KEY_SECRET:-}" ]]; then
  echo "✗ Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET (test keys for stage)"
  exit 1
fi

if [[ "$RAZORPAY_KEY_ID" == rzp_live_* ]]; then
  echo "✗ Refusing live keys on this stage script. Use flip-env prod for live."
  exit 1
fi

SHOP_ORIGIN="${SHOP_ORIGIN:-http://localhost:8000}"

upsert() {
  local key="$1" val="$2"
  if [[ -f .env ]] && grep -q "^${key}=" .env; then
    grep -v "^${key}=" .env > .env.tmp && mv .env.tmp .env
  fi
  printf '%s=%s\n' "$key" "$val" >> .env
}

echo "▶ Writing Razorpay test keys + stage flags into .env"
upsert RAZORPAY_KEY_ID "$RAZORPAY_KEY_ID"
upsert RAZORPAY_KEY_SECRET "$RAZORPAY_KEY_SECRET"
if [[ -n "${RAZORPAY_WEBHOOK_SECRET:-}" ]]; then
  upsert RAZORPAY_WEBHOOK_SECRET "$RAZORPAY_WEBHOOK_SECRET"
fi
upsert OC_ENV stage
upsert NEXT_PUBLIC_OC_ENV stage
# Ensure flags file points at stage
if [[ -f config/flags/stage.json ]]; then
  upsert OC_FLAGS_FILE config/flags/stage.json
fi

# CORS for shop
bash scripts/droplet-wire-storefront-cors.sh "$SHOP_ORIGIN"

echo "▶ Restart backend so Razorpay provider registers"
docker compose --env-file .env up -d --build backend

echo "▶ Wait for health…"
for i in $(seq 1 40); do
  if curl -sf http://127.0.0.1:9000/health >/dev/null 2>&1; then
    echo "  health OK"
    break
  fi
  sleep 3
done

echo "▶ Link pp_razorpay_razorpay to India region"
docker compose --env-file .env exec -T backend \
  npx medusa exec ./src/scripts/enable-razorpay-region.ts || \
  docker compose --env-file .env exec -T backend \
  yarn medusa exec ./src/scripts/enable-razorpay-region.ts || \
  echo "⚠ exec failed — run manually inside backend container"

echo ""
echo "✓ Stage Razorpay path prepared."
echo "  1. Storefront .env.local → NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://DROPLET:9000"
echo "  2. Optional: NEXT_PUBLIC_RAZORPAY_KEY_ID=$RAZORPAY_KEY_ID (fallback if session lacks keyId)"
echo "  3. Checkout → select UPI · Cards → test UPI/card from Razorpay docs"
echo "  4. Confirm order appears in Admin → Orders"
