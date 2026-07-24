#!/usr/bin/env bash
# Link Razorpay to India region via Postgres (no medusa exec).
# Run on droplet from platform/:
#   bash scripts/droplet-link-razorpay-sql.sh
#
set -euo pipefail
cd "$(dirname "$0")/.."

echo "▶ payment_provider rows (before)"
docker compose --env-file .env exec -T postgres \
  psql -U medusa -d medusa -c \
  "SELECT id, is_enabled FROM payment_provider ORDER BY id;"

echo "▶ Ensure pp_razorpay_razorpay is registered + enabled"
docker compose --env-file .env exec -T postgres \
  psql -U medusa -d medusa -v ON_ERROR_STOP=1 <<'SQL'
INSERT INTO payment_provider (id, is_enabled, created_at, updated_at, deleted_at)
VALUES ('pp_razorpay_razorpay', true, NOW(), NOW(), NULL)
ON CONFLICT (id) DO UPDATE
  SET is_enabled = true,
      deleted_at = NULL,
      updated_at = NOW();
SQL

echo "▶ Link India region → Razorpay (+ keep manual)"
docker compose --env-file .env exec -T postgres \
  psql -U medusa -d medusa -v ON_ERROR_STOP=1 <<'SQL'
-- Link table columns vary slightly by Medusa version; try common shape.
DO $$
DECLARE
  rid text;
  has_deleted boolean;
BEGIN
  SELECT id INTO rid FROM region WHERE currency_code = 'inr' LIMIT 1;
  IF rid IS NULL THEN
    SELECT id INTO rid FROM region LIMIT 1;
  END IF;
  IF rid IS NULL THEN
    RAISE EXCEPTION 'No region found';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'region_payment_provider' AND column_name = 'deleted_at'
  ) INTO has_deleted;

  -- Manual (if missing)
  IF NOT EXISTS (
    SELECT 1 FROM region_payment_provider
    WHERE region_id = rid AND payment_provider_id = 'pp_system_default'
      AND (NOT has_deleted OR deleted_at IS NULL)
  ) THEN
    IF has_deleted THEN
      INSERT INTO region_payment_provider (id, region_id, payment_provider_id, created_at, updated_at, deleted_at)
      VALUES ('regpp_manual_' || substr(md5(rid), 1, 16), rid, 'pp_system_default', NOW(), NOW(), NULL);
    ELSE
      INSERT INTO region_payment_provider (id, region_id, payment_provider_id, created_at, updated_at)
      VALUES ('regpp_manual_' || substr(md5(rid), 1, 16), rid, 'pp_system_default', NOW(), NOW());
    END IF;
  END IF;

  -- Razorpay
  IF NOT EXISTS (
    SELECT 1 FROM region_payment_provider
    WHERE region_id = rid AND payment_provider_id = 'pp_razorpay_razorpay'
      AND (NOT has_deleted OR deleted_at IS NULL)
  ) THEN
    IF has_deleted THEN
      INSERT INTO region_payment_provider (id, region_id, payment_provider_id, created_at, updated_at, deleted_at)
      VALUES ('regpp_rzp_' || substr(md5(rid || 'rzp'), 1, 16), rid, 'pp_razorpay_razorpay', NOW(), NOW(), NULL);
    ELSE
      INSERT INTO region_payment_provider (id, region_id, payment_provider_id, created_at, updated_at)
      VALUES ('regpp_rzp_' || substr(md5(rid || 'rzp'), 1, 16), rid, 'pp_razorpay_razorpay', NOW(), NOW());
    END IF;
    RAISE NOTICE 'Linked Razorpay to region %', rid;
  ELSE
    -- undelete if soft-deleted
    IF has_deleted THEN
      UPDATE region_payment_provider
      SET deleted_at = NULL, updated_at = NOW()
      WHERE region_id = rid AND payment_provider_id = 'pp_razorpay_razorpay';
    END IF;
    RAISE NOTICE 'Razorpay already linked to region %', rid;
  END IF;
END $$;
SQL

echo "▶ Links after"
docker compose --env-file .env exec -T postgres \
  psql -U medusa -d medusa -c \
  "SELECT region_id, payment_provider_id FROM region_payment_provider ORDER BY payment_provider_id;"

echo ""
echo "✓ Done. Store API should list pp_razorpay_razorpay for India."
echo "  Restart storefront (or hard-refresh checkout) and choose UPI · Cards."
echo ""
echo "  Verify:"
echo "  curl -s -H 'x-publishable-api-key: YOUR_PK' \\"
echo "    'http://127.0.0.1:9000/store/payment-providers?region_id=reg_…'"
