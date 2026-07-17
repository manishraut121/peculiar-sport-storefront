import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <section className="relative w-full min-h-[88vh] flex items-center justify-center overflow-hidden bg-ink">
      {/* Animated gold aurora (CSS-only, reduced-motion safe) */}
      <div className="oc-aurora" aria-hidden />
      {/* Fine grid texture for depth */}
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

      <div className="relative z-10 flex flex-col items-center text-center px-6 gap-8 max-w-4xl mx-auto py-24">
        <span className="oc-glass rounded-full px-5 py-2 text-gold tracking-[0.3em] text-xs uppercase font-medium">
          Handcrafted in India
        </span>
        <h1 className="font-display text-cream leading-[0.95] text-6xl small:text-8xl">
          The perfect curve.
          <br />
          <span className="oc-shimmer">Engineered for runs.</span>
        </h1>
        <p className="text-cream-muted text-base small:text-lg max-w-xl leading-relaxed">
          Premium English Willow cricket bats, pads and gloves — hand-picked,
          hand-pressed and play-ready. From our workshop to your crease.
        </p>
        <div className="flex flex-col small:flex-row items-center gap-4 mt-2">
          <LocalizedClientLink
            href="/store"
            data-testid="hero-shop-link"
            className="px-10 py-4 rounded-full bg-gold text-ink font-medium text-base hover:bg-gold-hover transition-all hover:shadow-[0_0_36px_rgba(201,168,76,0.35)]"
          >
            Shop the range
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/categories/bats"
            data-testid="hero-bats-link"
            className="oc-glass px-10 py-4 rounded-full text-cream font-medium text-base hover:border-gold hover:text-gold transition-colors"
          >
            Explore bats
          </LocalizedClientLink>
        </div>
        <div className="flex items-center gap-10 mt-10 text-cream-muted text-sm">
          <div className="flex flex-col items-center gap-1">
            <span className="font-display text-2xl text-cream">Grade 1+</span>
            <span>English Willow</span>
          </div>
          <div className="w-px h-10 bg-cream/10" aria-hidden />
          <div className="flex flex-col items-center gap-1">
            <span className="font-display text-2xl text-cream">3–5 days</span>
            <span>Pan-India delivery</span>
          </div>
          <div className="w-px h-10 bg-cream/10" aria-hidden />
          <div className="flex flex-col items-center gap-1">
            <span className="font-display text-2xl text-cream">Made in</span>
            <span>India</span>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div
        aria-hidden
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-cream/30 text-xs tracking-[0.3em] uppercase"
      >
        Scroll
      </div>
    </section>
  )
}

export default Hero
