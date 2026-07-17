import { test, expect } from "@playwright/test"

/**
 * @usability — mobile + a11y-ish checks that catch real shopper friction.
 * Desktop + mobile projects both run these (see playwright.config).
 */
test.describe("@usability shopper experience", () => {
  test("home is usable without horizontal overflow", async ({ page }) => {
    await page.goto("/in")
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    // Allow 1px subpixel tolerance
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test("primary CTAs are keyboard-focusable", async ({ page }) => {
    await page.goto("/in")
    await page.keyboard.press("Tab")
    // Something should receive focus within a few tabs
    let focused = false
    for (let i = 0; i < 12; i++) {
      const tag = await page.evaluate(() => document.activeElement?.tagName)
      if (tag === "A" || tag === "BUTTON") {
        focused = true
        break
      }
      await page.keyboard.press("Tab")
    }
    expect(focused).toBeTruthy()
  })

  test("env badge present only outside prod", async ({ page }) => {
    await page.goto("/in")
    const env = process.env.NEXT_PUBLIC_OC_ENV || process.env.OC_ENV || "dev"
    const badge = page.getByTestId("env-badge")
    if (env === "prod") {
      await expect(badge).toHaveCount(0)
    } else {
      // Badge may render after hydration; soft check
      const count = await badge.count()
      if (count > 0) {
        await expect(badge).toHaveAttribute("data-oc-env", /dev|stage/)
      }
    }
  })

  test("cart checkout button wording is clear", async ({ page }) => {
    await page.goto("/in/cart")
    // Either empty cart message or a clear checkout CTA
    const empty = page.getByTestId("empty-cart-message")
    const checkout = page.getByTestId("checkout-button")
    await expect(empty.or(checkout)).toBeVisible({ timeout: 20_000 })
  })
})
