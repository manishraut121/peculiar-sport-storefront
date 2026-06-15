import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const category = product.categories?.[0]?.name

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block"
    >
      <div data-testid="product-wrapper">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
          alt={`${product.title} — OneCurve cricket equipment`}
        />
        <div className="mt-4 flex flex-col gap-1">
          {category && (
            <span className="text-[11px] uppercase tracking-[0.18em] text-ui-fg-muted">
              {category}
            </span>
          )}
          <div className="flex items-start justify-between gap-x-3">
            <h3
              className="text-sm font-medium text-ui-fg-base group-hover:text-gold transition-colors leading-snug"
              data-testid="product-title"
            >
              {product.title}
            </h3>
            {cheapestPrice && (
              <div className="shrink-0 text-sm font-semibold text-ui-fg-base">
                <PreviewPrice price={cheapestPrice} />
              </div>
            )}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
