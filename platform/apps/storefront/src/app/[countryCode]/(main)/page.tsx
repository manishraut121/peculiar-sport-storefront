import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import Marquee from "@modules/home/components/marquee"
import CraftProcess from "@modules/home/components/craft-process"
import Faq from "@modules/home/components/faq"
import { listCategories } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getBaseURL } from "@lib/util/env"
import { jsonLd } from "@lib/util/json-ld"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"
import Reveal from "@modules/common/components/reveal"

const SITE_TITLE =
  "OneCurve Sports — Precision English Willow Cricket Bats | India"
const SITE_DESC =
  "Handcrafted English Willow cricket bats, pads and gloves. The perfect curve — Made in India. Free shipping over ₹2,999. Shop onecurve.in."

type Props = { params: Promise<{ countryCode: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { countryCode } = await props.params
  const canonical = `${getBaseURL()}/${countryCode}`
  return {
    title: { absolute: SITE_TITLE },
    description: SITE_DESC,
    alternates: { canonical },
    keywords: [
      "English Willow cricket bat",
      "OneCurve Sports",
      "handcrafted cricket equipment India",
      "buy cricket bat online",
    ],
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: canonical,
      title: SITE_TITLE,
      description: SITE_DESC,
      siteName: "OneCurve Sports",
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE,
      description: SITE_DESC,
    },
    robots: { index: true, follow: true },
  }
}

const CATEGORY_BLURBS: Record<string, string> = {
  bats: "Grade 1+ to Grade 4 English Willow — pressed for rebound.",
  pads: "Players edition to academy — light, locked-in protection.",
  gloves: "Sheep-leather palms, moulded finger protection.",
}

