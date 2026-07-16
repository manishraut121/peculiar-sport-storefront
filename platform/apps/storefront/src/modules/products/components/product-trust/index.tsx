import { HttpTypes } from "@medusajs/types"

/* PDP trust + reassurance block — conversion-focused (premium e-commerce
 * "feature-rich showcase" pattern). Delivery estimate, real low-stock urgency,
 * and the four trust pillars. */

const Truck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="17.5" cy="18" r="1.6" />
  </svg>
)
const Shield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9 12l2 2 4-4" strokeLinecap="round" />
  </svg>
)
const Medal = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <circle cx="12" cy="9" r="5" /><path d="M9 13l-2 8 5-3 5 3-2-8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const Rotate = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" strokeLinecap="round" /><path d="M21 3v5h-5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" strokeLinecap="round" /><path d="M3 21v-5h5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const PILLARS = [
  { icon: <Truck />, title: "Free shipping", sub: "on orders over ₹2,999" },
  { icon: <Shield />, title: "Secure checkout", sub: "UPI · cards · net-banking" },
  { icon: <Medal />, title: "Handcrafted in India", sub: "graded, pressed by hand" },
  { icon: <Rotate />, title: "7-day returns", sub: "unused, original packing" },
]

export default function ProductTrust({
  variant,
  product,
}: {
  variant?: HttpTypes.StoreProductVariant
  product: HttpTypes.StoreProduct
}) {
  const qty = (variant as any)?.inventory_quantity as number | undefined
  const threshold =
    Number((product.metadata as any)?.low_stock_threshold) || 3
  const lowStock =
    typeof qty === "number" && qty > 0 && qty <= Math.max(threshold, 5)

  return (
    <div className="flex flex-col gap-4">
      {/* Delivery + urgency */}
      <div className="flex flex-col gap-2 rounded-xl border border-ui-border-base bg-ui-bg-subtle p-4">
        <div className="flex items-center gap-2 text-sm text-ui-fg-base">
          <span className="text-gold"><Truck /></span>
          <span>
            <strong className="font-semibold">Get it in 3–5 days</strong> —
            delivered across India
          </span>
        </div>
        {lowStock && (
          <div className="flex items-center gap-2 text-sm font-medium text-gold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
            </span>
            Only {qty} left in stock — order soon
          </div>
        )}
      </div>

      {/* Trust pillars */}
      <ul className="grid grid-cols-2 gap-3">
        {PILLARS.map((p) => (
          <li
            key={p.title}
            className="flex items-start gap-2.5 rounded-lg border border-ui-border-base p-3"
          >
            <span className="text-gold mt-0.5 shrink-0">{p.icon}</span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-ui-fg-base leading-tight">
                {p.title}
              </span>
              <span className="block text-[11px] text-ui-fg-muted leading-tight mt-0.5">
                {p.sub}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
