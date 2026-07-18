import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * SSR hero — all copy in HTML for SEO. Gold aurora is CSS-only (no JS).
 * H1 includes primary commercial keywords for India cricket retail.
 */
const Hero = () => {
  return (
    <section
      className="relative w-full min-h-[min(92vh,880px)] flex items-center justify-center overflow-hidden bg-ink"
      aria-labelledby="hero-heading"
    >
      <div className="oc-aurora" aria-hidden />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(240,238,232,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(240,238,232,.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(70% 60% at 50% 40%, black, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(70% 60% at 50% 40%, black, transparent 80%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-5 small:px-6 gap-7 small:gap-8 max-w-4xl mx-auto py-28 small:py-32">
        <p className="oc-glass rounded-full px-5 py-2.5 text-gold tracking-[0.28em] text-[11px] small:text-xs uppercase font-medium min-h-[44px] flex items-center">
          Handcrafted cricket equipment · Made in India
        </p>

        <h1
          id="hero-heading"
          className="font-display text-cream leading-[0.95] text-5xl small:text-7xl medium:text-8xl"
        >
          English Willow cricket bats
          <br />
          <span className="oc-shimmer">engineered for runs</span>
        </h1>

        <p className="text-cream-muted text-base small:text-lg max-w-xl leading-relaxed">
          Premium Grade 1+ to Grade 4 English Willow bats, batting pads and
          gloves — hand-pressed in our workshop and delivered pan-India in 3–5
          days. Free shipping over ₹2,999.
        </p>

        <div className="flex flex-col small:flex-row items-stretch small:items-center gap-3 small:gap-4 mt-1 w-full small:w-auto">
          <LocalizedClientLink
            href="/store"
            data-testid="hero-shop-link"
            className="inline-flex items-center justify-center min-h-[48px] px-10 py-3.5 rounded-full bg-gold text-ink font-medium text-base hover:bg-gold-hover transition-colors duration-200 hover:shadow-[0_0_36px_rgba(201,168,76,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Shop cricket equipment
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/categories/bats"
            data-testid="hero-bats-link"
            className="inline-flex items-center justify-center min-h-[48px] oc-glass px-10 py-3.5 rounded-full text-cream font-medium text-base hover:border-gold hover:text-gold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Explore cricket bats
          </LocalizedClientLink>
        </div>

        <dl className="grid grid-cols-3 gap-4 small:gap-10 mt-8 small:mt-10 w-full max-w-lg text-cream-muted text-xs small:text-sm">
          <div className="flex flex-col items-center gap-1">
            <dt className="sr-only">Willow grade</dt>
            <dd className="font-display text-xl small:text-2xl text-cream m-0">
              Grade 1+
            </dd>
            <span>English Willow</span>
          </div>
          <div className="flex flex-col items-center gap-1 border-x border-cream/10 px-2">
            <dt className="sr-only">Delivery</dt>
            <dd className="font-display text-xl small:text-2xl text-cream m-0">
              3–5 days
            </dd>
            <span>Pan-India</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <dt className="sr-only">Origin</dt>
            <dd className="font-display text-xl small:text-2xl text-cream m-0">
              Made in
            </dd>
            <span>India</span>
          </div>
        </dl>
      </div>

      <div
        aria-hidden
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-cream/30 text-[10px] tracking-[0.3em] uppercase hidden small:block"
      >
        Scroll
      </div>
    </section>
  )
}

export default Hero
