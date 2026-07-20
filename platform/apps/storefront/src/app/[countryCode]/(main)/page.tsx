import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import Marquee from "@modules/home/components/marquee"
import Verticals from "@modules/home/components/verticals"
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
  "OneCurve — Performance Sports Equipment | Cricket & More | India"
const SITE_DESC =
  "Move with the curve. Cricket gear live now; training and nutrition next. Free shipping over ₹2,999 pan-India. Shop OneCurve."

type Props = { params: Promise<{ countryCode: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { countryCode } = await props.params
  const canonical = `${getBaseURL()}/${countryCode}`
  return {
    title: { absolute: SITE_TITLE },
    description: SITE_DESC,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: canonical,
      title: SITE_TITLE,
      description: SITE_DESC,
      siteName: "OneCurve",
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
  bats: "English Willow — graded and match-ready.",
  pads: "Light protection from academy to players.",
  gloves: "Grip and protection where it counts.",
}

export default async function Home(props: Props) {
  const { countryCode } = await props.params
  const base = getBaseURL()
  const region = await getRegion(countryCode)

  if (!region) {
    return (
      <div className="content-container py-24 text-center">
        <h1 className="font-display text-3xl font-bold">OneCurve</h1>
        <p className="text-fog mt-2">Store is connecting. Try again shortly.</p>
      </div>
    )
  }

  const [categories, productResult] = await Promise.all([
    listCategories().catch(() => []),
    listProducts({ countryCode, queryParams: { limit: 8 } }).catch(() => ({
      response: { products: [] as any[] },
    })),
  ])
  const products = productResult.response?.products || []
  const topCategories = (categories || []).filter(
    (c: any) => !c.parent_category
  )

  const itemList =
    products.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "OneCurve featured products",
          numberOfItems: products.length,
          itemListElement: products.map((p: any, i: number) => ({
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

      <Hero />
      <Marquee />

      {/* Trust metrics — light band */}
      <section
        className="border-b border-line bg-paper"
        aria-label="Why shop OneCurve"
      >
        <ul className="content-container grid grid-cols-2 small:grid-cols-4 list-none m-0 p-0">
          {[
            { s: "₹2,999+", l: "Free pan-India shipping" },
            { s: "3–5 days", l: "Typical delivery" },
            { s: "UPI", l: "Cards & net-banking" },
            { s: "7 days", l: "Easy returns" },
          ].map((v, i) => (
            <li
              key={v.l}
              className={`flex flex-col gap-1 py-8 px-4 small:px-6 ${
                i > 0 ? "border-l border-line" : ""
              }`}
            >
              <span className="font-display font-extrabold text-2xl small:text-3xl text-ink tracking-tight">
                {v.s}
              </span>
              <span className="text-sm text-fog font-medium">{v.l}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="oc-section bg-paper">
        <Verticals />
      </div>

      {topCategories.length > 0 && (
        <section
          className="content-container py-16 small:py-20 oc-section"
          aria-labelledby="cats-h"
        >
          <header className="flex flex-col small:flex-row small:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-signal text-xs font-bold uppercase tracking-[0.2em] m-0">
                Cricket · live
              </p>
              <h2
                id="cats-h"
                className="font-display font-extrabold text-3xl small:text-5xl text-ink mt-2 m-0 tracking-tight"
              >
                Shop by category
              </h2>
            </div>
            <LocalizedClientLink
              href="/store"
              className="text-signal font-bold text-sm uppercase tracking-wide min-h-[44px] inline-flex items-center"
            >
              View all →
            </LocalizedClientLink>
          </header>
          <ul className="grid grid-cols-1 small:grid-cols-3 gap-4 list-none m-0 p-0">
            {topCategories.map((category: any, i: number) => (
              <Reveal as="li" key={category.id} delay={i * 60}>
                <LocalizedClientLink
                  href={`/categories/${category.handle}`}
                  data-testid={`home-category-${category.handle}`}
                  className="group flex flex-col justify-between min-h-[11rem] rounded-3xl bg-mute border border-line p-7 hover:border-signal/50 hover:shadow-lg transition-all duration-300 oc-lift"
                >
                  <span className="text-xs font-bold text-signal uppercase tracking-widest">
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="font-display font-extrabold text-2xl text-ink group-hover:text-signal transition-colors m-0">
                      {category.name}
                    </h3>
                    <p className="text-fog text-sm mt-2 m-0 leading-relaxed">
                      {CATEGORY_BLURBS[category.handle] || "Explore the line."}
                    </p>
                  </div>
                </LocalizedClientLink>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      <section
        className="bg-mute border-y border-line oc-section"
        aria-labelledby="range-h"
      >
        <div className="content-container py-16 small:py-20">
          <header className="flex items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-signal text-xs font-bold uppercase tracking-[0.2em] m-0">
                Featured
              </p>
              <h2
                id="range-h"
                className="font-display font-extrabold text-3xl small:text-5xl text-ink mt-2 m-0 tracking-tight"
              >
                In stock now
              </h2>
            </div>
            <LocalizedClientLink
              href="/store"
              data-testid="home-view-all-link"
              className="text-signal font-bold text-sm uppercase tracking-wide min-h-[44px] inline-flex items-center"
            >
              Shop all →
            </LocalizedClientLink>
          </header>

          {products.length > 0 ? (
            <ul
              className="grid grid-cols-2 small:grid-cols-4 gap-4 small:gap-6 list-none m-0 p-0"
              data-testid="home-products-grid"
            >
              {products.map((product: any, i: number) => (
                <Reveal as="li" key={product.id} delay={(i % 4) * 55}>
                  <ProductPreview product={product} region={region} />
                </Reveal>
              ))}
            </ul>
          ) : (
            <p
              className="text-fog text-sm m-0"
              data-testid="home-empty-catalog"
            >
              Catalogue connecting to CMS…{" "}
              <LocalizedClientLink
                href="/store"
                className="text-signal font-semibold underline"
              >
                Open store
              </LocalizedClientLink>
            </p>
          )}
        </div>
      </section>

      <div className="oc-dark oc-section">
        <CraftProcess />
        <section
          className="border-t border-white/10"
          aria-labelledby="story-h"
        >
          <div className="content-container py-20 small:py-28 max-w-2xl mx-auto text-center">
            <Reveal className="flex flex-col gap-6 items-center">
              <p className="text-signal text-xs font-bold uppercase tracking-[0.22em] m-0">
                Platform
              </p>
              <h2
                id="story-h"
                className="font-display font-extrabold text-3xl small:text-5xl text-white leading-[1.05] m-0 tracking-tight"
              >
                One house for every discipline.
              </h2>
              <p className="text-white/60 leading-relaxed m-0 text-lg font-medium">
                Cricket first. Gym and nutrition on the same rails — same
                checkout, same stock truth, same promise of fair specs.
              </p>
              <LocalizedClientLink
                href="/store"
                className="oc-btn oc-btn-primary mt-2"
              >
                Shop live products
              </LocalizedClientLink>
            </Reveal>
          </div>
        </section>
        <Faq />
      </div>
    </>
  )
}
