import { Suspense } from "react"

import { STORE_SEO } from "@lib/brand/seo-copy"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <>
      <header className="border-b border-line bg-mute">
        <div className="content-container py-10 small:py-16">
          <p className="text-xs uppercase tracking-[0.2em] text-signal font-bold m-0">
            OneCurve catalogue
          </p>
          <h1
            className="font-display font-extrabold text-3xl xsmall:text-4xl small:text-6xl text-ink mt-2 m-0 tracking-tight"
            data-testid="store-page-title"
          >
            {STORE_SEO.h1}
          </h1>
          <p className="text-fog text-sm small:text-base mt-3 max-w-2xl m-0 leading-relaxed font-medium">
            {STORE_SEO.intro}
          </p>
          <nav
            className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold"
            aria-label="Store shortcuts"
          >
            <LocalizedClientLink
              href="/categories/bats"
              className="text-signal hover:underline"
            >
              Cricket bats
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/categories/pads"
              className="text-signal hover:underline"
            >
              Pads
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/categories/gloves"
              className="text-signal hover:underline"
            >
              Gloves
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/blog"
              className="text-signal hover:underline"
            >
              Buying guides
            </LocalizedClientLink>
          </nav>
        </div>
      </header>

      <div
        className="flex flex-col small:flex-row small:items-start py-6 small:py-8 content-container gap-6 small:gap-8 oc-scroll-contain"
        data-testid="category-container"
      >
        <RefinementList sortBy={sort} />
        <div className="w-full min-w-0">
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>

      {/* SEO outro — crawlable, below the fold */}
      <section
        className="border-t border-line bg-white"
        aria-labelledby="store-seo-h"
      >
        <div className="content-container py-12 small:py-16 max-w-3xl">
          <h2
            id="store-seo-h"
            className="font-display font-extrabold text-xl small:text-2xl text-ink m-0"
          >
            {STORE_SEO.outroTitle}
          </h2>
          <div className="mt-4 flex flex-col gap-3 text-fog text-sm small:text-base leading-relaxed font-medium">
            {STORE_SEO.outro.map((p) => (
              <p key={p.slice(0, 32)} className="m-0">
                {p}
              </p>
            ))}
          </div>
          <p className="mt-5 m-0 text-sm font-medium">
            <LocalizedClientLink
              href="/legal/shipping-returns"
              className="text-signal font-bold hover:underline"
            >
              Shipping &amp; returns policy
            </LocalizedClientLink>
            {" · "}
            <LocalizedClientLink
              href="/blog/how-to-choose-a-cricket-bat"
              className="text-signal font-bold hover:underline"
            >
              How to choose a cricket bat
            </LocalizedClientLink>
          </p>
        </div>
      </section>
    </>
  )
}

export default StoreTemplate
