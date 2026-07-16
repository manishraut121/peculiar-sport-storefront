/* FAQ — answers buying objections AND earns Google rich results via FAQPage
 * JSON-LD ("SEO sticky"). Native <details> = accessible, works without JS,
 * content always in the crawlable DOM. */

const FAQS: { q: string; a: string }[] = [
  {
    q: "How long does delivery take?",
    a: "We deliver across India in 3–5 business days. Shipping is free on orders of ₹2,999 or more, and ₹199 below that. You'll get a confirmation as soon as your order ships.",
  },
  {
    q: "What payment methods do you accept?",
    a: "UPI, credit and debit cards, and net-banking — all through Razorpay's secure checkout. Every price on the site is inclusive of taxes.",
  },
  {
    q: "Do I need to knock in a new bat?",
    a: "Yes. Every English Willow bat should be knocked in before match use to compress the fibres and prevent cracking. Start gently with a mallet on the face and edges over a couple of weeks — our blog has a full guide.",
  },
  {
    q: "What is your return policy?",
    a: "Unused items in their original packaging can be returned within 7 days of delivery. Just email support@onecurve.in with your order ID and we'll arrange it.",
  },
  {
    q: "Are OneCurve products really handcrafted in India?",
    a: "Yes. We grade every cleft of willow ourselves, press it for the perfect rebound and balance the pickup by hand in our own workshop — that's the curve in OneCurve.",
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
    <section className="border-t border-ui-border-base">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="content-container py-20 small:py-28 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-gold tracking-[0.3em] text-xs uppercase font-medium">
            Good to know
          </span>
          <h2 className="font-display text-4xl small:text-5xl text-ui-fg-base mt-2">
            Frequently asked
          </h2>
        </div>
        <ul className="flex flex-col divide-y divide-ui-border-base border-y border-ui-border-base">
          {FAQS.map((f) => (
            <li key={f.q}>
              <details className="group py-5">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-ui-fg-base font-medium">
                  <span>{f.q}</span>
                  <span className="text-gold text-xl leading-none transition-transform group-open:rotate-45 shrink-0">
                    +
                  </span>
                </summary>
                <p className="text-ui-fg-subtle leading-relaxed mt-3 pr-8">
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
