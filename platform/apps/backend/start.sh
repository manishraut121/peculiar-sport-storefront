#!/bin/sh
# OneCurve backend boot (used by the Dockerfile CMD).
# Self-diagnosing: each step prints a clear marker so cloud deploy logs show
# exactly how far boot got. The server is pinned to 0.0.0.0:9000 — point your
# host's public domain at port 9000. (Cloud platforms inject a random PORT
# env; medusa start would silently obey it, so we pin instead.)
set -e

echo "== OneCurve boot: STEP 1/4 — database migrations =="
npx medusa db:migrate
echo "== migrations done =="

echo "== OneCurve boot: STEP 2/4 — ensure admin user =="
if [ -n "$MEDUSA_ADMIN_EMAIL" ] && [ -n "$MEDUSA_ADMIN_PASSWORD" ]; then
  npx medusa user -e "$MEDUSA_ADMIN_EMAIL" -p "$MEDUSA_ADMIN_PASSWORD" 2>/dev/null \
    && echo "== admin user ready: $MEDUSA_ADMIN_EMAIL ==" \
    || echo "== admin user already exists (ok) =="
else
  echo "== skipped (set MEDUSA_ADMIN_EMAIL + MEDUSA_ADMIN_PASSWORD to auto-create) =="
fi

echo "== OneCurve boot: STEP 3/4 — boot check (products + publishable key) =="
node ./boot-check.js || echo "== boot check failed (non-fatal) =="

echo "== OneCurve boot: STEP 4/4 — starting server on 0.0.0.0:9000 =="
exec npx medusa start -H 0.0.0.0 -p 9000
