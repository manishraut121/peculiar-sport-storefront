#!/usr/bin/env bash
# Fix Medusa Admin "login does nothing / stays on login screen".
# Cause: ADMIN_CORS / AUTH_CORS don't include the exact browser Origin
# (e.g. http://159.89.173.5:9000) — cookies/session never stick.
#
#   cd ~/peculiar-sport-storefront/platform
#   bash scripts/droplet-fix-admin-cors.sh
#
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "✗ No .env"
  exit 1
fi

IP4=$(curl -4 -s --max-time 8 ifconfig.me 2>/dev/null || true)
if [ -z "$IP4" ]; then
  IP4=$(curl -4 -s --max-time 8 icanhazip.com 2>/dev/null || true)
fi
if [ -z "$IP4" ]; then
  # last resort: DO metadata
  IP4=$(curl -s --max-time 3 http://169.254.169.254/metadata/v1/interfaces/public/0/ipv4/address 2>/dev/null || true)
fi
if [ -z "$IP4" ]; then
  echo "Could not detect IPv4. Pass it: bash scripts/droplet-fix-admin-cors.sh 159.89.173.5"
  IP4="${1:-}"
fi
if [ -z "$IP4" ]; then
  exit 1
fi

ORIGIN="http://${IP4}:9000"

echo "▶ Browser must open exactly: $ORIGIN/app"
echo "▶ Setting CORS / URL env for that origin…"

# Upsert keys in .env
upsert() {
  local key="$1" val="$2"
  if grep -q "^${key}=" .env 2>/dev/null; then
    grep -v "^${key}=" .env > .env.tmp
    mv .env.tmp .env
  fi
  printf '%s=%s\n' "$key" "$val" >> .env
}

upsert BACKEND_URL "$ORIGIN"
upsert ADMIN_CORS "$ORIGIN"
# AUTH must include admin origin (login cookie)
upsert AUTH_CORS "$ORIGIN,http://localhost:8000,http://localhost:9000"
# store can stay loose for later storefront
if ! grep -q '^STORE_CORS=' .env; then
  upsert STORE_CORS "http://localhost:8000,$ORIGIN"
fi
upsert MEDUSA_BACKEND_URL "$ORIGIN"
upsert MEDUSA_IMAGE_BASE_URL "$ORIGIN"

echo "▶ Restart backend to load new CORS…"
docker compose --env-file .env up -d backend

echo "▶ Wait for health…"
for i in $(seq 1 24); do
  curl -sf --max-time 3 http://127.0.0.1:9000/health >/dev/null && break
  sleep 2
done
curl -s http://127.0.0.1:9000/health || true
echo ""

echo "▶ Current CORS-related env inside container:"
docker compose --env-file .env exec -T backend sh -c \
  'echo ADMIN_CORS=$ADMIN_CORS; echo AUTH_CORS=$AUTH_CORS; echo BACKEND_URL=$BACKEND_URL' 2>/dev/null || true

echo ""
echo "════════════════════════════════════════════"
echo "  1) Open a PRIVATE/incognito window"
echo "  2) Go to:  ${ORIGIN}/app"
echo "     (must match exactly — not https, not IPv6)"
echo "  3) Login with admin email + password you set"
echo "  4) If still stuck: DevTools → Network → login/auth"
echo "     look for red CORS or Set-Cookie blocked"
echo "════════════════════════════════════════════"
