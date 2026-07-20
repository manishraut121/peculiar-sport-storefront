import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

/**
 * Conversion-first PDP: gallery + sticky buy box.
 * Title remains a real H1 in ProductInfo (SEO). All primary content SSR.
 */
const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  const category = product.categories?.[0]

  return (
    <>
      {/* Breadcrumb — crawlable links */}
      <nav
        aria-label="Breadcrumb"
        className="content-container pt-6 pb-2 text-xs text-mist"
      >
        <ol className="flex flex-wrap items-center gap-2 list-none m-0 p-0">
          <li>
            <LocalizedClientLink href="/" className="hover:text-boundary">
              Home
            </LocalizedClientLink>
          </li>
          <li aria-hidden className="text-ui-fg-disabled">
            /
          </li>
          <li>
            <LocalizedClientLink href="/store" className="hover:text-boundary">
              Shop
            </LocalizedClientLink>
          </li>
          {category && (
            <>
              <li aria-hidden className="text-ui-fg-disabled">
                /
              </li>
              <li>
                <LocalizedClientLink
                  href={`/categories/${category.handle}`}
                  className="hover:text-boundary"
                >
                  {category.name}
                </LocalizedClientLink>
              </li>
            </>
          )}
          <li aria-hidden className="text-ui-fg-disabled">
            /
          </li>
          <li className="text-pitch font-medium truncate max-w-[12rem] small:max-w-none">
            {product.title}
          </li>
        </ol>
      </nav>

      <div
        className="content-container grid grid-cols-1 small:grid-cols-12 gap-6 small:gap-10 py-4 small:py-10"
        data-testid="product-container"
      >
        {/* Gallery */}
        <div className="small:col-span-7 min-w-0">
          <ImageGallery images={images} productTitle={product.title} />
        </div>

        {/* Sticky purchase column */}
        <div className="small:col-span-5 flex flex-col gap-6 small:gap-8 small:sticky small:top-28 small:self-start min-w-0">
          <ProductInfo product={product} />

          <div className="oc-card p-4 small:p-6 flex flex-col gap-5 small:gap-6">
            <ProductOnboardingCta />
            <Suspense
              fallback={
                <ProductActions
                  disabled={true}
                  product={product}
                  region={region}
                />
              }
            >
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>
          </div>

          {/* Trust microcopy — conversion */}
          <ul className="grid grid-cols-1 gap-2 list-none m-0 p-0 text-sm text-mist">
            {[
              "Free shipping on orders ₹2,999+",
              "Secure UPI · cards · net-banking",
              "7-day returns on unused gear",
            ].map((t) => (
              <li
                key={t}
                className="flex items-center gap-2 rounded-lg border border-ui-border-base bg-crease/50 px-3 py-2.5"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-boundary shrink-0"
                  aria-hidden
                />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="content-container oc-section border-t border-ui-border-base py-12 small:py-16">
        <ProductTabs product={product} />
      </div>

      <div
        className="content-container oc-section my-12 small:my-20"
        data-testid="related-products-container"
      >
        <h2 className="font-display font-bold text-3xl small:text-4xl uppercase tracking-tight text-pitch mb-8 m-0">
          You may also like
        </h2>
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
