import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * Night Pitch hero — full SSR for sticky SEO.
 * Brand: precision cricket, Made in India, boundary-gold CTAs.
 */
const Hero = () => {
  return (
    <section
      className="relative w-full min-h-[min(94vh,900px)] flex items-center overflow-hidden bg-pitch oc-pitch-lines"
      aria-labelledby="hero-heading"
    >
      <div className="oc-aurora" aria-hidden />

      <div className="relative z-10 content-container w-full py-28 small:py-36">
        <div className="max-w-3xl flex flex-col items-start text-left gap-7 small:gap-8">
          <p className="oc-glass rounded-full px-4 py-2 text-boundary tracking-[0.22em] text-[11px] uppercase font-medium min-h-[40px] inline-flex items-center">
            OneCurve Sports · Handcrafted in India
          </p>

          <h1
            id="hero-heading"
            className="font-display font-bold text-willow leading-[0.92] text-5xl small:text-7xl medium:text-[5.5rem] m-0 uppercase tracking-tight"
          >
            The perfect
            <br />
            <span className="oc-shimmer">curve</span>
            <span className="text-willow">.</span>
          </h1>

          <p className="text-willow/70 text-base small:text-lg max-w-lg leading-relaxed m-0 font-normal normal-case tracking-normal">
            English Willow cricket bats, pads and gloves — graded, pressed and
            balanced in our workshop. Match-ready gear, free shipping over
            ₹2,999, delivered pan-India in 3–5 days.
          </p>

          <div className="flex flex-col xsmall:flex-row gap-3 w-full xsmall:w-auto pt-1">
            <LocalizedClientLink
              href="/store"
              data-testid="hero-shop-link"
              className="oc-btn oc-btn-primary"
            >
              Shop the range
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/categories/bats"
              data-testid="hero-bats-link"
              className="oc-btn oc-btn-ghost"
            >
              Explore bats
            </LocalizedClientLink>
          </div>

          <dl className="grid grid-cols-3 gap-6 small:gap-12 pt-8 border-t border-willow/10 w-full max-w-xl">
            {[
              { k: "Willow", v: "Grade 1+" },
              { k: "Delivery", v: "3–5 days" },
              { k: "Origin", v: "India" },
            ].map((s) => (
              <div key={s.k} className="flex flex-col gap-1">
                <dt className="text-[10px] uppercase tracking-[0.2em] text-willow/45 m-0">
                  {s.k}
                </dt>
                <dd className="font-display font-semibold text-2xl small:text-3xl text-willow m-0 tracking-tight">
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
