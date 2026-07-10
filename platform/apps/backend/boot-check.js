// Boot-time sanity check: prints product count + the publishable API key so
// cloud deploy logs always surface both (the key is needed for the storefront
// env; it's publishable, i.e. safe to log). Plain pg, no Medusa boot needed.
const { Client } = require("pg");

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  try {
    const products = await c.query(
      "select count(*)::int as n from product where deleted_at is null"
    );
    const key = await c.query(
      "select token from api_key where type='publishable' and deleted_at is null order by created_at asc limit 1"
    );
    console.log(
      `== OC BOOT CHECK: products=${products.rows[0].n} publishable_key=${
        key.rows[0]?.token || "NONE"
      } ==`
    );
  } finally {
    await c.end();
  }
})().catch((e) => {
  console.log("== OC BOOT CHECK failed:", e.message, "==");
  process.exitCode = 1;
});
