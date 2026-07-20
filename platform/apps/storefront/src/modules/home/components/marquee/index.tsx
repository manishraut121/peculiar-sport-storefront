const ITEMS = [
  "Free shipping ₹2,999+",
  "Cricket live now",
  "UPI · Cards · Net-banking",
  "3–5 day delivery",
  "7-day returns",
  "One inventory",
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
          className="flex items-center gap-5 px-6 whitespace-nowrap font-display font-bold text-lg small:text-xl tracking-tight text-white/80"
        >
          {t}
          <span
            className="block w-2 h-2 rounded-full bg-signal shrink-0"
            aria-hidden
          />
        </li>
      ))}
    </ul>
  )
}

export default function Marquee() {
  return (
    <div className="bg-ink border-y border-white/10 overflow-hidden py-4">
      <div className="oc-marquee">
        <Row />
        <Row hidden />
      </div>
    </div>
  )
}
