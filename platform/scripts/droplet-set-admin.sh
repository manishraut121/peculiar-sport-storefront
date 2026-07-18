#!/usr/bin/env bash
# Create OR reset Medusa admin password (handles "user already exists").
#
#   bash scripts/droplet-set-admin.sh
#   bash scripts/droplet-set-admin.sh admin@onecurve.in 'OneCurve2026!'
#
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

EMAIL="${1:-${MEDUSA_ADMIN_EMAIL:-admin@onecurve.in}}"
PASS="${2:-${MEDUSA_ADMIN_PASSWORD:-}}"

if [ -z "$PASS" ]; then
  PASS=$(openssl rand -base64 12 | tr -d '/+=' | head -c 16)
fi

echo "▶ Health check…"
if ! curl -sf --max-time 5 http://127.0.0.1:9000/health >/dev/null; then
  echo "  starting backend…"
  docker compose --env-file .env up -d backend
  sleep 8
fi
curl -sf --max-time 5 http://127.0.0.1:9000/health >/dev/null || {
  echo "✗ Backend not healthy: docker compose logs backend --tail 40"
  exit 1
}

echo "▶ Removing existing auth for: $EMAIL (so we can set a known password)…"
# Medusa stores password in provider_identity.provider_metadata for emailpass.
# Delete user + auth rows, then recreate with medusa user.
docker compose --env-file .env exec -T postgres psql -U medusa -d medusa -v ON_ERROR_STOP=1 <<SQL
-- auth first (provider_identity → auth_identity)
DELETE FROM provider_identity
 WHERE entity_id = '${EMAIL}' OR entity_id = lower('${EMAIL}');

DELETE FROM auth_identity ai
 WHERE ai.app_metadata->>'user_id' IN (
   SELECT id FROM "user" WHERE email = '${EMAIL}' OR email = lower('${EMAIL}')
 )
 OR ai.id IN (
   SELECT auth_identity_id FROM provider_identity WHERE false
 );

DELETE FROM "user"
 WHERE email = '${EMAIL}' OR email = lower('${EMAIL}');
SQL

echo "▶ Creating admin with new password…"
docker compose --env-file .env exec -T backend \
  npx medusa user -e "$EMAIL" -p "$PASS"

# Persist credentials
grep -v '^MEDUSA_ADMIN_EMAIL=' .env 2>/dev/null | grep -v '^MEDUSA_ADMIN_PASSWORD=' > .env.tmp || true
{
  cat .env.tmp 2>/dev/null || true
  echo "MEDUSA_ADMIN_EMAIL=$EMAIL"
  # quote-free single line; avoid shell metachar issues in simple passwords
  printf 'MEDUSA_ADMIN_PASSWORD=%s\n' "$PASS"
} > .env.new
mv .env.new .env
rm -f .env.tmp

# Fix CORS for public IP (login "succeeds" but stays on screen without this)
if [ -x scripts/droplet-fix-admin-cors.sh ]; then
  bash scripts/droplet-fix-admin-cors.sh || true
fi

IP4=$(curl -4 -s --max-time 5 ifconfig.me 2>/dev/null || true)
if [ -z "$IP4" ]; then
  IP4=$(curl -4 -s --max-time 5 icanhazip.com 2>/dev/null || echo "YOUR_DROPLET_IPV4")
fi

echo ""
echo "════════════════════════════════════════"
echo "  ✓ LOGIN WITH THESE (copy carefully)"
echo "════════════════════════════════════════"
echo "  URL:      http://${IP4}:9000/app"
echo "  Email:    $EMAIL"
echo "  Password: $PASS"
echo "════════════════════════════════════════"
echo "  MUST use that exact URL (IPv4 + http, not https)."
echo "  Use a private/incognito window after CORS fix."
echo "  If still stuck: bash scripts/droplet-fix-admin-cors.sh"
