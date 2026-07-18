#!/usr/bin/env bash
# On the droplet: check whether backend migrate is alive (SSH can die; Docker keeps running).
#   bash scripts/droplet-watch-backend.sh
set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== containers ==="
docker compose ps 2>/dev/null || docker ps --format 'table {{.Names}}\t{{.Status}}'

echo ""
echo "=== memory ==="
free -h

echo ""
echo "=== backend CPU/mem (if running) ==="
docker stats --no-stream --format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}' 2>/dev/null | head -20

echo ""
echo "=== last 40 backend log lines ==="
docker compose logs backend --tail 40 2>/dev/null || true

echo ""
echo "=== migration rows in DB (rises while migrate works) ==="
docker compose exec -T postgres psql -U medusa -d medusa -c \
  "select count(*) as migration_rows from mikro_orm_migrations;" 2>/dev/null \
  || echo "(table may not exist yet or postgres not up)"

echo ""
echo "=== health (only works AFTER migrate + server start) ==="
curl -sS -m 3 http://127.0.0.1:9000/health || echo "not ready yet (normal during migrate)"

echo ""
echo "Tips:"
echo "  • SSH timeout ≠ container stopped. Reconnect and re-run this script."
echo "  • Use: tmux new -s oc   then  docker compose logs -f backend"
echo "  • If CPU ~0% for 20+ min and migration_rows stuck → paste logs, we debug."
