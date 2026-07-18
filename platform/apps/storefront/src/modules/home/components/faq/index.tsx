import { jsonLd as toJsonLd } from "@lib/util/json-ld"

const FAQS: { q: string; a: string }[] = [
  {
    q: "How long does delivery take?",
    a: "We deliver across India in 3–5 business days. Shipping is free on orders of ₹2,999 or more, and ₹199 below that.",
  },
  {
    q: "What payment methods do you accept?",
    a: "UPI, credit and debit cards, and net-banking via Razorpay. Prices are inclusive of applicable taxes.",
  },
  {
    q: "Do I need to knock in a new bat?",
    a: "Yes. Knock in English Willow before match use to compress the fibres. Start gently on the face and edges over a couple of weeks.",
  },
  {
    q: "What is your return policy?",
    a: "Unused items in original packaging can be returned within 7 days of delivery. Email support@onecurve.in with your order ID.",
  },
  {
    q: "Are OneCurve products handcrafted in India?",
    a: "Our cricket line is graded and pressed in our workshop in India. As we add training and nutrition, we keep the same standard: honest specs, clear origin, one inventory.",
  },
  {
    q: "Will you sell gym gear and supplements too?",
    a: "Yes — OneCurve is built as a multi-discipline performance store. Cricket is live first; training, gym and nutrition launch on the same site and cart.",
  },
]

export default function Faq() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }

  return (
    <section
      className="border-t border-ui-border-base"
      aria-labelledby="faq-h"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }}
      />
      <div className="content-container py-16 small:py-24 max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <p className="text-boundary text-[11px] uppercase tracking-[0.28em] font-medium m-0">
            Support
          </p>
          <h2
            id="faq-h"
            className="font-display font-bold text-4xl small:text-5xl text-ui-fg-base mt-2 m-0 tracking-tight uppercase"
          >
            Frequently asked
          </h2>
        </header>
        <ul className="flex flex-col divide-y divide-ui-border-base border-y border-ui-border-base list-none m-0 p-0">
          {FAQS.map((f) => (
            <li key={f.q}>
              <details className="group py-5">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-ui-fg-base font-medium min-h-[44px]">
                  <span>{f.q}</span>
                  <span
                    className="text-boundary text-2xl leading-none transition-transform group-open:rotate-45 shrink-0"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <p className="text-ui-fg-subtle leading-relaxed mt-3 pr-8 m-0 text-sm small:text-base">
                  {f.a}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
