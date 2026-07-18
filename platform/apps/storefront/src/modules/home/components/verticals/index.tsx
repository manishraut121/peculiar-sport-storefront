import { VERTICALS } from "@lib/brand/verticals"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Reveal from "@modules/common/components/reveal"

/**
 * Multi-sport gateway — SSR, no nested links (valid HTML + sticky SEO).
 */
export default function Verticals() {
  return (
    <section
      className="content-container py-16 small:py-24"
      aria-labelledby="verticals-h"
    >
      <header className="mb-10 max-w-2xl">
        <p className="text-boundary text-[11px] uppercase tracking-[0.28em] font-medium m-0">
          Shop by discipline
        </p>
        <h2
          id="verticals-h"
          className="font-display font-bold text-4xl small:text-5xl text-ui-fg-base mt-2 m-0 tracking-tight uppercase"
        >
          One house. Every curve of performance.
        </h2>
        <p className="text-ui-fg-muted text-sm small:text-base mt-3 m-0 leading-relaxed">
          Cricket is live today. Training, nutrition and recovery join the same
          inventory as we expand — one cart, one trusted stock, pan-India
          delivery.
        </p>
      </header>

      <ul className="grid grid-cols-1 small:grid-cols-2 gap-4 list-none m-0 p-0">
        {VERTICALS.map((v, i) => {
          const live = v.status === "live" && v.href

          return (
            <Reveal as="li" key={v.id} delay={i * 50}>
              <div
                className={
                  "relative flex flex-col justify-between min-h-[12rem] rounded-xl border p-6 small:p-7 " +
                  (live
                    ? "bg-pitch-elevated border-ui-border-base"
                    : "bg-pitch-elevated/70 border-ui-border-base/80")
                }
                data-testid={
                  live ? `vertical-${v.id}` : `vertical-${v.id}-soon`
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display font-bold text-2xl small:text-3xl uppercase tracking-tight text-ui-fg-base m-0">
                    {v.name}
                  </h3>
                  <span
                    className={
                      "text-[10px] uppercase tracking-[0.16em] font-semibold px-2.5 py-1 rounded-full border shrink-0 " +
                      (live
                        ? "text-pitch bg-boundary border-boundary"
                        : "text-willow/50 border-willow/20")
                    }
                  >
                    {live ? "Live" : "Soon"}
                  </span>
                </div>
                <p className="text-ui-fg-muted text-sm leading-relaxed m-0 mt-3 max-w-md">
                  {v.blurb}
                </p>

                {live && (
                  <div className="mt-5 flex flex-col gap-3">
                    {v.links && v.links.length > 0 && (
                      <ul className="flex flex-wrap gap-2 list-none m-0 p-0">
                        {v.links.map((l) => (
                          <li key={l.href}>
                            <LocalizedClientLink
                              href={l.href}
                              className="inline-flex items-center min-h-[40px] px-3 rounded-full border border-willow/15 text-willow/80 text-xs font-medium uppercase tracking-wide hover:border-boundary hover:text-boundary transition-colors"
                            >
                              {l.label}
                            </LocalizedClientLink>
                          </li>
                        ))}
                      </ul>
                    )}
                    <LocalizedClientLink
                      href={v.href!}
                      className="oc-btn oc-btn-primary self-start text-sm"
                    >
                      Shop cricket
                    </LocalizedClientLink>
                  </div>
                )}

                {!live && (
                  <p className="mt-5 text-xs uppercase tracking-[0.14em] text-willow/40 m-0">
                    Same checkout · same warehouse · launching next
                  </p>
                )}
              </div>
            </Reveal>
          )
        })}
      </ul>
    </section>
  )
}
