# Pre-migrated Medusa seed (for small VPS)

`medusa-seed.sql.gz` is a full Postgres dump of Medusa after successful
`db:migrate` + OneCurve catalog seed (22 products).

## Why

`npx medusa db:migrate` often fails or OOMs on 1–2 GB droplets. Restoring this
dump is the reliable path — **no migrate on the server**.

## Bootstrap

```bash
cd ~/peculiar-sport-storefront/platform
git pull origin main
bash scripts/droplet-bootstrap-from-seed.sh
```

## Regenerate (dev machine only)

```bash
createdb onecurve_seed
cd apps/backend
DATABASE_URL=postgres://localhost/onecurve_seed REDIS_URL= \
  BOOKKEEPING_MODULE=0 MEDUSA_DISABLE_TELEMETRY=1 \
  npx medusa db:migrate
pg_dump --no-owner --no-acl onecurve_seed | gzip -9 > ../../deploy/db/medusa-seed.sql.gz
```

Do not put production customer data in this file — seed/catalog only.
