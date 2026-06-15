import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Razorpay is wired but DORMANT until keys are present. Add to the backend
// .env to go live (test or live keys):
//   RAZORPAY_KEY_ID=rzp_test_xxx
//   RAZORPAY_KEY_SECRET=xxx
//   RAZORPAY_WEBHOOK_SECRET=xxx   (optional, for webhook verification)
// Until then, Medusa's built-in manual payment handles checkout so the
// store is fully testable.
const razorpayEnabled = !!(
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
)

const modules: any[] = []
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
