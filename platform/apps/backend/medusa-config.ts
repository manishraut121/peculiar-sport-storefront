import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'
import { shouldRegisterRazorpay, getOcEnv } from './src/utils/flags'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Razorpay registration is gated by feature flags (platform/config/flags/*.json)
// + presence of keys. Live keys are refused outside OC_ENV=prod.
// Flip env: platform/scripts/flip-env.sh <dev|stage|prod>
const razorpayEnabled = shouldRegisterRazorpay()
if (process.env.OC_ENV || process.env.OC_FEATURE_FLAGS) {
  console.log(
    `[OC] env=${getOcEnv()} razorpay_provider=${razorpayEnabled ? "on" : "off"}`
  )
}

// Cloud image storage (Cloudflare R2 / any S3) — used for admin-uploaded
// product photos so they survive container restarts on Railway/Vercel/etc.
// Dormant until S3 creds are set; locally + the bundled /static images keep
// working via the default file provider.
//   S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET, S3_ENDPOINT, S3_FILE_URL
//   (R2 endpoint: https://<account_id>.r2.cloudflarestorage.com)
const s3Enabled = !!(
  process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
)

const modules: any[] = [
  // Owner/employee bookkeeping: expenses + P&L API + admin UI route
  { resolve: "./src/modules/bookkeeping" },
]

if (s3Enabled) {
  modules.push({
    resolve: '@medusajs/file',
    options: {
      providers: [
        {
          resolve: '@medusajs/file-s3',
          id: 's3',
          options: {
            file_url: process.env.S3_FILE_URL,
            access_key_id: process.env.S3_ACCESS_KEY_ID,
            secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
            region: process.env.S3_REGION || 'auto',
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
    resolve: '@medusajs/payment',
    options: {
      providers: [
        {
          resolve: './src/modules/razorpay',
          id: 'razorpay',
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
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules,
})
