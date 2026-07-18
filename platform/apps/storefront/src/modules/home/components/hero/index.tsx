import { BRAND } from "@lib/brand/verticals"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * Platform hero — multi-sport ready, cricket as flagship proof.
 * All copy SSR for sticky SEO.
 */
const Hero = () => {
  return (
    <section
      className="relative w-full min-h-[min(92vh,880px)] flex items-center overflow-hidden bg-pitch oc-pitch-lines"
      aria-labelledby="hero-heading"
    >
      <div className="oc-aurora" aria-hidden />

      <div className="relative z-10 content-container w-full py-28 small:py-36">
        <div className="max-w-3xl flex flex-col items-start text-left gap-6 small:gap-8">
          <p className="oc-glass rounded-full px-4 py-2 text-boundary tracking-[0.2em] text-[11px] uppercase font-medium min-h-[40px] inline-flex items-center">
            {BRAND.name} · Performance equipment · India
          </p>

          <h1
            id="hero-heading"
            className="font-display font-bold text-willow leading-[0.92] text-5xl small:text-7xl medium:text-[5.25rem] m-0 uppercase tracking-tight"
          >
            {BRAND.tagline.replace(/\.$/, "")}
            <span className="text-boundary">.</span>
            <br />
            <span className="oc-shimmer text-[0.85em] normal-case tracking-normal">
              Gear for every discipline
            </span>
          </h1>

          <p className="text-willow/70 text-base small:text-lg max-w-xl leading-relaxed m-0 font-normal normal-case tracking-normal">
            Start with handcrafted cricket — English Willow bats, pads and
            gloves. Expanding into training, gym and nutrition on the{" "}
            <strong className="text-willow font-medium">same inventory</strong>,
            one cart, free shipping over ₹2,999.
          </p>

          <div className="flex flex-col xsmall:flex-row gap-3 w-full xsmall:w-auto pt-1">
            <LocalizedClientLink
              href="/store"
              data-testid="hero-shop-link"
              className="oc-btn oc-btn-primary"
            >
              Shop cricket gear
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/categories/bats"
              data-testid="hero-bats-link"
              className="oc-btn oc-btn-ghost"
            >
              Browse bats
            </LocalizedClientLink>
          </div>

          <dl className="grid grid-cols-3 gap-4 small:gap-10 pt-8 border-t border-willow/10 w-full max-w-xl">
            {[
              { k: "Live now", v: "Cricket" },
              { k: "Next", v: "Gym · Fuel" },
              { k: "Ship", v: "3–5 days" },
            ].map((s) => (
              <div key={s.k} className="flex flex-col gap-1">
                <dt className="text-[10px] uppercase tracking-[0.2em] text-willow/45 m-0">
                  {s.k}
                </dt>
                <dd className="font-display font-semibold text-xl small:text-2xl text-willow m-0 tracking-tight">
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
