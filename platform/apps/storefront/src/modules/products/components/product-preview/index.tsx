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
  const { cheapestPrice } = getProductPrice({ product })
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
  } — OneCurve cricket equipment`

  return (
    <article className="h-full">
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="group flex flex-col h-full oc-card p-2 small:p-2.5 oc-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-boundary"
        data-testid={`product-card-${product.handle}`}
      >
        <div data-testid="product-wrapper" className="relative">
          {discount > 0 && (
            <span className="absolute top-3 left-3 z-10 rounded-full bg-pitch text-boundary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide border border-boundary/40">
              −{discount}%
            </span>
          )}
          <div className="overflow-hidden rounded-xl bg-crease">
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="full"
              isFeatured={isFeatured}
              alt={alt}
              className="!border-0 !rounded-xl"
            />
          </div>
          <div className="mt-3 flex flex-col gap-1 px-1 pb-1">
            {category && (
              <p className="text-[10px] uppercase tracking-[0.16em] text-mist m-0">
                {category}
              </p>
            )}
            <h3
              className="text-sm font-medium text-pitch group-hover:text-boundary transition-colors duration-200 leading-snug m-0"
              data-testid="product-title"
            >
              {product.title}
            </h3>
            {cheapestPrice && (
              <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                <span className="font-display font-semibold text-lg text-pitch tracking-tight">
                  <PreviewPrice price={cheapestPrice} />
                </span>
                {mrpFmt && discount > 0 && (
                  <span className="text-xs text-mist line-through">{mrpFmt}</span>
                )}
              </div>
            )}
            <span className="mt-1 text-[11px] uppercase tracking-wide text-boundary opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden small:inline">
              View →
            </span>
          </div>
        </div>
      </LocalizedClientLink>
    </article>
  )
}
