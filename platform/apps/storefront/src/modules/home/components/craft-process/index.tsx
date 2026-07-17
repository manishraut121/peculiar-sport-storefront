import Reveal from "@modules/common/components/reveal"

/* The workshop process — storytelling section that differentiates a
 * handcrafted brand from marketplace resellers. */

const STEPS = [
  {
    n: "01",
    title: "Pick",
    desc: "Every cleft of English Willow is hand-graded — grains counted, blemishes culled. Only the honest wood goes forward.",
  },
  {
    n: "02",
    title: "Press",
    desc: "Pressed for the perfect rebound: firm enough to last seasons, lively enough to ping from day one.",
  },
  {
    n: "03",
    title: "Balance",
    desc: "Profile, spine and edges are shaped until the pickup feels lighter than the scale says.",
  },
  {
    n: "04",
    title: "Play",
    desc: "Knocked, checked and shipped play-ready to your crease — anywhere in India in 3–5 days.",
  },
]

export default function CraftProcess() {
  return (
    <section className="border-t border-ui-border-base">
      <div className="content-container py-20 small:py-28">
        <div className="mb-12">
          <span className="text-gold tracking-[0.3em] text-xs uppercase font-medium">
            From our workshop
          </span>
          <h2 className="font-display text-4xl small:text-6xl text-ui-fg-base mt-2">
            How a OneCurve bat is made
          </h2>
        </div>
        <ol className="grid grid-cols-1 small:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 90}>
              <div className="oc-lift relative h-full rounded-2xl border border-ui-border-base bg-ui-bg-subtle p-7 overflow-hidden">
                <span
                  aria-hidden
                  className="absolute -top-4 -right-2 font-display text-[6rem] leading-none text-gold/10 select-none"
                >
                  {s.n}
                </span>
                <span className="font-display text-3xl text-gold">
                  {s.title}
                </span>
                <p className="relative text-ui-fg-muted text-sm leading-relaxed mt-3">
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
