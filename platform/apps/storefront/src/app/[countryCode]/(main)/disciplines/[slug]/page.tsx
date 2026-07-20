import { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  DISCIPLINE_SLUGS,
  getDiscipline,
  type DisciplineSlug,
} from "@lib/brand/disciplines"
import { getBaseURL } from "@lib/util/env"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Props = {
  params: Promise<{ countryCode: string; slug: string }>
}

export async function generateStaticParams() {
  return DISCIPLINE_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug, countryCode } = await props.params
  const page = getDiscipline(slug)
  if (!page) return {}
  const canonical = `${getBaseURL()}/${countryCode}/disciplines/${slug}`
  return {
    title: { absolute: page.seoTitle },
    description: page.seoDesc,
    alternates: { canonical },
    openGraph: {
      title: page.seoTitle,
      description: page.seoDesc,
      url: canonical,
      locale: "en_IN",
    },
    robots: { index: true, follow: true },
  }
}

export default async function DisciplinePage(props: Props) {
  const { slug } = await props.params
  const page = getDiscipline(slug)
  if (!page) notFound()

  return (
    <div className="bg-paper min-h-[70vh]">
      {/* Apple-style centered hero band */}
      <section className="border-b border-line">
        <div className="content-container py-16 small:py-24 max-w-3xl mx-auto text-center">
          <p className="text-signal text-xs font-bold uppercase tracking-[0.22em] m-0">
            {page.eyebrow}
          </p>
          <h1 className="font-display font-extrabold text-4xl small:text-6xl text-ink tracking-tight mt-4 m-0 leading-[1.05]">
            {page.headline}
          </h1>
          <p className="text-fog text-lg small:text-xl mt-5 m-0 leading-relaxed font-medium">
            {page.lede}
          </p>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-mute border border-line px-5 py-2.5">
            <span
              className="w-2 h-2 rounded-full bg-signal animate-pulse"
              aria-hidden
            />
            <span className="text-sm font-bold text-ink uppercase tracking-wide">
              {page.comingSoonLabel}
            </span>
          </div>
        </div>
      </section>

      {/* Advice */}
      <section
        className="content-container py-14 small:py-20"
        aria-labelledby="advice-h"
      >
        <h2
          id="advice-h"
          className="font-display font-extrabold text-2xl small:text-3xl text-ink tracking-tight m-0 mb-10 text-center"
        >
          Practical advice
        </h2>
        <ul className="grid grid-cols-1 small:grid-cols-3 gap-5 list-none m-0 p-0 max-w-5xl mx-auto">
          {page.advice.map((a) => (
            <li
              key={a.title}
              className="rounded-3xl bg-white border border-line p-7 small:p-8"
            >
              <h3 className="font-display font-bold text-xl text-ink m-0">
                {a.title}
              </h3>
              <p className="text-fog text-sm small:text-base leading-relaxed mt-3 m-0 font-medium">
                {a.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Tips strip */}
      <section className="bg-mute border-y border-line">
        <div className="content-container py-14 small:py-16 max-w-3xl mx-auto">
          <h2 className="font-display font-extrabold text-2xl text-ink m-0 mb-6 text-center">
            Quick tips
          </h2>
          <ul className="flex flex-col gap-3 list-none m-0 p-0">
            {page.tips.map((t) => (
              <li
                key={t}
                className="flex items-start gap-3 rounded-2xl bg-white border border-line px-5 py-4 text-ink font-medium text-sm small:text-base"
              >
                <span
                  className="mt-1.5 w-1.5 h-1.5 rounded-full bg-signal shrink-0"
                  aria-hidden
                />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Coming soon + CTA */}
      <section className="content-container py-16 small:py-24 text-center max-w-2xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-signal m-0">
          {page.name} gear
        </p>
        <h2 className="font-display font-extrabold text-3xl small:text-4xl text-ink mt-3 m-0">
          {page.comingSoonLabel}
        </h2>
        <p className="text-fog mt-4 m-0 font-medium leading-relaxed">
          When {page.name.toLowerCase()} products launch, they will appear here
          and in the main store — managed from the same CMS inventory.
        </p>
        <div className="flex flex-col xsmall:flex-row gap-3 justify-center mt-8">
          <LocalizedClientLink
            href={page.ctaShopHref}
            className="oc-btn oc-btn-primary"
          >
            {page.ctaShopLabel}
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="oc-btn oc-btn-dark"
          >
            Back to home
          </LocalizedClientLink>
        </div>
      </section>
    </div>
  )
}
