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
    <article className="h-full min-w-0">
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="group flex flex-col h-full rounded-2xl small:rounded-3xl bg-white border border-line p-1.5 small:p-2.5 oc-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal transition-[border-color,box-shadow] duration-300"
        data-testid={`product-card-${product.handle}`}
      >
        <div data-testid="product-wrapper" className="relative flex flex-col h-full min-w-0">
          {discount > 0 && (
            <span className="absolute top-2 left-2 small:top-3 small:left-3 z-10 rounded-full bg-signal text-white px-2 py-0.5 small:px-2.5 small:py-1 text-[10px] font-bold uppercase tracking-wide">
              −{discount}%
            </span>
          )}
          <div className="overflow-hidden rounded-xl small:rounded-2xl bg-mute shrink-0">
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="full"
              isFeatured={isFeatured}
              alt={alt}
              className="!border-0 !rounded-xl small:!rounded-2xl"
            />
          </div>
          <div className="mt-2.5 small:mt-3.5 flex flex-col gap-0.5 small:gap-1 px-1 small:px-1.5 pb-1 small:pb-1.5 min-w-0 flex-1">
            {category && (
              <p className="text-[9px] small:text-[10px] uppercase tracking-[0.14em] text-fog font-bold m-0 truncate">
                {category}
              </p>
            )}
            <h3
              className="text-[13px] small:text-sm font-bold text-ink group-hover:text-signal transition-colors duration-200 leading-snug m-0 line-clamp-2"
              data-testid="product-title"
            >
              {product.title}
            </h3>
            {cheapestPrice && (
              <div className="flex items-baseline flex-wrap gap-x-1.5 gap-y-0.5 mt-auto pt-1">
                <span className="font-display font-extrabold text-base small:text-lg text-ink tracking-tight">
                  <PreviewPrice price={cheapestPrice} />
                </span>
                {mrpFmt && discount > 0 && (
                  <span className="text-[11px] small:text-xs text-fog line-through">
                    {mrpFmt}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </LocalizedClientLink>
    </article>
  )
}
