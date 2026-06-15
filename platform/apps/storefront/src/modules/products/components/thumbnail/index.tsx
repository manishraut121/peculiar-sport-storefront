import { clx } from "@modules/common/components/ui"
import Image from "next/image"
import React from "react"

type ThumbnailProps = {
  thumbnail?: string | null
  images?: { url?: string }[] | null
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  className?: string
  alt?: string
  "data-testid"?: string
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  isFeatured,
  className,
  alt,
  "data-testid": dataTestid,
}) => {
  const initialImage = thumbnail || images?.[0]?.url

  return (
    <div
      className={clx(
        "relative w-full overflow-hidden bg-ui-bg-subtle border border-ui-border-base rounded-large transition-shadow ease-in-out duration-150 group-hover:border-ui-border-strong",
        className,
        {
          "aspect-[11/14]": isFeatured,
          "aspect-[4/5]": !isFeatured && size !== "square",
          "aspect-[1/1]": size === "square",
          "w-[180px]": size === "small",
          "w-[290px]": size === "medium",
          "w-[440px]": size === "large",
          "w-full": size === "full",
        }
      )}
      data-testid={dataTestid}
    >
      <ImageOrPlaceholder image={initialImage} alt={alt} />
    </div>
  )
}

const ImageOrPlaceholder = ({
  image,
  alt,
}: Pick<ThumbnailProps, "alt"> & { image?: string }) => {
  return image ? (
    <Image
      src={image}
      alt={alt || "OneCurve cricket equipment"}
      className="absolute inset-0 object-cover object-center transition-transform duration-500 group-hover:scale-105"
      draggable={false}
      quality={70}
      sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
      fill
    />
  ) : (
    <div className="w-full h-full absolute inset-0 flex flex-col items-center justify-center gap-2 text-center select-none">
      <span className="font-display text-3xl tracking-wide text-ui-fg-base/80">
        One<span className="text-gold">Curve</span>
      </span>
      <span className="text-[10px] uppercase tracking-[0.25em] text-ui-fg-muted">
        Photo coming soon
      </span>
    </div>
  )
}

export default Thumbnail
