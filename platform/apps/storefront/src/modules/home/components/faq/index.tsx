import { jsonLd as toJsonLd } from "@lib/util/json-ld"

const FAQS: { q: string; a: string }[] = [
  {
    q: "How long does delivery take?",
    a: "Pan-India in 3–5 business days. Free shipping on orders of ₹2,999+; ₹199 below that.",
  },
  {
    q: "What payment methods do you accept?",
    a: "UPI, credit/debit cards, and net-banking via Razorpay. Prices include applicable taxes.",
  },
  {
    q: "Do I need to knock in a new bat?",
    a: "Yes for English Willow — knock in gently over a couple of weeks before match use.",
  },
  {
    q: "What is your return policy?",
    a: "Unused items in original packaging within 7 days. Email support@onecurve.in with your order ID.",
  },
  {
    q: "Will you sell gym gear and supplements?",
    a: "Yes. OneCurve is multi-discipline — cricket is live first; training and nutrition launch on the same site and cart.",
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
    <section className="border-t border-white/10" aria-labelledby="faq-h">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }}
      />
      <div className="content-container py-16 small:py-24 max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <p className="text-signal text-xs font-bold uppercase tracking-[0.2em] m-0">
            FAQ
          </p>
          <h2
            id="faq-h"
            className="font-display font-extrabold text-3xl small:text-4xl text-white mt-2 m-0"
          >
            Good questions.
          </h2>
        </header>
        <ul className="flex flex-col divide-y divide-white/10 border-y border-white/10 list-none m-0 p-0">
          {FAQS.map((f) => (
            <li key={f.q}>
              <details className="group py-5">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-white font-semibold min-h-[48px]">
                  <span>{f.q}</span>
                  <span
                    className="text-signal text-2xl leading-none transition-transform duration-200 group-open:rotate-45 shrink-0"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <p className="text-white/55 leading-relaxed mt-3 pr-8 m-0 text-sm small:text-base font-medium">
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