export default async function Home(props: Props) {
  const { countryCode } = await props.params
  const base = getBaseURL()

  const region = await getRegion(countryCode)
  if (!region) {
    return null
  }

  const [categories, { response }] = await Promise.all([
    listCategories().catch(() => []),
    listProducts({ countryCode, queryParams: { limit: 8 } }),
  ])
  const products = response.products
  const topCategories = (categories || []).filter(
    (c: any) => !c.parent_category
  )

  const itemList =
    products.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "OneCurve featured cricket equipment",
          numberOfItems: products.length,
          itemListElement: products.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${base}/${countryCode}/products/${p.handle}`,
            name: p.title,
          })),
        }
      : null

  return (
    <>
      {itemList && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(itemList) }}
        />
      )}

      {/* Dark immersive brand world */}
      <div className="oc-dark">
        <Hero />
        <Marquee />

        <section
          aria-label="Why OneCurve"
          className="border-y border-ui-border-base"
        >
          <ul className="content-container grid grid-cols-2 small:grid-cols-4 list-none m-0 p-0">
            {[
              { s: "Grade 1+", l: "English Willow, hand-graded" },
              { s: "Workshop", l: "Pressed & balanced in India" },
              { s: "₹2,999+", l: "Free pan-India shipping" },
              { s: "3–5 days", l: "Typical delivery window" },
            ].map((v, i) => (
              <li
                key={v.l}
                className={`flex flex-col gap-1 py-8 px-4 small:px-6 ${
                  i > 0 ? "border-l border-ui-border-base" : ""
                }`}
              >
                <span className="font-display font-bold text-2xl small:text-3xl text-boundary tracking-tight">
                  {v.s}
                </span>
                <span className="text-xs small:text-sm text-ui-fg-muted">
                  {v.l}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="content-container py-16 small:py-24"
          aria-labelledby="cats-h"
        >
          <header className="mb-10 flex flex-col small:flex-row small:items-end justify-between gap-4">
            <div>
              <p className="text-boundary text-[11px] uppercase tracking-[0.28em] font-medium m-0">
                Kit
              </p>
              <h2
                id="cats-h"
                className="font-display font-bold text-4xl small:text-5xl text-ui-fg-base mt-2 m-0 tracking-tight uppercase"
              >
                Shop by category
              </h2>
            </div>
            <LocalizedClientLink
              href="/store"
              className="text-boundary text-sm font-medium uppercase tracking-wide min-h-[44px] inline-flex items-center"
            >
              Full catalogue →
            </LocalizedClientLink>
          </header>

          <ul className="grid grid-cols-1 small:grid-cols-3 gap-4 list-none m-0 p-0">
            {topCategories.map((category: any, i: number) => (
              <Reveal as="li" key={category.id} delay={i * 50}>
                <LocalizedClientLink
                  href={`/categories/${category.handle}`}
                  data-testid={`home-category-${category.handle}`}
                  className="group relative flex flex-col justify-between min-h-[17rem] rounded-xl bg-pitch-elevated border border-ui-border-base p-7 overflow-hidden hover:border-boundary transition-colors duration-200 oc-lift"
                >
                  <span
                    aria-hidden
                    className="absolute right-4 bottom-2 font-display font-bold text-[7rem] leading-none text-willow/[0.04] group-hover:text-boundary/10 select-none"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="relative font-display font-bold text-3xl uppercase tracking-tight text-ui-fg-base group-hover:text-boundary transition-colors m-0">
                    {category.name}
                  </h3>
                  <div className="relative">
                    <p className="text-ui-fg-muted text-sm leading-relaxed mb-4 max-w-[16rem] m-0">
                      {CATEGORY_BLURBS[category.handle] || "Explore the line."}
                    </p>
                    <span className="text-boundary text-sm font-medium uppercase tracking-wide">
                      Shop {category.name.toLowerCase()} →
                    </span>
                  </div>
                </LocalizedClientLink>
              </Reveal>
            ))}
          </ul>
        </section>
      </div>

      {/* Light catalogue band — contrast for product photos */}
      <section
        className="oc-light border-y border-ui-border-base"
        aria-labelledby="range-h"
      >
        <div className="content-container py-16 small:py-24">
          <header className="flex items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-boundary text-[11px] uppercase tracking-[0.28em] font-medium m-0">
                Featured
              </p>
              <h2
                id="range-h"
                className="font-display font-bold text-4xl small:text-5xl text-ui-fg-base mt-2 m-0 tracking-tight uppercase"
              >
                The range
              </h2>
            </div>
            <LocalizedClientLink
              href="/store"
              data-testid="home-view-all-link"
              className="text-boundary text-sm font-medium uppercase tracking-wide min-h-[44px] inline-flex items-center"
            >
              View all →
            </LocalizedClientLink>
          </header>

          {products.length > 0 ? (
            <ul
              className="grid grid-cols-2 small:grid-cols-4 gap-x-4 gap-y-10 list-none m-0 p-0"
              data-testid="home-products-grid"
            >
              {products.map((product, i) => (
                <Reveal as="li" key={product.id} delay={(i % 4) * 50}>
                  <ProductPreview product={product} region={region} />
                </Reveal>
              ))}
            </ul>
          ) : (
            <p className="text-ui-fg-muted text-sm m-0">
              Catalogue loading — check back shortly or{" "}
              <LocalizedClientLink href="/store" className="text-boundary underline">
                open the store
              </LocalizedClientLink>
              .
            </p>
          )}
        </div>
      </section>

      <div className="oc-dark">
        <CraftProcess />

        <section
          className="border-t border-ui-border-base"
          aria-labelledby="story-h"
        >
          <div className="content-container py-20 small:py-28 max-w-3xl mx-auto text-center">
            <Reveal className="flex flex-col gap-6 items-center">
              <p className="text-boundary text-[11px] uppercase tracking-[0.28em] font-medium m-0">
                Workshop
              </p>
              <h2
                id="story-h"
                className="font-display font-bold text-4xl small:text-5xl text-ui-fg-base leading-[1.05] m-0 tracking-tight uppercase"
              >
                Every bat is picked, pressed and balanced by hand.
              </h2>
              <p className="text-ui-fg-subtle leading-relaxed m-0 max-w-xl">
                We grade every cleft of willow, press for rebound, and balance
                the pickup so the bat feels lighter than the scale. That is the
                curve in OneCurve — precision cricket equipment from our
                workshop to your crease.
              </p>
              <LocalizedClientLink href="/store" className="oc-btn oc-btn-primary mt-2">
                Shop the range
              </LocalizedClientLink>
            </Reveal>
          </div>
        </section>

        <Faq />
      </div>
    </>
  )
}
