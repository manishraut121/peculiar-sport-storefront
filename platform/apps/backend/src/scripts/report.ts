import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

/* Business snapshot — run any time, locally or on the server:
 *   Local:   cd platform/apps/backend && npx medusa exec ./src/scripts/report.ts
 *   Railway: backend service → ... → Shell, then the same command.
 * Read-only. Prints catalog size, low stock, orders and revenue.
 */
export default async function report({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const line = (s: string) => logger.info(s);

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "status"],
    pagination: { take: 500, skip: 0 },
  });
  const published = products.filter((p: any) => p.status === "published");

  let lowStock: any[] = [];
  const stockOf = (i: any) =>
    i.location_levels?.[0]?.stocked_quantity ?? 0;
  try {
    const { data: items } = await query.graph({
      entity: "inventory_item",
      fields: ["sku", "location_levels.stocked_quantity"],
      pagination: { take: 500, skip: 0 },
    });
    lowStock = items.filter((i: any) => stockOf(i) <= 3);
  } catch (e) {
    // inventory field shape can vary by version; skip gracefully
  }

  let orders: any[] = [];
  try {
    const r = await query.graph({
      entity: "order",
      fields: ["id", "total", "currency_code", "created_at", "status"],
      pagination: { take: 1000, skip: 0 },
    });
    orders = r.data || [];
  } catch (e) {
    // order module shape can vary; skip gracefully
  }
  const revenue = orders.reduce((s, o: any) => s + (Number(o.total) || 0), 0);

  line("──────────── OneCurve snapshot ────────────");
  line(`Products:   ${products.length} total, ${published.length} published`);
  line(`Low stock:  ${lowStock.length} item(s) at/below 3`);
  lowStock.slice(0, 15).forEach((i: any) =>
    line(`   • ${i.sku}: ${stockOf(i)} left`)
  );
  line(`Orders:     ${orders.length}`);
  line(`Revenue:    ₹${revenue.toLocaleString("en-IN")} (all-time, incl. tax)`);
  line("───────────────────────────────────────────");
}
