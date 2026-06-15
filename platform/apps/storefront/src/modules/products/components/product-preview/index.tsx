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

  const mrp = Number((product.metadata as any)?.mrp) || 0
  const sellNum = cheapestPrice
    ? Number(cheapestPrice.calculated_price_number)
    : 0
  const discount =
    mrp > 0 && sellNum > 0 && mrp > sellNum
      ? Math.round(((mrp - sellNum) / mrp) * 100)
      : 0
  const mrpFmt =
    mrp > 0
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(mrp)
      : null

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
          <h3
            className="text-sm font-medium text-ui-fg-base group-hover:text-gold transition-colors leading-snug"
            data-testid="product-title"
          >
            {product.title}
          </h3>
          {cheapestPrice && (
            <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5 mt-1">
              <span className="text-base font-semibold text-ui-fg-base">
                <PreviewPrice price={cheapestPrice} />
              </span>
              {mrpFmt && discount > 0 && (
                <>
                  <span className="text-xs text-ui-fg-muted line-through">
                    {mrpFmt}
                  </span>
                  <span className="text-xs font-semibold text-gold">
                    {discount}% off
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </LocalizedClientLink>
  )
}
