#!/usr/bin/env bash
# Point Medusa stage env at a hostname (after DNS A record exists).
#
#   bash scripts/droplet-set-stage-domain.sh stage.onecurve.in
#   bash scripts/droplet-set-stage-domain.sh stage.onecurve.in --https   # after Caddy/TLS
#   bash scripts/droplet-set-stage-domain.sh stage.onecurve.in --port 9000
#
set -euo pipefail
cd "$(dirname "$0")/.."

HOST="${1:-stage.onecurve.in}"
shift || true
SCHEME="http"
PORT="9000"
USE_PORT=1

while [ $# -gt 0 ]; do
  case "$1" in
    --https) SCHEME="https"; PORT="443"; USE_PORT=0; shift ;;
    --port) PORT="$2"; USE_PORT=1; shift 2 ;;
    --no-port) USE_PORT=0; PORT="80"; shift ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

if [ "$SCHEME" = "https" ]; then
  ORIGIN="https://${HOST}"
  COOKIE_SECURE_VAL="true"
elif [ "$USE_PORT" = "1" ] && [ "$PORT" != "80" ]; then
  ORIGIN="http://${HOST}:${PORT}"
  COOKIE_SECURE_VAL="false"
else
  ORIGIN="http://${HOST}"
  COOKIE_SECURE_VAL="false"
fi

echo "▶ Target origin: $ORIGIN"

# DNS sanity (non-fatal)
IP4=$(curl -4 -s --max-time 5 ifconfig.me 2>/dev/null || true)
RESOLVED=$(getent ahostsv4 "$HOST" 2>/dev/null | awk '{print $1; exit}' || true)
if [ -z "$RESOLVED" ]; then
  RESOLVED=$(dig +short A "$HOST" 2>/dev/null | head -1 || true)
fi
echo "  droplet IPv4: ${IP4:-unknown}"
echo "  DNS A for $HOST: ${RESOLVED:-NOT FOUND YET}"
if [ -n "$IP4" ] && [ -n "$RESOLVED" ] && [ "$IP4" != "$RESOLVED" ]; then
  echo "⚠ DNS does not match this droplet IP yet. Fix DNS, wait 1–5 min, re-run."
fi

upsert() {
  local key="$1" val="$2"
  if [ -f .env ] && grep -q "^${key}=" .env; then
    grep -v "^${key}=" .env > .env.tmp
    mv .env.tmp .env
  fi
  printf '%s=%s\n' "$key" "$val" >> .env
}

[ -f .env ] || { echo "✗ No .env"; exit 1; }

upsert BACKEND_URL "$ORIGIN"
upsert MEDUSA_BACKEND_URL "$ORIGIN"
upsert MEDUSA_IMAGE_BASE_URL "$ORIGIN"
upsert ADMIN_CORS "$ORIGIN"
upsert AUTH_CORS "$ORIGIN,http://localhost:8000,http://localhost:9000"
upsert STORE_CORS "http://localhost:8000,$ORIGIN"
upsert COOKIE_SECURE "$COOKIE_SECURE_VAL"
# Optional friendly storefront later
if ! grep -q '^STOREFRONT_URL=' .env; then
  upsert STOREFRONT_URL "http://${HOST}:8000"
fi

echo "▶ Rebuild/restart backend with new public URL…"
docker compose --env-file .env up -d --build backend

echo "▶ Health…"
for i in $(seq 1 30); do
  curl -sf --max-time 3 http://127.0.0.1:9000/health >/dev/null && break
  sleep 2
done
curl -s http://127.0.0.1:9000/health || true
echo ""

echo "════════════════════════════════════════════"
echo "  Admin URL:  ${ORIGIN}/app"
echo "  Health:     ${ORIGIN}/health"
echo "  COOKIE_SECURE=$COOKIE_SECURE_VAL"
echo ""
echo "  DNS checklist (at your domain registrar / Cloudflare):"
echo "    Type A | Name: stage | Value: ${IP4:-YOUR_DROPLET_IPV4} | Proxy: DNS only (grey cloud) for :9000"
echo ""
echo "  Then open a private window → ${ORIGIN}/app"
echo "════════════════════════════════════════════"
