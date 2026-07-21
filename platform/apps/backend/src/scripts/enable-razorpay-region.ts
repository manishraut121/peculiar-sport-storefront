/**
 * Link Razorpay (+ keep manual if stage) to the India region.
 *
 *   npx medusa exec ./src/scripts/enable-razorpay-region.ts
 *
 * No type-only imports from @medusajs/framework/types — production
 * containers resolve exec scripts as ESM and that re-export is missing.
 */
import { updateRegionsWorkflow } from "@medusajs/medusa/core-flows"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const RAZORPAY = "pp_razorpay_razorpay"
const MANUAL = "pp_system_default"

export default async function enableRazorpayRegion({
  container,
}: {
  container: any
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code", "payment_providers.id"],
  })

  if (!regions?.length) {
    logger.error("No regions found")
    return
  }

  const region: any =
    regions.find((r: any) => r.currency_code === "inr") || regions[0]

  const existing = new Set(
    (region.payment_providers || []).map((p: any) => p.id || p)
  )

  const next = new Set(existing)
  next.add(RAZORPAY)

  const ocEnv = process.env.OC_ENV || process.env.NEXT_PUBLIC_OC_ENV || "dev"
  if (ocEnv !== "prod") {
    next.add(MANUAL)
  }

  const providers = Array.from(next)
  logger.info(
    `Region ${region.id} (${region.name}) payment_providers → ${providers.join(", ")}`
  )

  // Workflow sets region↔payment_provider links (module update alone is not enough)
  await updateRegionsWorkflow(container).run({
    input: {
      selector: { id: region.id },
      update: {
        payment_providers: providers,
      },
    },
  })

  logger.info("✓ Razorpay linked to region")
}
