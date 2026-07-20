import { BRAND } from "@lib/brand/verticals"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/** Full-bleed Studio Curve hero — SSR copy for SEO */
const Hero = () => {
  return (
    <section
      className="relative w-full min-h-[min(88vh,860px)] flex items-end overflow-hidden bg-ink oc-pitch-lines"
      aria-labelledby="hero-heading"
    >
      <div className="oc-aurora" aria-hidden />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-transparent pointer-events-none"
      />

      <div className="relative z-10 content-container w-full pb-16 pt-36 small:pb-24 small:pt-44">
        <div className="oc-hero-enter max-w-3xl flex flex-col items-start gap-6 small:gap-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-signal">
            <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse" aria-hidden />
            India · Multi-discipline · Free ship ₹2,999+
          </p>

          <h1
            id="hero-heading"
            className="font-display font-extrabold text-white text-5xl small:text-7xl medium:text-8xl leading-[0.95] tracking-tight m-0"
          >
            {BRAND.tagline.replace(/\.$/, "")}
            <span className="text-signal">.</span>
          </h1>

          <p className="text-white/70 text-lg small:text-xl max-w-xl leading-relaxed m-0 font-medium">
            {BRAND.platformLine} Cricket is live — bats, pads, gloves. Training
            and nutrition next. One cart. One trusted stock.
          </p>

          <div className="flex flex-col xsmall:flex-row gap-3 w-full xsmall:w-auto">
            <LocalizedClientLink
              href="/store"
              data-testid="hero-shop-link"
              className="oc-btn oc-btn-primary"
            >
              Shop the store
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/categories/bats"
              data-testid="hero-bats-link"
              className="oc-btn oc-btn-ghost"
            >
              Explore cricket bats
            </LocalizedClientLink>
          </div>

          <dl className="flex flex-wrap gap-8 small:gap-12 pt-4 m-0">
            {[
              { k: "Live", v: "Cricket" },
              { k: "Delivery", v: "3–5 days" },
              { k: "Checkout", v: "UPI · Cards" },
            ].map((s) => (
              <div key={s.k} className="flex flex-col gap-0.5">
                <dt className="text-[11px] uppercase tracking-[0.18em] text-white/40 m-0 font-semibold">
                  {s.k}
                </dt>
                <dd className="font-display font-bold text-xl text-white m-0">
                  {s.v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

export default Hero
