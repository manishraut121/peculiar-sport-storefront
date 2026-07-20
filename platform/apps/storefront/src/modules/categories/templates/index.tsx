import { notFound } from "next/navigation"
import { Suspense } from "react"

import { categorySeo, SEO } from "@lib/brand/seo-copy"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }

  getParents(category)

  const seo = categorySeo(category.handle || "", category.name)
  const description = category.description?.trim() || seo.intro

  return (
    <>
      <header className="border-b border-line bg-mute">
        <div className="content-container py-10 small:py-12">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-fog list-none m-0 p-0">
              <li>
                <LocalizedClientLink
                  href="/store"
                  className="hover:text-signal"
                >
                  Shop
                </LocalizedClientLink>
              </li>
              {parents.reverse().map((parent) => (
                <li key={parent.id} className="flex items-center gap-2">
                  <span aria-hidden>/</span>
                  <LocalizedClientLink
                    className="hover:text-signal"
                    href={`/categories/${parent.handle}`}
                    data-testid="sort-by-link"
                  >
                    {parent.name}
                  </LocalizedClientLink>
                </li>
              ))}
              <li className="flex items-center gap-2">
                <span aria-hidden>/</span>
                <span className="text-ink font-semibold normal-case tracking-normal">
                  {category.name}
                </span>
              </li>
            </ol>
          </nav>
          <h1
            className="font-display font-extrabold text-3xl xsmall:text-4xl small:text-6xl text-ink mt-3 m-0 tracking-tight"
            data-testid="category-page-title"
          >
            {category.name}
          </h1>
          <p className="mt-3 max-w-2xl text-fog text-sm small:text-base leading-relaxed font-medium m-0">
            {description}
          </p>
          <p className="mt-2 text-xs text-fog m-0 font-medium">
            Free shipping over {SEO.freeShip} · Delivery {SEO.delivery} ·{" "}
            <LocalizedClientLink
              href="/legal/shipping-returns"
              className="text-signal hover:underline font-bold"
            >
              Returns
            </LocalizedClientLink>
          </p>
        </div>
      </header>

      <div
        className="flex flex-col small:flex-row small:items-start py-6 small:py-8 content-container gap-6 small:gap-8"
        data-testid="category-container"
      >
        <RefinementList sortBy={sort} data-testid="sort-by-container" />
        <div className="w-full min-w-0">
          {category.category_children &&
            category.category_children.length > 0 && (
              <nav
                className="mb-6 small:mb-8 flex flex-wrap gap-2"
                aria-label="Subcategories"
              >
                {category.category_children?.map((c) => (
                  <LocalizedClientLink
                    key={c.id}
                    href={`/categories/${c.handle}`}
                    className="px-4 py-2 min-h-11 inline-flex items-center rounded-full border border-line text-sm text-fog hover:border-signal hover:text-signal transition-colors font-medium"
                  >
                    {c.name}
                  </LocalizedClientLink>
                ))}
              </nav>
            )}
          <Suspense
            fallback={
              <SkeletonProductGrid
                numberOfProducts={category.products?.length ?? 8}
              />
            }
          >
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              categoryId={category.id}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>

      {!category.description?.trim() && (
        <section
          className="border-t border-line bg-white"
          aria-labelledby="cat-seo-h"
        >
          <div className="content-container py-10 small:py-14 max-w-3xl">
            <h2
              id="cat-seo-h"
              className="font-display font-extrabold text-lg small:text-xl text-ink m-0"
            >
              Buy {category.name} online at OneCurve
            </h2>
            <p className="mt-3 text-fog text-sm small:text-base leading-relaxed font-medium m-0">
              {seo.intro} Browse live stock, pay with UPI or cards, and get
              pan-India delivery. Need help choosing? Read our{" "}
              <LocalizedClientLink
                href="/blog"
                className="text-signal font-bold hover:underline"
              >
                cricket guides
              </LocalizedClientLink>{" "}
              or{" "}
              <LocalizedClientLink
                href="/store"
                className="text-signal font-bold hover:underline"
              >
                view the full store
              </LocalizedClientLink>
              .
            </p>
          </div>
        </section>
      )}
    </>
  )
}
