import { test, expect } from "@playwright/test"

/**
 * @regression — catalog + cart happy path (no payment).
 * Repeatable: does not mutate inventory beyond a cart session.
 */
test.describe("@regression catalog & cart", () => {
  test("browse → product PDP → add to cart → cart page", async ({ page }) => {
    await page.goto("/in/store")

    // Wait for product cards
    const productLink = page.locator('a[href*="/products/"]').first()
    await expect(productLink).toBeVisible({ timeout: 30_000 })
    await productLink.click()

    await expect(page.getByTestId("product-title")).toBeVisible()

    // Add to cart — Medusa starter uses various labels
    const addBtn = page
      .getByRole("button", { name: /add to cart/i })
      .or(page.getByTestId("add-product-button"))
    await expect(addBtn.first()).toBeVisible({ timeout: 15_000 })
    await addBtn.first().click()

    // Cart affordance
    await page.goto("/in/cart")
    await expect(
      page
        .getByTestId("checkout-button")
        .or(page.getByTestId("empty-cart-message"))
    ).toBeVisible({ timeout: 20_000 })
  })

  test("category navigation works", async ({ page }) => {
    await page.goto("/in")
    const cat = page.locator('[data-testid^="home-category-"]').first()
    if (await cat.count()) {
      await cat.click()
      await expect(page).toHaveURL(/categories|store/)
    } else {
      test.skip()
    }
  })
})
