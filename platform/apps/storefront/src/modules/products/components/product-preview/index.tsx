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

  const alt = `${product.title}${
    category ? ` ${category}` : ""
  } cricket equipment — OneCurve`

  return (
    <article className="h-full">
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="group flex flex-col h-full rounded-xl border border-transparent hover:border-ui-border-base p-1 small:p-1.5 -m-1 small:m-0 transition-colors duration-200 oc-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        data-testid={`product-card-${product.handle}`}
      >
        <div data-testid="product-wrapper" className="relative flex-1">
          {discount > 0 && (
            <span className="absolute top-3 left-3 z-10 rounded-full bg-ink/90 text-gold px-3 py-1 text-[11px] font-semibold border border-gold/30">
              {discount}% off
            </span>
          )}
          <div className="overflow-hidden rounded-lg bg-ui-bg-subtle">
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="full"
              isFeatured={isFeatured}
              alt={alt}
            />
          </div>
          <div className="mt-3 small:mt-4 flex flex-col gap-1 px-0.5">
            {category && (
              <p className="text-[10px] small:text-[11px] uppercase tracking-[0.18em] text-ui-fg-muted m-0">
                {category}
              </p>
            )}
            <h3
              className="text-sm small:text-[15px] font-medium text-ui-fg-base group-hover:text-gold transition-colors duration-200 leading-snug m-0"
              data-testid="product-title"
            >
              {product.title}
            </h3>
            {cheapestPrice && (
              <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5 mt-1">
                <span className="text-base font-semibold text-ui-fg-base font-display tracking-wide">
                  <PreviewPrice price={cheapestPrice} />
                </span>
                {mrpFmt && discount > 0 && (
                  <>
                    <span className="text-xs text-ui-fg-muted line-through">
                      {mrpFmt}
                    </span>
                    <span className="text-xs font-semibold text-gold">
                      Save {discount}%
                    </span>
                  </>
                )}
              </div>
            )}
            <span className="mt-2 text-[11px] uppercase tracking-wide text-gold opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden small:inline">
              View details →
            </span>
          </div>
        </div>
      </LocalizedClientLink>
    </article>
  )
}
