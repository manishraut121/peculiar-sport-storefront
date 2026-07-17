import { defineConfig, devices } from "@playwright/test"

/**
 * Repeatable e2e suite for OneCurve.
 *
 * Prerequisites:
 *   1. ./scripts/flip-env.sh dev   (or stage)
 *   2. Stack up: ./dev.sh  OR  docker compose up -d
 *   3. cd apps/e2e && npx playwright install chromium
 *   4. npm test -w @dtc/e2e
 *
 * Env overrides:
 *   E2E_BASE_URL=http://localhost:8000
 *   E2E_API_URL=http://localhost:9000
 *   E2E_ADMIN_EMAIL=admin@onecurve.in
 *   E2E_ADMIN_PASSWORD=...
 */
const BASE = process.env.E2E_BASE_URL || "http://localhost:8000"
const API = process.env.E2E_API_URL || "http://localhost:9000"

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
    ["json", { outputFile: "test-results/results.json" }],
  ],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: BASE,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    locale: "en-IN",
    extraHTTPHeaders: {
      "x-oc-e2e": "1",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"] },
    },
  ],
  metadata: {
    apiURL: API,
  },
})
