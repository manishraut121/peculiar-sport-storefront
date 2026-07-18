import { Suspense } from "react"

import { listCategories } from "@lib/data/categories"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SearchOverlay from "@modules/layout/components/search-overlay"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const [regions, locales, currentLocale, categories] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
    listCategories().catch(() => []),
  ])

  const topCategories = (categories || [])
    .filter((c: any) => !c.parent_category)
    .slice(0, 4)

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      {/* Skip link — a11y / keyboard SEO-friendly entry */}
      <a
        href="#main-content"
        className="absolute left-[-9999px] top-auto focus:left-3 focus:top-3 focus:z-[60] focus:bg-gold focus:text-ink focus:px-4 focus:py-2.5 focus:rounded-md focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>
      {/* Utility bar — brand pride strip (Rogue-style) */}
      <div className="hidden small:block bg-ink">
        <div className="content-container flex items-center justify-center h-8 text-[11px] tracking-[0.2em] uppercase text-cream/70">
          Handcrafted in India · Free shipping over ₹2,999 · 3–5 day delivery
        </div>
      </div>

      <header className="relative h-16 mx-auto border-b border-ui-border-base bg-ui-bg-base/95 backdrop-blur-md supports-[backdrop-filter]:bg-ui-bg-base/80">
        <nav
          className="content-container flex items-center justify-between w-full h-full"
          aria-label="Primary"
        >
          {/* Left: mobile menu + desktop categories */}
          <div className="flex items-center gap-x-8 flex-1 basis-0 h-full">
            <div className="h-full flex items-center small:hidden">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
              />
            </div>
            <ul className="hidden small:flex items-center gap-x-7 h-full text-sm font-medium uppercase tracking-wide">
              {topCategories.map((c: any) => (
                <li key={c.id} className="h-full flex items-center">
                  <LocalizedClientLink
                    href={`/categories/${c.handle}`}
                    className="relative h-full flex items-center text-ui-fg-subtle hover:text-ui-fg-base after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 after:bg-gold hover:after:w-full after:transition-all"
                    data-testid={`nav-category-${c.handle}`}
                  >
                    {c.name}
                  </LocalizedClientLink>
                </li>
              ))}
              <li className="h-full flex items-center">
                <LocalizedClientLink
                  href="/store"
                  className="relative h-full flex items-center text-ui-fg-subtle hover:text-ui-fg-base after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 after:bg-gold hover:after:w-full after:transition-all"
                  data-testid="nav-store-link-all"
                >
                  All
                </LocalizedClientLink>
              </li>
              <li className="h-full flex items-center">
                <LocalizedClientLink
                  href="/blog"
                  className="relative h-full flex items-center text-ui-fg-subtle hover:text-ui-fg-base after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 after:bg-gold hover:after:w-full after:transition-all"
                  data-testid="nav-blog-link"
                >
                  Blog
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Center: wordmark */}
          <LocalizedClientLink
            href="/"
            className="font-display text-3xl tracking-wide text-ui-fg-base hover:text-gold transition-colors uppercase"
            data-testid="nav-store-link"
          >
            One<span className="text-gold">Curve</span>
          </LocalizedClientLink>

          {/* Right: search + account + cart */}
          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end text-sm">
            <SearchOverlay />
            <LocalizedClientLink
              className="hidden small:block text-ui-fg-subtle hover:text-ui-fg-base uppercase tracking-wide font-medium"
              href="/account"
              data-testid="nav-account-link"
            >
              Account
            </LocalizedClientLink>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="text-ui-fg-subtle hover:text-ui-fg-base uppercase tracking-wide font-medium flex gap-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
