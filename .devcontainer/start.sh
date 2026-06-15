#!/usr/bin/env bash
# Runs on every Codespace start: ensure services are up, then launch the
# Medusa backend (:9000) and Next.js storefront (:8000) in the background.
set -e
cd "$(dirname "$0")/.."   # repo root

sudo service postgresql start 2>/dev/null || true
sudo service redis-server start 2>/dev/null || true

cd platform

# Backend first (storefront needs it for SSR + region).
if ! curl -s -o /dev/null --max-time 2 http://localhost:9000/health; then
  echo "▶ Starting Medusa backend on :9000 ..."
  (cd apps/backend && nohup npm run dev > /tmp/oc-backend.log 2>&1 &)
fi

# Wait for backend health (up to ~60s).
for i in $(seq 1 30); do
  curl -s -o /dev/null --max-time 2 http://localhost:9000/health && break
  sleep 2
done

if ! curl -s -o /dev/null --max-time 2 http://localhost:8000/in; then
  echo "▶ Starting Next.js storefront on :8000 ..."
  (cd apps/storefront && nohup npm run dev > /tmp/oc-storefront.log 2>&1 &)
fi

echo "✅ Servers starting. Make ports 8000 & 9000 PUBLIC in the Ports tab,"
echo "   then share the 8000 URL with your partner."
