import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

/** PDP title = single H1 for SEO. Description is crawlable SSR text. */
const ProductInfo = ({ product }: ProductInfoProps) => {
  const category = product.categories?.[0]

  return (
    <div id="product-info" className="flex flex-col gap-4">
      {product.collection && (
        <LocalizedClientLink
          href={`/collections/${product.collection.handle}`}
          className="text-xs uppercase tracking-[0.18em] text-mist hover:text-boundary transition-colors w-fit"
        >
          {product.collection.title}
        </LocalizedClientLink>
      )}
      {category && !product.collection && (
        <span className="text-xs uppercase tracking-[0.18em] text-mist">
          {category.name}
        </span>
      )}

      <h1
        className="font-display font-bold text-3xl small:text-4xl leading-[1.05] text-pitch tracking-tight uppercase m-0"
        data-testid="product-title"
      >
        {product.title}
      </h1>

      {product.description && (
        <p
          className="text-base text-ui-fg-subtle leading-relaxed whitespace-pre-line m-0"
          data-testid="product-description"
        >
          {product.description}
        </p>
      )}
    </div>
  )
}

export default ProductInfo
