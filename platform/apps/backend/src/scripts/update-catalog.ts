import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows";
import * as fs from "fs";
import * as path from "path";

/**
 * Update existing products' description + SEO metadata in place (no reseed),
 * reading the source of truth at data/products.json.
 * Run: npx medusa exec ./src/scripts/update-catalog.ts
 */
export default async function updateCatalog({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const candidates = [
    process.env.ONECURVE_CATALOG_PATH,
    path.resolve(process.cwd(), "../../../data/products.json"),
    path.resolve(process.cwd(), "../../data/products.json"),
  ].filter(Boolean) as string[];
  let legacy: any[] = [];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      legacy = JSON.parse(fs.readFileSync(p, "utf8")).products;
      break;
    }
  }
  if (!legacy.length) {
    logger.warn("update-catalog: products.json not found");
    return;
  }
  const bySlug = new Map(legacy.map((p) => [p.slug, p]));

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "metadata"],
    pagination: { take: 500, skip: 0 },
  });

  const updates: any[] = [];
  for (const prod of products) {
    const src = bySlug.get(prod.handle);
    if (!src) continue;
    updates.push({
      id: prod.id,
      description: src.desc,
      metadata: {
        ...(prod.metadata || {}),
        grade: src.grade,
        mrp: src.mrp,
        badge: src.badge,
        low_stock_threshold: src.lowStockThreshold,
        specs: JSON.stringify(src.specs || []),
        seo_title: src.seoTitle,
        seo_desc: src.seoDesc,
      },
    });
  }

  if (updates.length) {
    await updateProductsWorkflow(container).run({
      input: { products: updates },
    });
  }
  logger.info(`update-catalog: updated ${updates.length} products`);
}
