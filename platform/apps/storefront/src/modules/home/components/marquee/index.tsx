/* Infinite brand marquee — modern e-commerce element. Pure CSS animation
 * (pauses on hover, disabled under prefers-reduced-motion). The content is
 * duplicated once for the seamless loop; the clone is aria-hidden. */

const ITEMS = [
  "Grade 1+ English Willow",
  "Hand-pressed · Hand-balanced",
  "Free shipping over ₹2,999",
  "Made in India",
  "3–5 day pan-India delivery",
  "Secure UPI · Cards · Net-banking",
]

function Row({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul
      aria-hidden={hidden || undefined}
      className="flex items-center shrink-0"
    >
      {ITEMS.map((t) => (
        <li
          key={t}
          className="flex items-center gap-6 px-6 whitespace-nowrap font-display text-2xl small:text-3xl tracking-wide text-cream/70"
        >
          {t}
          <span className="text-gold text-xl" aria-hidden>
            ✦
          </span>
        </li>
      ))}
    </ul>
  )
}

export default function Marquee() {
  return (
    <div className="border-y border-ui-border-base bg-ink-surface overflow-hidden py-5">
      <div className="oc-marquee">
        <Row />
        <Row hidden />
      </div>
    </div>
  )
}
