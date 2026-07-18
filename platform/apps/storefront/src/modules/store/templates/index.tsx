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
      <div className="border-b border-ui-border-base bg-crease">
        <div className="content-container py-10 small:py-12">
          <p className="text-[11px] uppercase tracking-[0.25em] text-mist m-0">
            OneCurve · All disciplines
          </p>
          <h1
            className="font-display font-bold text-4xl small:text-6xl text-pitch mt-2 m-0 tracking-tight uppercase"
            data-testid="store-page-title"
          >
            All products
          </h1>
          <p className="text-mist text-sm mt-3 max-w-xl m-0 leading-relaxed">
            Everything in stock across OneCurve — cricket live now; gym,
            nutrition and recovery join the same catalogue as we launch.
          </p>
        </div>
      </div>

      <div
        className="flex flex-col small:flex-row small:items-start py-8 content-container gap-8 oc-scroll-contain"
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
    </>
  )
}

export default StoreTemplate
