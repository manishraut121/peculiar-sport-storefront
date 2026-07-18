#!/usr/bin/env bash
# Create or reset Medusa admin password on the droplet.
#   bash scripts/droplet-set-admin.sh
#   bash scripts/droplet-set-admin.sh you@email.com 'NewPassword123!'
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

EMAIL="${1:-${MEDUSA_ADMIN_EMAIL:-admin@onecurve.in}}"
PASS="${2:-}"

if [ -z "$PASS" ]; then
  # generate if not provided and not in env
  if [ -n "${MEDUSA_ADMIN_PASSWORD:-}" ]; then
    PASS="$MEDUSA_ADMIN_PASSWORD"
  else
    PASS=$(openssl rand -base64 12 | tr -d '/+=' | head -c 16)
  fi
fi

echo "▶ Backend status…"
docker compose --env-file .env ps backend

if ! curl -sf --max-time 3 http://127.0.0.1:9000/health >/dev/null; then
  echo "✗ Backend not healthy. Start it first:"
  echo "  docker compose --env-file .env up -d backend"
  exit 1
fi

echo "▶ Creating/updating admin user…"
echo "  email: $EMAIL"

# Show full error (do not swallow stderr)
set +e
docker compose --env-file .env exec -T backend \
  npx medusa user -e "$EMAIL" -p "$PASS"
RC=$?
set -e

if [ $RC -ne 0 ]; then
  echo ""
  echo "medusa user failed (exit $RC). Common causes:"
  echo "  • user already exists with different auth — try a NEW email, e.g.:"
  echo "    bash scripts/droplet-set-admin.sh owner@onecurve.in 'YourPass123'"
  echo "  • container missing deps — rebuild: docker compose up -d --build backend"
  exit $RC
fi

# Persist into .env so bootstrap remembers
if grep -q '^MEDUSA_ADMIN_EMAIL=' .env 2>/dev/null; then
  sed -i "s|^MEDUSA_ADMIN_EMAIL=.*|MEDUSA_ADMIN_EMAIL=$EMAIL|" .env
else
  echo "MEDUSA_ADMIN_EMAIL=$EMAIL" >> .env
fi
# password may contain special chars — write carefully
if grep -q '^MEDUSA_ADMIN_PASSWORD=' .env 2>/dev/null; then
  # use a temp approach for special chars
  grep -v '^MEDUSA_ADMIN_PASSWORD=' .env > .env.tmp
  printf 'MEDUSA_ADMIN_PASSWORD=%s\n' "$PASS" >> .env.tmp
  mv .env.tmp .env
else
  printf 'MEDUSA_ADMIN_PASSWORD=%s\n' "$PASS" >> .env
fi

echo ""
echo "════════════════════════════════════════"
echo "  ✓ Admin ready — use these exactly:"
echo "  URL:   http://159.89.173.5:9000/app"
echo "         (use IPv4 from DO dashboard if different)"
echo "  Email: $EMAIL"
echo "  Pass:  $PASS"
echo "════════════════════════════════════════"
echo "  (also saved into platform/.env)"
