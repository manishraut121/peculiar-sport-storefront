#!/usr/bin/env bash
# Runs on every Codespace start: launch the Medusa backend (:9000) then the
# Next.js storefront (:8000) in the background. Postgres/Redis are separate
# always-on containers (docker-compose), so nothing to start here for them.
set -e
cd "$(dirname "$0")/../platform"

# If deps somehow aren't installed yet, bail quietly — setup.sh handles install.
if [ ! -d node_modules ]; then
  echo "Dependencies not installed yet; skipping auto-start (run setup first)."
  exit 0
fi

# Backend first (storefront SSR needs it).
if ! curl -s -o /dev/null --max-time 2 http://localhost:9000/health; then
  echo "▶ Starting Medusa backend on :9000 ..."
  (cd apps/backend && nohup npm run dev > /tmp/oc-backend.log 2>&1 &)
fi

echo "▶ Waiting for backend health ..."
for i in $(seq 1 40); do
  curl -s -o /dev/null --max-time 2 http://localhost:9000/health && break
  sleep 2
done

if ! curl -s -o /dev/null --max-time 2 http://localhost:8000; then
  echo "▶ Starting Next.js storefront on :8000 ..."
  (cd apps/storefront && nohup npm run dev > /tmp/oc-storefront.log 2>&1 &)
fi

echo "✅ Servers starting. The shop compiles on first open (~1–2 min)."
echo "   Logs: /tmp/oc-backend.log  and  /tmp/oc-storefront.log"
echo "   Make ports 8000 & 9000 PUBLIC in the Ports tab, then share the 8000 URL."
