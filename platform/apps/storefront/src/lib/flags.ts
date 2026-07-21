/**
 * OneCurve feature flags — driven by environment.
 *
 * Source of truth: platform/config/flags/{dev,stage,prod}.json
 * Applied via:     platform/scripts/flip-env.sh <env>
 *
 * Runtime:
 *   NEXT_PUBLIC_OC_ENV              = dev | stage | prod
 *   NEXT_PUBLIC_OC_FEATURE_FLAGS    = compact JSON of the "flags" object
 *
 * Flip is deploy-time (rebuild storefront) — intentional, not a live remote
 * config service. Keeps budget low and behaviour deterministic for e2e.
 */

export type OcEnv = "dev" | "stage" | "prod"

export type OcFlags = {
  payments: {
    razorpay: boolean
    razorpay_live_keys: boolean
    manual_checkout: boolean
    cod: boolean
  }
  commerce: {
    free_shipping_threshold: number
    shipping_flat_inr: number
    prices_tax_inclusive: boolean
    gst_line_item: boolean
  }
  features: {
    ai_assistant: boolean
    smart_search: boolean
    blog: boolean
    customer_accounts: boolean
    reviews: boolean
    wishlist: boolean
    pos: boolean
    bookkeeping: boolean
    maintenance_mode: boolean
    [key: string]: boolean
  }
  ops: {
    seed_on_boot: boolean
    debug_logging: boolean
    e2e_hooks: boolean
    show_env_badge: boolean
    [key: string]: boolean
  }
}

const DEFAULT_DEV: OcFlags = {
  payments: {
    razorpay: false,
    razorpay_live_keys: false,
    manual_checkout: true,
    cod: false,
  },
  commerce: {
    free_shipping_threshold: 2999,
    shipping_flat_inr: 199,
    prices_tax_inclusive: true,
    gst_line_item: false,
  },
  features: {
    ai_assistant: true,
    smart_search: true,
    blog: true,
    customer_accounts: true,
    reviews: false,
    wishlist: false,
    pos: false,
    bookkeeping: true,
    maintenance_mode: false,
  },
  ops: {
    seed_on_boot: true,
    debug_logging: true,
    e2e_hooks: true,
    show_env_badge: true,
  },
}

function parseFlags(raw?: string | null): OcFlags | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as OcFlags
    if (!parsed?.payments || !parsed?.commerce) return null
    return parsed
  } catch {
    return null
  }
}

export function getOcEnv(): OcEnv {
  const v = (process.env.NEXT_PUBLIC_OC_ENV || "dev").toLowerCase()
  if (v === "stage" || v === "prod" || v === "dev") return v
  return "dev"
}

const DEFAULT_STAGE: OcFlags = {
  ...DEFAULT_DEV,
  payments: {
    razorpay: true,
    razorpay_live_keys: false,
    manual_checkout: true,
    cod: false,
  },
  ops: {
    ...DEFAULT_DEV.ops,
    seed_on_boot: false,
    show_env_badge: true,
  },
}

const DEFAULT_PROD: OcFlags = {
  ...DEFAULT_DEV,
  payments: {
    razorpay: true,
    razorpay_live_keys: true,
    manual_checkout: false,
    cod: false,
  },
  ops: {
    ...DEFAULT_DEV.ops,
    seed_on_boot: false,
    debug_logging: false,
    e2e_hooks: false,
    show_env_badge: false,
  },
}

export function getFlags(): OcFlags {
  const fromEnv = parseFlags(process.env.NEXT_PUBLIC_OC_FEATURE_FLAGS)
  if (fromEnv) return fromEnv
  const env = getOcEnv()
  if (env === "prod") return DEFAULT_PROD
  if (env === "stage") return DEFAULT_STAGE
  return DEFAULT_DEV
}

export function isFeatureEnabled(
  key: keyof OcFlags["features"] | string
): boolean {
  const flags = getFlags()
  return Boolean(flags.features[key as string])
}

export function freeShippingThreshold(): number {
  return getFlags().commerce.free_shipping_threshold
}

export function shippingFlatInr(): number {
  return getFlags().commerce.shipping_flat_inr
}

export function paymentsConfig() {
  return getFlags().payments
}

export function showEnvBadge(): boolean {
  return getFlags().ops.show_env_badge && getOcEnv() !== "prod"
}
