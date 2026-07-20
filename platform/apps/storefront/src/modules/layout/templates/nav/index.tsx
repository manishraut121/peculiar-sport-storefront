import { Suspense } from "react"

import { listCategories } from "@lib/data/categories"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import BrandMark from "@modules/common/components/brand-mark"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SearchOverlay from "@modules/layout/components/search-overlay"
import SideMenu from "@modules/layout/components/side-menu"

/** Minimal Apple/Google-like nav — balanced 3-col on all viewports */
export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  // warm categories for side menu only
  await listCategories().catch(() => [])

  return (
    <div className="sticky top-0 inset-x-0 z-50 bg-paper/90 backdrop-blur-xl border-b border-line/80 oc-sticky-nav supports-[backdrop-filter]:bg-paper/75">
      <a
        href="#main-content"
        className="absolute left-[-9999px] focus:left-3 focus:top-3 focus:z-[60] focus:bg-signal focus:text-white focus:px-4 focus:py-2 focus:rounded-full focus:text-sm"
      >
        Skip to content
      </a>

      <header className="h-14 small:h-14">
        <nav
          className="content-container grid grid-cols-[1fr_auto_1fr] items-center w-full h-full gap-2"
          aria-label="Primary"
        >
          {/* Left: menu (mobile) / links (desktop) */}
          <div className="flex items-center gap-1 min-w-0 justify-start">
            <div className="small:hidden">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
              />
            </div>
            <ul className="hidden small:flex items-center gap-0.5 text-[12px] font-semibold text-fog">
              <li>
                <LocalizedClientLink
                  href="/store"
                  className="inline-flex items-center min-h-11 px-2.5 py-1.5 rounded-md hover:text-ink transition-colors"
                  data-testid="nav-store-link-all"
                >
                  Store
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/disciplines/training"
                  className="inline-flex items-center min-h-11 px-2.5 py-1.5 rounded-md hover:text-ink transition-colors"
                >
                  Training
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/disciplines/nutrition"
                  className="inline-flex items-center min-h-11 px-2.5 py-1.5 rounded-md hover:text-ink transition-colors"
                >
                  Nutrition
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/disciplines/recovery"
                  className="inline-flex items-center min-h-11 px-2.5 py-1.5 rounded-md hover:text-ink transition-colors"
                >
                  Recovery
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Center brand — always truly centered */}
          <div className="flex justify-center shrink-0 px-1">
            <BrandMark size="sm" />
          </div>

          {/* Right: search + bag (+ account desktop) */}
          <div className="flex items-center justify-end gap-0.5 text-[12px] font-semibold min-w-0">
            <SearchOverlay />
            <LocalizedClientLink
              href="/account"
              className="hidden small:inline-flex items-center min-h-11 px-2.5 py-1.5 rounded-md text-fog hover:text-ink"
              data-testid="nav-account-link"
            >
              Account
            </LocalizedClientLink>
            <Suspense
              fallback={
                <LocalizedClientLink
                  href="/cart"
                  className="inline-flex items-center min-h-11 px-2.5 py-1.5 text-ink"
                  data-testid="nav-cart-link"
                >
                  Bag
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
