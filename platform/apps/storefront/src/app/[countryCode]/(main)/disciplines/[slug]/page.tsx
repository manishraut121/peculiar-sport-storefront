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
    <div className="bg-paper min-h-[70dvh] w-full overflow-x-clip">
      <section className="border-b border-line">
        <div className="content-container py-12 small:py-24">
          <div className="mx-auto w-full max-w-3xl text-center">
            <p className="text-signal text-xs font-bold uppercase tracking-[0.22em] m-0">
              {page.eyebrow}
            </p>
            <h1 className="font-display font-extrabold text-[1.75rem] leading-[1.1] xsmall:text-4xl small:text-6xl text-ink tracking-tight mt-4 m-0">
              {page.headline}
            </h1>
            <p className="text-fog text-base small:text-xl mt-4 small:mt-5 m-0 leading-relaxed font-medium">
              {page.lede}
            </p>
            <div className="mt-6 small:mt-8 inline-flex items-center gap-2 rounded-full bg-mute border border-line px-4 small:px-5 py-2.5 max-w-full">
              <span
                className="w-2 h-2 rounded-full bg-signal animate-pulse shrink-0"
                aria-hidden
              />
              <span className="text-xs small:text-sm font-bold text-ink uppercase tracking-wide text-left">
                {page.comingSoonLabel}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section
        className="content-container py-12 small:py-20"
        aria-labelledby="advice-h"
      >
        <h2
          id="advice-h"
          className="font-display font-extrabold text-xl small:text-3xl text-ink tracking-tight m-0 mb-8 small:mb-10 text-center"
        >
          Practical advice
        </h2>
        <ul className="grid grid-cols-1 small:grid-cols-3 gap-3 small:gap-5 list-none m-0 p-0 max-w-5xl mx-auto">
          {page.advice.map((a) => (
            <li
              key={a.title}
              className="rounded-2xl small:rounded-3xl bg-white border border-line p-5 small:p-8 min-w-0"
            >
              <h3 className="font-display font-bold text-lg small:text-xl text-ink m-0">
                {a.title}
              </h3>
              <p className="text-fog text-sm small:text-base leading-relaxed mt-3 m-0 font-medium">
                {a.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-mute border-y border-line">
        <div className="content-container py-12 small:py-16">
          <div className="mx-auto w-full max-w-3xl">
            <h2 className="font-display font-extrabold text-xl small:text-2xl text-ink m-0 mb-5 small:mb-6 text-center">
              Quick tips
            </h2>
            <ul className="flex flex-col gap-2.5 small:gap-3 list-none m-0 p-0">
              {page.tips.map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-3 rounded-2xl bg-white border border-line px-4 small:px-5 py-3.5 small:py-4 text-ink font-medium text-sm small:text-base"
                >
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full bg-signal shrink-0"
                    aria-hidden
                  />
                  <span className="min-w-0">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="content-container py-12 small:py-24">
        <div className="mx-auto w-full max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-signal m-0">
            {page.name} gear
          </p>
          <h2 className="font-display font-extrabold text-2xl small:text-4xl text-ink mt-3 m-0">
            {page.comingSoonLabel}
          </h2>
          <p className="text-fog mt-4 m-0 font-medium leading-relaxed text-sm small:text-base">
            When {page.name.toLowerCase()} products launch, they will appear here
            and in the main store — managed from the same CMS inventory.
          </p>
          <div className="flex flex-col xsmall:flex-row gap-3 justify-center items-stretch xsmall:items-center mt-8">
            <LocalizedClientLink
              href={page.ctaShopHref}
              className="oc-btn oc-btn-primary w-full xsmall:w-auto"
            >
              {page.ctaShopLabel}
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/"
              className="oc-btn oc-btn-dark w-full xsmall:w-auto"
            >
              Back to home
            </LocalizedClientLink>
          </div>
        </div>
      </section>
    </div>
  )
}
