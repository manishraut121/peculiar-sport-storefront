const ITEMS = [
  "Grade 1+ English Willow",
  "Hand-pressed · Hand-balanced",
  "Free shipping over ₹2,999",
  "Made in India",
  "3–5 day pan-India delivery",
  "UPI · Cards · Net-banking",
]

function Row({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul
      aria-hidden={hidden || undefined}
      className="flex items-center shrink-0 list-none m-0 p-0"
    >
      {ITEMS.map((t) => (
        <li
          key={t}
          className="flex items-center gap-6 px-6 whitespace-nowrap font-display font-semibold text-xl small:text-2xl tracking-tight uppercase text-willow/65"
        >
          {t}
          <span
            className="block w-1.5 h-1.5 rounded-full bg-boundary shrink-0"
            aria-hidden
          />
        </li>
      ))}
    </ul>
  )
}

export default function Marquee() {
  return (
    <div className="border-y border-ui-border-base bg-pitch-elevated overflow-hidden py-5">
      <div className="oc-marquee">
        <Row />
        <Row hidden />
      </div>
    </div>
  )
}
