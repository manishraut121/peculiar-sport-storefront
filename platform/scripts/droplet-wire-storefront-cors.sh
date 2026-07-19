#!/usr/bin/env bash
# Allow storefront (local or hosted) to call this CMS API.
# Run on the droplet after CMS is up.
#
#   bash scripts/droplet-wire-storefront-cors.sh
#   bash scripts/droplet-wire-storefront-cors.sh http://localhost:8000
#   bash scripts/droplet-wire-storefront-cors.sh https://stage.onecurve.in
#
set -euo pipefail
cd "$(dirname "$0")/.."

SHOP_ORIGIN="${1:-http://localhost:8000}"
IP4=$(curl -4 -s --max-time 5 ifconfig.me 2>/dev/null || echo "159.89.173.5")
API_ORIGIN="http://${IP4}:9000"

upsert() {
  local key="$1" val="$2"
  if [ -f .env ] && grep -q "^${key}=" .env; then
    grep -v "^${key}=" .env > .env.tmp && mv .env.tmp .env
  fi
  printf '%s=%s\n' "$key" "$val" >> .env
}

# Keep existing admin origin if set
ADMIN_ORIGIN=$(grep '^ADMIN_CORS=' .env 2>/dev/null | cut -d= -f2- || true)
if [ -z "$ADMIN_ORIGIN" ]; then
  ADMIN_ORIGIN="$API_ORIGIN"
fi

upsert STORE_CORS "${SHOP_ORIGIN},${API_ORIGIN},http://localhost:8000"
upsert AUTH_CORS "${SHOP_ORIGIN},${ADMIN_ORIGIN},${API_ORIGIN},http://localhost:8000,http://localhost:9000"
# Don't clobber ADMIN_CORS if already set for IP or cms-stage
if ! grep -q '^ADMIN_CORS=' .env; then
  upsert ADMIN_CORS "$ADMIN_ORIGIN"
fi
upsert BACKEND_URL "$API_ORIGIN"
upsert COOKIE_SECURE "false"

echo "▶ STORE_CORS / AUTH_CORS updated for shop: $SHOP_ORIGIN"
docker compose --env-file .env up -d backend

echo "✓ Restarted. From your Mac, storefront .env.local should use:"
echo "  NEXT_PUBLIC_MEDUSA_BACKEND_URL=$API_ORIGIN"
echo "  MEDUSA_BACKEND_URL=$API_ORIGIN"
echo "  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<pk from bootstrap>"
