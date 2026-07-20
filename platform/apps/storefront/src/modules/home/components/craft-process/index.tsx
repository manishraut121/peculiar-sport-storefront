import Reveal from "@modules/common/components/reveal"

const STEPS = [
  {
    n: "01",
    title: "Spec",
    desc: "Clear grades and honest materials — no vague “pro quality” claims.",
  },
  {
    n: "02",
    title: "Select",
    desc: "Curated lines starting with cricket; gym and fuel on the same rails.",
  },
  {
    n: "03",
    title: "Ship",
    desc: "Pan-India fulfilment in 3–5 days. Free shipping from ₹2,999.",
  },
  {
    n: "04",
    title: "Support",
    desc: "7-day returns on unused gear. Real humans at support@onecurve.in.",
  },
]

export default function CraftProcess() {
  return (
    <section
      className="border-t border-white/10"
      aria-labelledby="craft-h"
    >
      <div className="content-container py-16 small:py-24">
        <header className="mb-12 max-w-xl">
          <p className="text-signal text-xs font-bold uppercase tracking-[0.2em] m-0">
            How we work
          </p>
          <h2
            id="craft-h"
            className="font-display font-extrabold text-3xl small:text-5xl text-white mt-2 m-0 tracking-tight"
          >
            From pick to crease.
          </h2>
        </header>
        <ol className="grid grid-cols-1 small:grid-cols-4 gap-4 list-none m-0 p-0">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 80}>
              <div className="h-full rounded-3xl border border-white/10 bg-white/[0.03] p-6 small:p-7">
                <span className="font-display font-extrabold text-signal text-sm tracking-widest">
                  {s.n}
                </span>
                <h3 className="font-display font-bold text-xl text-white mt-3 m-0">
                  {s.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed mt-2 m-0 font-medium">
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
