import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows";
import * as fs from "fs";
import * as path from "path";

/* Idempotent product seed (v2).
 *
 * Why this exists: on cloud first-deploys the original initial-data-seed ran
 * before the catalog file was bundled into the image, so it seeded store
 * config only (channels/region/location) and was marked done. Migration
 * scripts run once per NAME, so this new script back-fills products on such
 * databases. On databases that already have products it no-ops.
 * Also logs the publishable key so deploy logs always surface it.
 */

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const IMAGE_BASE_URL =
  process.env.MEDUSA_IMAGE_BASE_URL ||
  process.env.MEDUSA_BACKEND_URL ||
  "http://localhost:9000";

function loadCatalog(logger: { warn: (m: string) => void }): any[] {
  const candidates = [
    process.env.ONECURVE_CATALOG_PATH,
    path.resolve(process.cwd(), "../../../data/products.json"),
    path.resolve(process.cwd(), "data/products.json"),
  ].filter(Boolean) as string[];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        return JSON.parse(fs.readFileSync(p, "utf8")).products;
      }
    } catch (e) {
      logger.warn(`seed-products-v2: could not read ${p}: ${e}`);
    }
  }
  return [];
}

export default async function seed_products_v2({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const logKey = async () => {
    const { data: keys } = await query.graph({
      entity: "api_key",
      fields: ["token", "type"],
    });
    const pk = keys.find((k: any) => k.type === "publishable");
    logger.info(
      `seed-products-v2: publishable key = ${pk?.token || "NONE FOUND"}`
    );
  };

  const { data: existing } = await query.graph({
    entity: "product",
    fields: ["id"],
    pagination: { take: 1, skip: 0 },
  });
  if (existing.length > 0) {
    logger.info("seed-products-v2: products already present — skipping.");
    await logKey();
    return;
  }

  const legacy = loadCatalog(logger);
  if (!legacy.length) {
    logger.warn(
      "seed-products-v2: no catalog file found — cannot seed products."
    );
    await logKey();
    return;
  }

  // Existing store config from the initial seed.
  const { data: channels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  });
  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  });
  const { data: profiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile: any = profiles[0];
  const channelIds = channels.map((c: any) => ({ id: c.id }));
  const stockLocation: any = locations[0];
  if (!shippingProfile || !channelIds.length || !stockLocation) {
    logger.warn(
      "seed-products-v2: store config missing (channels/location/profile) — run the initial seed first."
    );
    return;
  }

  // Categories: reuse if present, create the missing ones.
  const CATEGORY_NAMES: Record<string, string> = {
    bats: "Bats",
    pads: "Pads",
    gloves: "Gloves",
  };
  const { data: existingCats } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
  });
  const catByName = new Map(existingCats.map((c: any) => [c.name, c.id]));
  const missing = Object.values(CATEGORY_NAMES).filter(
    (n) => !catByName.has(n)
  );
  if (missing.length) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: missing.map((name) => ({ name, is_active: true })),
      },
    });
    for (const c of result) catByName.set(c.name, c.id);
  }
  const categoryId = (cat: string) => catByName.get(CATEGORY_NAMES[cat]);

  logger.info(`seed-products-v2: creating ${legacy.length} products...`);
  await createProductsWorkflow(container).run({
    input: {
      products: legacy.map((p: any) => {
        const handle = p.slug || slugify(p.name);
        const imageUrl = p.image
          ? `${IMAGE_BASE_URL}/static/products/${p.image}.jpg`
          : undefined;
        return {
          title: p.name,
          handle,
          description: p.desc,
          status:
            p.active === false ? ProductStatus.DRAFT : ProductStatus.PUBLISHED,
          category_ids: categoryId(p.cat) ? [categoryId(p.cat)!] : [],
          shipping_profile_id: shippingProfile.id,
          thumbnail: imageUrl,
          images: imageUrl ? [{ url: imageUrl }] : undefined,
          // NOTE: metadata is publicly readable via the store API — never put
          // wholesale cost or other private data here.
          metadata: {
            legacy_id: p.id,
            grade: p.grade,
            mrp: p.mrp,
            badge: p.badge,
            low_stock_threshold: p.lowStockThreshold,
            specs: JSON.stringify(p.specs || []),
            seo_title: p.seoTitle,
            seo_desc: p.seoDesc,
          },
          options: [{ title: "Type", values: ["Standard"] }],
          variants: [
            {
              title: p.name,
              sku: `OC-${p.id}`,
              options: { Type: "Standard" },
              manage_inventory: true,
              prices: [{ amount: p.price, currency_code: "inr" }],
            },
          ],
          sales_channels: channelIds,
        };
      }),
    },
  });

  const stockBySku = new Map(
    legacy.map((p: any) => [`OC-${p.id}`, p.stock ?? 0])
  );
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku"],
  });
  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryItems.map((item: any) => ({
        location_id: stockLocation.id,
        stocked_quantity: stockBySku.get(item.sku as string) ?? 0,
        inventory_item_id: item.id,
      })),
    },
  });

  logger.info(
    `seed-products-v2: done — ${legacy.length} products with inventory.`
  );
  await logKey();
}
