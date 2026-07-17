/**
 * OneCurve feature flags (backend).
 * Same JSON as storefront; loaded from OC_FEATURE_FLAGS or OC_FLAGS_FILE.
 */
import fs from "fs"
import path from "path"

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
  features: Record<string, boolean>
  ops: Record<string, boolean>
}

const DEFAULT: OcFlags = {
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

let cached: OcFlags | null = null

function loadFromFile(): OcFlags | null {
  const rel = process.env.OC_FLAGS_FILE
  if (!rel) return null
  // From apps/backend cwd, flags live at ../../config/flags/...
  const envName = process.env.OC_ENV || "dev"
  const candidates = [
    path.resolve(process.cwd(), rel),
    path.resolve(process.cwd(), "..", "..", rel),
    path.resolve(process.cwd(), "..", "..", "config", "flags", `${envName}.json`),
    // Docker Compose mounts platform/config → /opt/onecurve/config
    path.resolve("/opt/onecurve", rel),
    path.resolve(`/opt/onecurve/config/flags/${envName}.json`),
  ]
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const raw = JSON.parse(fs.readFileSync(p, "utf8"))
        return (raw.flags || raw) as OcFlags
      }
    } catch {
      /* try next */
    }
  }
  return null
}

export function getOcEnv(): OcEnv {
  const v = (process.env.OC_ENV || process.env.NODE_ENV || "dev").toLowerCase()
  if (v === "production") return "prod"
  if (v === "stage" || v === "staging") return "stage"
  if (v === "prod" || v === "dev") return v as OcEnv
  return "dev"
}

export function getFlags(): OcFlags {
  if (cached) return cached
  if (process.env.OC_FEATURE_FLAGS) {
    try {
      cached = JSON.parse(process.env.OC_FEATURE_FLAGS) as OcFlags
      return cached
    } catch {
      /* fall through */
    }
  }
  cached = loadFromFile() || DEFAULT
  return cached
}

export function isFeatureEnabled(key: string): boolean {
  return Boolean(getFlags().features[key])
}

export function paymentsConfig() {
  return getFlags().payments
}

export function shouldRegisterRazorpay(): boolean {
  const pay = paymentsConfig()
  const keysPresent = !!(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  )
  if (!keysPresent) return false
  if (!pay.razorpay) return false
  // Refuse live keys on non-prod
  const id = process.env.RAZORPAY_KEY_ID || ""
  const isLiveKey = id.startsWith("rzp_live_")
  if (isLiveKey && getOcEnv() !== "prod") {
    console.warn(
      "[OC FLAGS] Live Razorpay key detected outside prod — provider NOT registered"
    )
    return false
  }
  if (pay.razorpay_live_keys && getOcEnv() !== "prod") {
    return false
  }
  return true
}
