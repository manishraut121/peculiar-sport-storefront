import { test, expect } from "@playwright/test"

/**
 * @smoke — must pass before any deploy (dev → stage → prod).
 * Run: npm run test:smoke -w @dtc/e2e
 */
test.describe("@smoke storefront health", () => {
  test("home page loads with brand + shop CTA", async ({ page }) => {
    await page.goto("/in")
    await expect(page).toHaveTitle(/OneCurve/i)
    await expect(page.getByTestId("hero-shop-link")).toBeVisible()
  })

  test("store listing shows products", async ({ page }) => {
    await page.goto("/in/store")
    await expect(page.getByTestId("store-page-title")).toBeVisible()
    // Products grid or empty-state — never a 500
    const list = page.getByTestId("products-list")
    await expect(list.or(page.getByText(/no products/i))).toBeVisible({
      timeout: 30_000,
    })
  })

  test("legal pages are reachable from footer", async ({ page }) => {
    await page.goto("/in")
    await page.getByTestId("footer-privacy").click()
    await expect(page.getByTestId("legal-page-privacy")).toBeVisible()
    await page.getByTestId("footer-terms").click()
    await expect(page.getByTestId("legal-page-terms")).toBeVisible()
    await page.getByTestId("footer-shipping-returns").click()
    await expect(page.getByTestId("legal-page-shipping-returns")).toBeVisible()
  })

  test("backend health endpoint", async ({ request }) => {
    const api = process.env.E2E_API_URL || "http://localhost:9000"
    const res = await request.get(`${api}/health`)
    expect(res.ok()).toBeTruthy()
  })
})
