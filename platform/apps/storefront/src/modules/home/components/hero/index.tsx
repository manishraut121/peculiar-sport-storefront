import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <section className="relative w-full min-h-[88vh] flex items-center justify-center overflow-hidden bg-ink">
      {/* soft gold glow behind the headline */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 38%, rgba(201,168,76,0.14), transparent 70%)",
        }}
      />
      <div className="relative z-10 flex flex-col items-center text-center px-6 gap-8 max-w-4xl mx-auto">
        <span className="text-gold tracking-[0.35em] text-xs uppercase font-medium">
          Handcrafted in India
        </span>
        <h1 className="font-display text-cream leading-[0.95] text-6xl small:text-8xl">
          The perfect curve.
          <br />
          <span className="text-gold">Engineered for runs.</span>
        </h1>
        <p className="text-cream-muted text-base small:text-lg max-w-xl leading-relaxed">
          Premium English Willow cricket bats, pads and gloves — hand-picked,
          hand-pressed and play-ready. From our workshop to your crease.
        </p>
        <div className="flex flex-col small:flex-row items-center gap-4 mt-2">
          <LocalizedClientLink
            href="/store"
            data-testid="hero-shop-link"
            className="px-10 py-4 rounded-full bg-gold text-ink font-medium text-base hover:bg-gold-hover transition-colors"
          >
            Shop the range
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/categories/bats"
            data-testid="hero-bats-link"
            className="px-10 py-4 rounded-full border border-cream/20 text-cream font-medium text-base hover:border-gold hover:text-gold transition-colors"
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
    </section>
  )
}

export default Hero
