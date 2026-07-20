import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"

type Props = {
  href?: string
  size?: "sm" | "md" | "lg"
  className?: string
  light?: boolean
}

/** OneCurve wordmark — Studio Curve identity */
export default function BrandMark({
  href = "/",
  size = "md",
  className,
  light = false,
}: Props) {
  const sizeClass =
    size === "lg" ? "text-3xl small:text-4xl" : size === "sm" ? "text-xl" : "text-2xl"

  const inner = (
    <span
      className={clx(
        "font-display font-extrabold tracking-tight oc-mark",
        sizeClass,
        light ? "text-white" : "text-ink",
        className
      )}
    >
      One<span className="text-signal">Curve</span>
    </span>
  )

  if (!href) return inner

  return (
    <LocalizedClientLink
      href={href}
      className="inline-flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
      data-testid="nav-store-link"
      aria-label="OneCurve — home"
    >
      {inner}
    </LocalizedClientLink>
  )
}
