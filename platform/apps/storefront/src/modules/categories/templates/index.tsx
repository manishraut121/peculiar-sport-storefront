import { notFound } from "next/navigation"
import { Suspense } from "react"

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

  return (
    <>
      {/* Page header */}
      <div className="border-b border-ui-border-base bg-ui-bg-subtle">
        <div className="content-container py-10">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.25em] text-ui-fg-muted">
            <LocalizedClientLink href="/store" className="hover:text-gold">
              Shop
            </LocalizedClientLink>
            {parents.map((parent) => (
              <span key={parent.id} className="flex items-center gap-2">
                /
                <LocalizedClientLink
                  className="hover:text-gold"
                  href={`/categories/${parent.handle}`}
                  data-testid="sort-by-link"
                >
                  {parent.name}
                </LocalizedClientLink>
              </span>
            ))}
            <span>/ {category.name}</span>
          </div>
          <h1
            className="font-display text-5xl small:text-6xl text-ui-fg-base mt-2"
            data-testid="category-page-title"
          >
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-3 max-w-2xl text-ui-fg-subtle">
              {category.description}
            </p>
          )}
        </div>
      </div>

      <div
        className="flex flex-col small:flex-row small:items-start py-8 content-container gap-8"
        data-testid="category-container"
      >
        <RefinementList sortBy={sort} data-testid="sort-by-container" />
        <div className="w-full">
          {category.category_children && category.category_children.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {category.category_children?.map((c) => (
                <LocalizedClientLink
                  key={c.id}
                  href={`/categories/${c.handle}`}
                  className="px-4 py-2 rounded-full border border-ui-border-base text-sm text-ui-fg-subtle hover:border-gold hover:text-gold transition-colors"
                >
                  {c.name}
                </LocalizedClientLink>
              ))}
            </div>
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
    </>
  )
}
