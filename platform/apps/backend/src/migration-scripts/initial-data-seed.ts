import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";
import * as fs from "fs";
import * as path from "path";

/* OneCurve Sports — initial data seed (India / INR).
 *
 * Creates the store, an India region, TWO sales channels sharing ONE stock
 * location ("Online Store" + "POS" — the unified-inventory requirement),
 * cricket categories, and imports the catalog from the repo's
 * data/products.json so the legacy storefront and this platform start from
 * the same products.
 *
 * GST: configure in admin → Settings → Tax Regions (business decision:
 * GST-inclusive vs exclusive pricing). Razorpay payment provider is wired in
 * a later phase; checkout uses the system default provider until then.
 */

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

type LegacyProduct = {
  id: number;
  name: string;
  slug?: string;
  cat: string;
  grade: string | null;
  mrp: number;
  cost?: number;
  price: number;
  badge: string | null;
  desc: string;
  specs: { k: string; v: string }[];
  active: boolean;
  stock: number;
  lowStockThreshold: number;
  image?: string;
};

// Public base URL the storefront/browser uses to load product images served
// by Medusa's file module (/static). Override in prod via env.
const IMAGE_BASE_URL =
  process.env.MEDUSA_IMAGE_BASE_URL ||
  process.env.MEDUSA_BACKEND_URL ||
  "http://localhost:9000";

function loadLegacyCatalog(logger: {
  warn: (m: string) => void;
}): LegacyProduct[] {
  const candidates = [
    process.env.ONECURVE_CATALOG_PATH,
    path.resolve(process.cwd(), "../../../data/products.json"), // repo root
    path.resolve(process.cwd(), "data/products.json"),
  ].filter(Boolean) as string[];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        return JSON.parse(fs.readFileSync(p, "utf8")).products;
      }
    } catch (e) {
      logger.warn(`Could not read catalog at ${p}: ${e}`);
    }
  }
  logger.warn(
    "OneCurve catalog (data/products.json) not found — seeding store config only, no products."
  );
  return [];
}

export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  );

  logger.info("Seeding OneCurve store data...");
  const {
    result: [onlineChannel, posChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        {
          name: "Online Store",
          description: "onecurve.in web storefront",
        },
        {
          name: "POS",
          description: "In-store point of sale",
        },
      ],
    },
  });

  const {
    result: [publishableApiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "OneCurve Storefront",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [onlineChannel.id],
    },
  });

  await createStoresWorkflow(container).run({
    input: {
      stores: [
        {
          name: "OneCurve Sports",
          supported_currencies: [
            {
              currency_code: "inr",
              is_default: true,
            },
          ],
          default_sales_channel_id: onlineChannel.id,
        },
      ],
    },
  });

  logger.info("Seeding region data...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "India",
          currency_code: "inr",
          countries: ["in"],
          // Manual always; Razorpay added when provider is registered +
          // enable-razorpay-region.ts (or Admin → Region → payment providers).
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const region = regionResult[0];

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: [
      {
        country_code: "in",
        provider_id: "tp_system",
      },
    ],
  });

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "OneCurve Store",
          address: {
            city: "",
            country_code: "IN",
            address_1: "",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment data...");
  let { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  let shippingProfile: any = shippingProfileResult[0];
  if (!shippingProfile) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: {
        data: [{ name: "Default Shipping Profile", type: "default" }],
      },
    });
    shippingProfile = result[0];
  }

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "India delivery",
    type: "shipping",
    service_zones: [
      {
        name: "India",
        geo_zones: [
          {
            country_code: "in",
            type: "country",
          },
        ],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  // Flat Rs.199 — the free-shipping-above-Rs.2,999 rule is added with the
  // checkout work (conditional shipping price / promotion), per CLAUDE.md.
  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Delivered in 3-5 business days.",
          code: "standard",
        },
        prices: [
          {
            currency_code: "inr",
            amount: 199,
          },
          {
            region_id: region.id,
            amount: 199,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });

  // ONE shared inventory: both the online store and the POS sell from the
  // same stock location.
  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [onlineChannel.id, posChannel.id],
    },
  });
  logger.info("Finished seeding store/region/fulfillment data.");

  logger.info("Seeding OneCurve catalog...");
  const legacy = loadLegacyCatalog(logger);

  const CATEGORY_NAMES: Record<string, string> = {
    bats: "Bats",
    pads: "Pads",
    gloves: "Gloves",
  };
  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: Object.values(CATEGORY_NAMES).map((name) => ({
        name,
        is_active: true,
      })),
    },
  });
  const categoryId = (cat: string) =>
    categoryResult.find((c) => c.name === CATEGORY_NAMES[cat])?.id;

  if (legacy.length) {
    await createProductsWorkflow(container).run({
      input: {
        products: legacy.map((p) => {
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
          },
          options: [
            {
              title: "Type",
              values: ["Standard"],
            },
          ],
          variants: [
            {
              title: p.name,
              sku: `OC-${p.id}`,
              options: { Type: "Standard" },
              manage_inventory: true,
              prices: [
                {
                  amount: p.price, // INR major units
                  currency_code: "inr",
                },
              ],
            },
          ],
          sales_channels: [{ id: onlineChannel.id }, { id: posChannel.id }],
          };
        }),
      },
    });

    logger.info("Seeding inventory levels from legacy stock...");
    const stockBySku = new Map(legacy.map((p) => [`OC-${p.id}`, p.stock]));
    const { data: inventoryItems } = await query.graph({
      entity: "inventory_item",
      fields: ["id", "sku"],
    });
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: inventoryItems.map((item) => ({
          location_id: stockLocation.id,
          stocked_quantity: stockBySku.get(item.sku as string) ?? 0,
          inventory_item_id: item.id,
        })),
      },
    });
  }

  logger.info(
    `OneCurve seed complete — ${legacy.length} products, publishable key: ${publishableApiKey.token ?? publishableApiKey.id}`
  );
}
