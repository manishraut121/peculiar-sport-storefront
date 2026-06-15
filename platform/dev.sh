#!/bin/bash
# OneCurve platform — local development, one command.
# Starts Postgres + Redis (brew services), then the Medusa backend (:9000)
# and the Next.js storefront (:8000) together via turborepo. Ctrl-C stops both.
set -e
cd "$(dirname "$0")"

export PATH="/usr/local/opt/node@22/bin:$PATH"

command -v node >/dev/null || { echo "Node not found — run: brew install node@22"; exit 1; }
[ -d node_modules ] || npm install --no-audit --no-fund

brew services start postgresql@16 >/dev/null 2>&1 || true
brew services start redis >/dev/null 2>&1 || true
/usr/local/opt/postgresql@16/bin/pg_isready -h localhost -q || { echo "Postgres is not ready"; exit 1; }

echo ""
echo "  Storefront : http://localhost:8000"
echo "  Admin      : http://localhost:9000/app"
echo ""

npm run dev
