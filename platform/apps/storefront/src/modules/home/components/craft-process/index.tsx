import Reveal from "@modules/common/components/reveal"

const STEPS = [
  {
    n: "01",
    title: "Pick",
    desc: "Every cleft of English Willow is hand-graded — grains counted, blemishes culled. Only honest wood goes forward.",
  },
  {
    n: "02",
    title: "Press",
    desc: "Pressed for rebound: firm enough to last seasons, lively enough to ping from day one.",
  },
  {
    n: "03",
    title: "Balance",
    desc: "Profile, spine and edges shaped until the pickup feels lighter than the scale.",
  },
  {
    n: "04",
    title: "Play",
    desc: "Checked and shipped play-ready — anywhere in India in 3–5 business days.",
  },
]

export default function CraftProcess() {
  return (
    <section
      className="border-t border-ui-border-base"
      aria-labelledby="craft-h"
    >
      <div className="content-container py-16 small:py-24">
        <header className="mb-12">
          <p className="text-boundary text-[11px] uppercase tracking-[0.28em] font-medium m-0">
            Workshop
          </p>
          <h2
            id="craft-h"
            className="font-display font-bold text-4xl small:text-5xl text-ui-fg-base mt-2 m-0 tracking-tight uppercase"
          >
            How a OneCurve bat is made
          </h2>
        </header>
        <ol className="grid grid-cols-1 small:grid-cols-4 gap-4 list-none m-0 p-0">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 70}>
              <div className="oc-lift relative h-full rounded-xl border border-ui-border-base bg-pitch-elevated p-6 small:p-7 overflow-hidden">
                <span
                  aria-hidden
                  className="absolute -top-2 -right-1 font-display font-bold text-[5rem] leading-none text-boundary/10 select-none"
                >
                  {s.n}
                </span>
                <h3 className="font-display font-bold text-2xl text-boundary uppercase tracking-tight m-0">
                  {s.title}
                </h3>
                <p className="relative text-ui-fg-muted text-sm leading-relaxed mt-3 m-0">
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
