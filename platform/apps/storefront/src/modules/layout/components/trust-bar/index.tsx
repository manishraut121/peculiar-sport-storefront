/* Slim site-wide reassurance strip below the nav. Server-rendered (SEO-safe),
 * adapts to light/dark surface. */
const ITEMS = [
  { t: "Free shipping over ₹2,999", d: "M3 7h11v8H3zM14 10h4l3 3v2h-7z" },
  { t: "Handcrafted in India", d: "M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" },
  { t: "Secure UPI · card · net-banking", d: "M4 7h16v10H4z M4 10h16" },
  { t: "Easy 7-day returns", d: "M3 12a9 9 0 0 1 15-6.7L21 8 M21 3v5h-5" },
]

export default function TrustBar() {
  return (
    <div className="border-b border-ui-border-base bg-ui-bg-subtle">
      <div className="content-container overflow-x-auto no-scrollbar">
        <ul className="flex items-center justify-between gap-6 h-10 min-w-max small:min-w-0 text-[12px] text-ui-fg-subtle">
          {ITEMS.map((i) => (
            <li key={i.t} className="flex items-center gap-2 whitespace-nowrap">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-gold shrink-0" aria-hidden>
                <path d={i.d} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {i.t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
