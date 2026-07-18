import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils"
import { shouldRegisterRazorpay, getOcEnv } from "./src/utils/flags"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

// Razorpay registration is gated by feature flags (platform/config/flags/*.json)
// + presence of keys. Live keys are refused outside OC_ENV=prod.
// Flip env: platform/scripts/flip-env.sh <dev|stage|prod>
const razorpayEnabled = shouldRegisterRazorpay()

// Bookkeeping custom module needs generated MikroORM migrations in the image.
// Until those ship, default OFF so `medusa db:migrate` can finish on a fresh DB.
// Enable later with: BOOKKEEPING_MODULE=1 (after migrations are generated).
const bookkeepingEnabled =
  process.env.BOOKKEEPING_MODULE === "1" ||
  process.env.BOOKKEEPING_MODULE === "true"

const redisUrl = process.env.REDIS_URL || process.env.REDIS_URI || ""

if (process.env.OC_ENV || process.env.OC_FEATURE_FLAGS) {
  console.log(
    `[OC] env=${getOcEnv()} razorpay=${razorpayEnabled ? "on" : "off"} redis=${redisUrl ? "on" : "OFF"} bookkeeping=${bookkeepingEnabled ? "on" : "off"}`
  )
}

// Cloud image storage (Cloudflare R2 / any S3) — dormant until S3 creds are set.
const s3Enabled = !!(
  process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
)

const modules: any[] = []

// Prefer real Redis for cache / events / workflows when URL is present.
// Skip during migrate-only / seed restore boots if SKIP_REDIS_MODULES=1
// (reduces RAM on tiny VPS; sessions still use projectConfig.redisUrl).
const skipRedisModules =
  process.env.SKIP_REDIS_MODULES === "1" ||
  process.env.SKIP_REDIS_MODULES === "true"

if (redisUrl && !skipRedisModules) {
  modules.push({
    resolve: "@medusajs/medusa/cache-redis",
    options: { redisUrl },
  })
  modules.push({
    resolve: "@medusajs/medusa/event-bus-redis",
    options: { redisUrl },
  })
  modules.push({
    resolve: "@medusajs/medusa/workflow-engine-redis",
    options: {
      redis: { url: redisUrl },
    },
  })
}

if (bookkeepingEnabled) {
  modules.push({ resolve: "./src/modules/bookkeeping" })
}

if (s3Enabled) {
  modules.push({
    resolve: "@medusajs/file",
    options: {
      providers: [
        {
          resolve: "@medusajs/file-s3",
          id: "s3",
          options: {
            file_url: process.env.S3_FILE_URL,
            access_key_id: process.env.S3_ACCESS_KEY_ID,
            secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
            region: process.env.S3_REGION || "auto",
            bucket: process.env.S3_BUCKET,
            endpoint: process.env.S3_ENDPOINT,
            additional_client_config: { forcePathStyle: true },
          },
        },
      ],
    },
  })
}

if (razorpayEnabled) {
  modules.push({
    resolve: "@medusajs/payment",
    options: {
      providers: [
        {
          resolve: "./src/modules/razorpay",
          id: "razorpay",
          options: {
            keyId: process.env.RAZORPAY_KEY_ID,
            keySecret: process.env.RAZORPAY_KEY_SECRET,
            webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
          },
        },
      ],
    },
  })
}

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    // Required for sessions in multi-instance / docker; without this Medusa
    // logs "redisUrl not found" and uses an in-memory fake.
    redisUrl: redisUrl || undefined,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules,
})
