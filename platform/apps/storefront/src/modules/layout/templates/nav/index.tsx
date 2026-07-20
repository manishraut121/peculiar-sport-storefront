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
    .slice(0, 3)

  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <a
        href="#main-content"
        className="absolute left-[-9999px] focus:left-3 focus:top-3 focus:z-[60] focus:bg-signal focus:text-white focus:px-4 focus:py-2.5 focus:rounded-full focus:text-sm focus:font-semibold"
      >
        Skip to content
      </a>

      <div className="hidden small:block bg-ink text-white/60">
        <div className="content-container flex items-center justify-center h-9 text-[11px] font-semibold tracking-[0.16em] uppercase">
          Free shipping over ₹2,999 · 3–5 day pan-India · Secure UPI checkout
        </div>
      </div>

      <header className="h-[4.25rem] border-b border-line bg-paper/90 backdrop-blur-lg supports-[backdrop-filter]:bg-paper/80">
        <nav
          className="content-container flex items-center justify-between w-full h-full gap-4"
          aria-label="Primary"
        >
          <div className="flex items-center gap-x-6 flex-1 basis-0 h-full min-w-0">
            <div className="h-full flex items-center small:hidden">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
              />
            </div>
            <ul className="hidden small:flex items-center gap-x-1 h-full text-[13px] font-semibold">
              <li className="h-full flex items-center">
                <LocalizedClientLink
                  href="/store"
                  className="px-3 h-10 inline-flex items-center rounded-full text-fog hover:text-ink hover:bg-mute transition-colors"
                  data-testid="nav-store-link-all"
                >
                  Shop
                </LocalizedClientLink>
              </li>
              {topCategories.map((c: any) => (
                <li key={c.id} className="h-full flex items-center">
                  <LocalizedClientLink
                    href={`/categories/${c.handle}`}
                    className="px-3 h-10 inline-flex items-center rounded-full text-fog hover:text-ink hover:bg-mute transition-colors"
                    data-testid={`nav-category-${c.handle}`}
                  >
                    {c.name}
                  </LocalizedClientLink>
                </li>
              ))}
              <li className="h-full flex items-center">
                <LocalizedClientLink
                  href="/blog"
                  className="px-3 h-10 inline-flex items-center rounded-full text-fog hover:text-ink hover:bg-mute transition-colors"
                  data-testid="nav-blog-link"
                >
                  Guides
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          <BrandMark size="md" />

          <div className="flex items-center gap-x-2 h-full flex-1 basis-0 justify-end text-[13px] font-semibold">
            <SearchOverlay />
            <LocalizedClientLink
              className="hidden small:inline-flex items-center h-10 px-3 rounded-full text-fog hover:text-ink hover:bg-mute transition-colors"
              href="/account"
              data-testid="nav-account-link"
            >
              Account
            </LocalizedClientLink>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="inline-flex items-center h-10 px-3 rounded-full bg-ink text-white"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Cart
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
