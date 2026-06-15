import { Suspense } from "react"

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
      {/* Page header */}
      <div className="border-b border-ui-border-base bg-ui-bg-subtle">
        <div className="content-container py-10">
          <span className="text-xs uppercase tracking-[0.25em] text-ui-fg-muted">
            OneCurve · Cricket equipment
          </span>
          <h1
            className="font-display text-5xl small:text-6xl text-ui-fg-base mt-2"
            data-testid="store-page-title"
          >
            All products
          </h1>
        </div>
      </div>

      <div
        className="flex flex-col small:flex-row small:items-start py-8 content-container gap-8"
        data-testid="category-container"
      >
        <RefinementList sortBy={sort} />
        <div className="w-full">
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>
    </>
  )
}

export default StoreTemplate
