import { HttpTypes } from "@medusajs/types"
import Image from "next/image"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  productTitle?: string
}

/**
 * Performance: only first image is priority (LCP).
 * SEO: descriptive alt per frame. Aspect ratio reserved → no CLS.
 */
const ImageGallery = ({ images, productTitle }: ImageGalleryProps) => {
  const list = images?.length ? images : []

  if (!list.length) {
    return (
      <div className="aspect-[4/5] w-full rounded-2xl bg-crease border border-ui-border-base flex items-center justify-center text-mist text-sm">
        Photo coming soon
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 small:gap-4">
      {list.map((image, index) => {
        const alt =
          productTitle != null
            ? `${productTitle} — image ${index + 1} — OneCurve`
            : `Product image ${index + 1} — OneCurve`
        return (
          <div
            key={image.id}
            className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-crease border border-ui-border-base"
            id={image.id}
          >
            {!!image.url && (
              <Image
                src={image.url}
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                className="object-cover object-center"
                alt={alt}
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                quality={index === 0 ? 80 : 70}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ImageGallery
