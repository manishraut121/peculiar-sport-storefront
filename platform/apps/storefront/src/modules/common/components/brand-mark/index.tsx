import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"

type Props = {
  href?: string
  size?: "sm" | "md" | "lg"
  className?: string
  light?: boolean
}

/**
 * OneCurve wordmark + curve stroke (brand logo system).
 * Always a real link for SEO crawl paths when href is set.
 */
export default function BrandMark({
  href = "/",
  size = "md",
  className,
  light = false,
}: Props) {
  const sizeClass =
    size === "lg"
      ? "text-4xl small:text-5xl"
      : size === "sm"
        ? "text-2xl"
        : "text-3xl"

  const inner = (
    <span
      className={clx(
        "font-display font-bold uppercase tracking-[0.04em] oc-mark",
        sizeClass,
        light ? "text-willow" : "text-ui-fg-base",
        className
      )}
    >
      One<span className="text-boundary">Curve</span>
    </span>
  )

  if (!href) return inner

  return (
    <LocalizedClientLink
      href={href}
      className="inline-flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-boundary"
      data-testid="nav-store-link"
      aria-label="OneCurve Sports — home"
    >
      {inner}
    </LocalizedClientLink>
  )
}
