import { SITE_FAQS } from "@lib/brand/seo-copy"
import { jsonLd as toJsonLd } from "@lib/util/json-ld"

export default function Faq() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SITE_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }

  return (
    <section className="border-t border-white/10" aria-labelledby="faq-h">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(schema) }}
      />
      <div className="content-container py-12 small:py-24">
        <div className="mx-auto w-full max-w-3xl">
          <header className="text-center mb-8 small:mb-10">
            <p className="text-signal text-xs font-bold uppercase tracking-[0.2em] m-0">
              FAQ
            </p>
            <h2
              id="faq-h"
              className="font-display font-extrabold text-2xl small:text-4xl text-white mt-2 m-0"
            >
              Cricket gear &amp; delivery FAQs
            </h2>
            <p className="text-white/50 text-sm small:text-base mt-3 m-0 font-medium max-w-lg mx-auto">
              Common questions about buying cricket equipment online in India,
              shipping, knocking in bats, and returns.
            </p>
          </header>
          <ul className="flex flex-col divide-y divide-white/10 border-y border-white/10 list-none m-0 p-0">
            {SITE_FAQS.map((f) => (
              <li key={f.q}>
                <details className="group py-4 small:py-5">
                  <summary className="flex items-center justify-between gap-3 small:gap-4 cursor-pointer list-none text-white font-semibold min-h-11 text-sm small:text-base">
                    <h3 className="text-left min-w-0 m-0 text-inherit font-semibold text-sm small:text-base">
                      {f.q}
                    </h3>
                    <span
                      className="text-signal text-2xl leading-none transition-transform duration-200 group-open:rotate-45 shrink-0"
                      aria-hidden
                    >
                      +
                    </span>
                  </summary>
                  <p className="text-white/55 leading-relaxed mt-3 pr-6 small:pr-8 m-0 text-sm small:text-base font-medium">
                    {f.a}
                  </p>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
