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
      <div className="border-b border-line bg-mute">
        <div className="content-container py-12 small:py-16">
          <p className="text-xs uppercase tracking-[0.2em] text-signal font-bold m-0">
            Catalogue
          </p>
          <h1
            className="font-display font-extrabold text-4xl small:text-6xl text-ink mt-2 m-0 tracking-tight"
            data-testid="store-page-title"
          >
            All products
          </h1>
          <p className="text-fog text-base mt-3 max-w-xl m-0 leading-relaxed font-medium">
            Cricket live now; training and nutrition next. Free shipping over
            ₹2,999 pan-India.
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
