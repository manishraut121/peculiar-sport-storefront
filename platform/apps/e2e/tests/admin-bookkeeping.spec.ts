import { test, expect } from "@playwright/test"

/**
 * @regression @smoke — employee-facing admin + bookkeeping API.
 * Requires E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD when testing full UI login.
 * API checks use cookie session if available; otherwise skip UI login.
 */
const API = process.env.E2E_API_URL || "http://localhost:9000"
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || "admin@onecurve.in"
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || ""

test.describe("@regression admin bookkeeping", () => {
  test("bookkeeping API requires auth", async ({ request }) => {
    const res = await request.get(`${API}/admin/bookkeeping`)
    // Unauthenticated should be 401
    expect([401, 403]).toContain(res.status())
  })

  test("admin login page loads for employees", async ({ page }) => {
    await page.goto(`${API}/app`)
    // Medusa admin login shell
    await expect(page.locator("body")).toBeVisible()
    // Should show email/password fields or dashboard if already logged in
    const email = page.locator('input[type="email"], input[name="email"]')
    const hasLogin = (await email.count()) > 0
    const hasApp = (await page.locator('[class*="dashboard"], nav').count()) > 0
    expect(hasLogin || hasApp).toBeTruthy()
  })

  test.skip(!ADMIN_PASSWORD, "set E2E_ADMIN_PASSWORD to run login flow")
  test("employee can open bookkeeping after login", async ({ page }) => {
    await page.goto(`${API}/app/login`)
    await page.locator('input[type="email"], input[name="email"]').first().fill(ADMIN_EMAIL)
    await page.locator('input[type="password"]').first().fill(ADMIN_PASSWORD)
    await page.getByRole("button", { name: /continue|log ?in|sign ?in/i }).first().click()
    await page.waitForTimeout(2000)
    await page.goto(`${API}/app/bookkeeping`)
    await expect(page.getByText(/Bookkeeping/i)).toBeVisible({ timeout: 20_000 })
  })
})
