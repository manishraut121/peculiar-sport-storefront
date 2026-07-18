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
        /* Aspect ratio reserved → CLS < 0.1 (Pro Max / Next.js image guidance) */
        "relative w-full overflow-hidden bg-crease border border-ui-border-base rounded-xl transition-colors duration-200 group-hover:border-boundary/50",
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
      /* transform-only hover, ≤300ms — no layout thrash */
      className="absolute inset-0 object-cover object-center transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.03]"
      draggable={false}
      quality={75}
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      fill
    />
  ) : (
    <div className="w-full h-full absolute inset-0 flex flex-col items-center justify-center gap-2 text-center select-none bg-crease">
      <span className="font-display font-bold text-2xl tracking-wide text-pitch/70 uppercase">
        One<span className="text-boundary">Curve</span>
      </span>
      <span className="text-[10px] uppercase tracking-[0.2em] text-mist">
        Photo coming soon
      </span>
    </div>
  )
}

export default Thumbnail
