import { clx } from "@modules/common/components/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block w-32 h-9 bg-ui-bg-subtle animate-pulse" />
  }

  // OneCurve: show supplier MRP as the strike-through anchor + % saved.
  const mrp = Number((product.metadata as any)?.mrp) || 0
  const sellNum = Number(selectedPrice.calculated_price_number) || 0
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
    <div className="flex flex-col text-ui-fg-base">
      <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1">
        <span
          className="font-display text-4xl tracking-wide"
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          {!variant && "From "}
          {selectedPrice.calculated_price}
        </span>
        {mrpFmt && discount > 0 && (
          <span
            className="text-base text-ui-fg-muted line-through"
            data-testid="mrp-price"
          >
            {mrpFmt}
          </span>
        )}
      </div>
      {mrpFmt && discount > 0 && (
        <span className="mt-1 text-sm font-semibold text-gold">
          You save {discount}% off MRP
        </span>
      )}
      <span className="mt-1 text-xs text-ui-fg-muted">
        Inclusive of all taxes
      </span>
    </div>
  )
}
