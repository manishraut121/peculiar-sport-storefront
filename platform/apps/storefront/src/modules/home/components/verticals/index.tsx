import { VERTICALS } from "@lib/brand/verticals"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Reveal from "@modules/common/components/reveal"

export default function Verticals() {
  return (
    <section
      className="content-container py-16 small:py-24"
      aria-labelledby="verticals-h"
    >
      <header className="mb-12 max-w-2xl">
        <p className="text-signal text-xs font-bold uppercase tracking-[0.2em] m-0">
          Disciplines
        </p>
        <h2
          id="verticals-h"
          className="font-display font-extrabold text-3xl small:text-5xl text-ink mt-2 m-0 tracking-tight"
        >
          Built to grow with you.
        </h2>
        <p className="text-fog text-base small:text-lg mt-4 m-0 leading-relaxed font-medium">
          Start with cricket. Add training and nutrition without leaving the
          store — one cart, one warehouse story.
        </p>
      </header>

      <ul className="grid grid-cols-1 small:grid-cols-2 gap-4 list-none m-0 p-0">
        {VERTICALS.map((v, i) => {
          const live = v.status === "live" && v.href
          return (
            <Reveal as="li" key={v.id} delay={i * 70}>
              <div
                className={
                  "relative flex flex-col justify-between min-h-[13rem] rounded-3xl border p-7 small:p-8 " +
                  (live
                    ? "bg-ink text-white border-ink"
                    : "bg-mute text-ink border-line")
                }
                data-testid={
                  live ? `vertical-${v.id}` : `vertical-${v.id}-soon`
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display font-extrabold text-2xl small:text-3xl m-0 tracking-tight">
                    {v.name}
                  </h3>
                  <span
                    className={
                      "text-[10px] uppercase tracking-[0.16em] font-bold px-3 py-1.5 rounded-full shrink-0 " +
                      (live
                        ? "bg-signal text-white"
                        : "bg-white text-fog border border-line")
                    }
                  >
                    {live ? "Live" : "Soon"}
                  </span>
                </div>
                <p
                  className={
                    "text-sm small:text-base leading-relaxed m-0 mt-3 max-w-sm font-medium " +
                    (live ? "text-white/65" : "text-fog")
                  }
                >
                  {v.blurb}
                </p>

                {live && (
                  <div className="mt-6 flex flex-col gap-4">
                    {v.links && (
                      <ul className="flex flex-wrap gap-2 list-none m-0 p-0">
                        {v.links.map((l) => (
                          <li key={l.href}>
                            <LocalizedClientLink
                              href={l.href}
                              className="inline-flex items-center min-h-[40px] px-3.5 rounded-full border border-white/20 text-white/80 text-xs font-bold uppercase tracking-wide hover:border-signal hover:text-signal transition-colors"
                            >
                              {l.label}
                            </LocalizedClientLink>
                          </li>
                        ))}
                      </ul>
                    )}
                    <LocalizedClientLink
                      href={v.href!}
                      className="oc-btn oc-btn-primary self-start !min-h-[48px] !text-sm"
                    >
                      Shop cricket
                    </LocalizedClientLink>
                  </div>
                )}
              </div>
            </Reveal>
          )
        })}
      </ul>
    </section>
  )
}
