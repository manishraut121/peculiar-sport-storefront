/**
 * Link Razorpay (+ keep manual if stage) to the India region.
 *
 *   npx medusa exec ./src/scripts/enable-razorpay-region.ts
 *
 * Run on the droplet after RAZORPAY_* keys are set and backend has restarted
 * with razorpay provider registered.
 */
import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

const RAZORPAY = "pp_razorpay_razorpay"
const MANUAL = "pp_system_default"

export default async function enableRazorpayRegion({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const regionModule = container.resolve(Modules.REGION)

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code", "payment_providers.id"],
  })

  if (!regions?.length) {
    logger.error("No regions found")
    return
  }

  // Prefer INR / India
  const region =
    regions.find((r: any) => r.currency_code === "inr") || regions[0]

  const existing = new Set(
    ((region as any).payment_providers || []).map((p: any) => p.id || p)
  )

  const next = new Set(existing)
  next.add(RAZORPAY)

  // Keep manual on stage/dev for demos; prod flags turn it off in UI but
  // leaving the provider linked is harmless if storefront doesn't show it.
  const ocEnv = process.env.OC_ENV || process.env.NEXT_PUBLIC_OC_ENV || "dev"
  if (ocEnv !== "prod") {
    next.add(MANUAL)
  }

  const providers = Array.from(next)
  logger.info(
    `Region ${region.id} (${(region as any).name}) payment_providers → ${providers.join(", ")}`
  )

  await regionModule.updateRegions(region.id, {
    payment_providers: providers,
  } as any)

  logger.info("✓ Razorpay linked to region")
}
