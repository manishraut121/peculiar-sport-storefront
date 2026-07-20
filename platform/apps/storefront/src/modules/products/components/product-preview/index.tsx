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

  const alt = `${product.title}${category ? ` ${category}` : ""} — OneCurve`

  return (
    <article className="h-full">
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="group flex flex-col h-full rounded-3xl bg-white border border-line p-2 small:p-2.5 oc-lift hover:border-signal/40 hover:shadow-xl transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        data-testid={`product-card-${product.handle}`}
      >
        <div data-testid="product-wrapper" className="relative">
          {discount > 0 && (
            <span className="absolute top-3 left-3 z-10 rounded-full bg-signal text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">
              −{discount}%
            </span>
          )}
          <div className="overflow-hidden rounded-2xl bg-mute">
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="full"
              isFeatured={isFeatured}
              alt={alt}
              className="!border-0 !rounded-2xl"
            />
          </div>
          <div className="mt-3.5 flex flex-col gap-1 px-1.5 pb-1.5">
            {category && (
              <p className="text-[10px] uppercase tracking-[0.16em] text-fog font-bold m-0">
                {category}
              </p>
            )}
            <h3
              className="text-sm font-bold text-ink group-hover:text-signal transition-colors duration-200 leading-snug m-0"
              data-testid="product-title"
            >
              {product.title}
            </h3>
            {cheapestPrice && (
              <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5 mt-1">
                <span className="font-display font-extrabold text-lg text-ink tracking-tight">
                  <PreviewPrice price={cheapestPrice} />
                </span>
                {mrpFmt && discount > 0 && (
                  <span className="text-xs text-fog line-through">{mrpFmt}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </LocalizedClientLink>
    </article>
  )
}
