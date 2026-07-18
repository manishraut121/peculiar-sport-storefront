#!/usr/bin/env bash
# Deep check when migration_rows stays 0.
#   cd ~/peculiar-sport-storefront/platform && bash scripts/droplet-diagnose-migrate.sh
set -euo pipefail
cd "$(dirname "$0")/.."

echo "======== 1) compose ps ========"
docker compose ps -a

echo ""
echo "======== 2) stats (CPU matters) ========"
docker stats --no-stream

echo ""
echo "======== 3) backend last 80 logs ========"
docker compose logs backend --tail 80

echo ""
echo "======== 4) is migrate process alive in container? ========"
docker compose exec -T backend sh -c 'ps aux | head -30' 2>/dev/null || echo "(exec failed — container restarting?)"

echo ""
echo "======== 5) postgres activity ========"
docker compose exec -T postgres psql -U medusa -d medusa -c \
  "select count(*) as migration_rows from mikro_orm_migrations;" 2>/dev/null || true
docker compose exec -T postgres psql -U medusa -d medusa -c \
  "select pid, state, wait_event_type, left(query,80) as query
   from pg_stat_activity
   where datname = 'medusa' and state <> 'idle'
   order by query_start;" 2>/dev/null || true

echo ""
echo "======== 6) disk + mem ========"
free -h
df -h / | tail -1

echo ""
echo "======== READ THIS ========"
echo "A) backend CPU > 5%  and/or postgres has active query → WAIT (still migrating)"
echo "B) backend Restarting / Exited, or CPU 0% for 10+ min with empty logs growth → RECOVER"
echo "C) OOM / Killed in logs → resize or more swap, then recover"
