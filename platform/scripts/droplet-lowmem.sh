#!/usr/bin/env bash
# Prepare a 1GB DigitalOcean droplet for Medusa docker builds.
# Run as root on the droplet:
#   curl -fsSL ... | bash
#   OR: cd platform && bash scripts/droplet-lowmem.sh
set -euo pipefail

echo "▶ 4 GB swap (required for medusa build on 1GB RAM)…"
swapoff /swapfile 2>/dev/null || true
rm -f /swapfile
# fallocate can fail on some filesystems; dd is the fallback
if ! fallocate -l 4G /swapfile 2>/dev/null; then
  dd if=/dev/zero of=/swapfile bs=1M count=4096 status=progress
fi
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
free -h

echo "▶ Docker cleanup (free disk)…"
docker system prune -af 2>/dev/null || true
docker builder prune -af 2>/dev/null || true
df -h /

echo "▶ Kernel / docker tweaks for low memory…"
# Prefer reclaiming cache under pressure
sysctl -w vm.swappiness=60 >/dev/null || true

echo ""
echo "✓ Low-mem prep done. Now build backend only:"
echo "  cd /root/peculiar-sport-storefront/platform"
echo "  git pull origin main"
echo "  ./scripts/flip-env.sh stage   # if .env missing"
echo "  docker compose --env-file .env build backend 2>&1 | tee /tmp/backend-build.log"
echo "  docker compose --env-file .env up -d postgres redis backend"
echo "  docker compose logs -f backend"
