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
    <div className="sticky top-0 inset-x-0 z-50">
      <a
        href="#main-content"
        className="absolute left-[-9999px] focus:left-3 focus:top-3 focus:z-[60] focus:bg-boundary focus:text-pitch focus:px-4 focus:py-2.5 focus:rounded-md focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>

      <div className="hidden small:block bg-pitch text-willow/70">
        <div className="content-container flex items-center justify-center h-8 text-[11px] tracking-[0.18em] uppercase">
          Handcrafted in India · Free shipping ₹2,999+ · 3–5 day delivery
        </div>
      </div>

      <header className="h-16 border-b border-ui-border-base bg-willow/90 backdrop-blur-md supports-[backdrop-filter]:bg-willow/80">
        <nav
          className="content-container flex items-center justify-between w-full h-full"
          aria-label="Primary"
        >
          <div className="flex items-center gap-x-8 flex-1 basis-0 h-full">
            <div className="h-full flex items-center small:hidden">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
              />
            </div>
            <ul className="hidden small:flex items-center gap-x-7 h-full text-[13px] font-medium uppercase tracking-[0.08em]">
              {topCategories.map((c: any) => (
                <li key={c.id} className="h-full flex items-center">
                  <LocalizedClientLink
                    href={`/categories/${c.handle}`}
                    className="relative h-full flex items-center text-ui-fg-subtle hover:text-pitch after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 after:bg-boundary hover:after:w-full after:transition-all"
                    data-testid={`nav-category-${c.handle}`}
                  >
                    {c.name}
                  </LocalizedClientLink>
                </li>
              ))}
              <li className="h-full flex items-center">
                <LocalizedClientLink
                  href="/store"
                  className="relative h-full flex items-center text-ui-fg-subtle hover:text-pitch after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 after:bg-boundary hover:after:w-full after:transition-all"
                  data-testid="nav-store-link-all"
                >
                  All
                </LocalizedClientLink>
              </li>
              <li className="h-full flex items-center">
                <LocalizedClientLink
                  href="/blog"
                  className="relative h-full flex items-center text-ui-fg-subtle hover:text-pitch after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 after:bg-boundary hover:after:w-full after:transition-all"
                  data-testid="nav-blog-link"
                >
                  Journal
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          <BrandMark size="md" />

          <div className="flex items-center gap-x-5 h-full flex-1 basis-0 justify-end text-[13px] font-medium uppercase tracking-[0.08em]">
            <SearchOverlay />
            <LocalizedClientLink
              className="hidden small:flex items-center min-h-[44px] text-ui-fg-subtle hover:text-pitch"
              href="/account"
              data-testid="nav-account-link"
            >
              Account
            </LocalizedClientLink>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="text-ui-fg-subtle hover:text-pitch flex gap-2 min-h-[44px] items-center"
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
