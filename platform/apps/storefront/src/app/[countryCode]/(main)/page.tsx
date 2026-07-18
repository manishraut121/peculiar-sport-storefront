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
  "OneCurve Sports — Performance Equipment for Cricket, Training & More | India"
const SITE_DESC =
  "Performance sports equipment for India. Cricket live: English Willow bats, pads & gloves. Training, gym and nutrition next — one inventory, free shipping over ₹2,999."

type Props = { params: Promise<{ countryCode: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { countryCode } = await props.params
  const canonical = `${getBaseURL()}/${countryCode}`
  return {
    title: { absolute: SITE_TITLE },
    description: SITE_DESC,
    alternates: { canonical },
    keywords: [
      "sports equipment India",
      "cricket bat online",
      "English Willow",
      "gym equipment",
      "OneCurve Sports",
      "athletic performance gear",
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
    return (
      <div className="content-container py-24 text-center">
        <h1 className="font-display text-3xl">OneCurve Sports</h1>
        <p className="text-ui-fg-muted mt-2">
          Store is warming up. Please try again shortly.
        </p>
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

      <div className="oc-dark">
        <Hero />
        <Marquee />
        <Verticals />

        {/* Cricket deep-dive when categories exist */}
        {topCategories.length > 0 && (
          <section
            className="content-container pb-16 small:pb-24"
            aria-labelledby="cricket-cats-h"
          >
            <header className="mb-8 flex flex-col small:flex-row small:items-end justify-between gap-3">
              <div>
                <p className="text-boundary text-[11px] uppercase tracking-[0.28em] font-medium m-0">
                  Cricket · live
                </p>
                <h2
                  id="cricket-cats-h"
                  className="font-display font-bold text-3xl small:text-4xl text-ui-fg-base mt-2 m-0 tracking-tight uppercase"
                >
                  Shop cricket categories
                </h2>
              </div>
              <LocalizedClientLink
                href="/store"
                className="text-boundary text-sm font-medium uppercase tracking-wide min-h-[44px] inline-flex items-center"
              >
                All products →
              </LocalizedClientLink>
            </header>
            <ul className="grid grid-cols-1 small:grid-cols-3 gap-4 list-none m-0 p-0">
              {topCategories.map((category: any, i: number) => (
                <Reveal as="li" key={category.id} delay={i * 40}>
                  <LocalizedClientLink
                    href={`/categories/${category.handle}`}
                    data-testid={`home-category-${category.handle}`}
                    className="group flex flex-col justify-between min-h-[10rem] rounded-xl bg-pitch-elevated border border-ui-border-base p-6 hover:border-boundary transition-colors oc-lift"
                  >
                    <h3 className="font-display font-bold text-2xl uppercase tracking-tight text-ui-fg-base group-hover:text-boundary m-0 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-ui-fg-muted text-sm m-0 mt-2">
                      {CATEGORY_BLURBS[category.handle] || "Explore the line."}
                    </p>
                    <span className="text-boundary text-xs font-medium uppercase tracking-wide mt-4">
                      Shop →
                    </span>
                  </LocalizedClientLink>
                </Reveal>
              ))}
            </ul>
          </section>
        )}
      </div>

      <section
        className="oc-light border-y border-ui-border-base"
        aria-labelledby="range-h"
      >
        <div className="content-container py-16 small:py-24">
          <ul
            className="grid grid-cols-2 small:grid-cols-4 gap-3 small:gap-4 mb-12 list-none m-0 p-0"
            aria-label="Shopping guarantees"
          >
            {[
              { t: "One inventory", d: "Online + future POS, same stock" },
              { t: "Free ship ₹2,999+", d: "Pan-India standard rates below" },
              { t: "Secure checkout", d: "UPI, cards, net-banking" },
              { t: "7-day returns", d: "Unused gear, original pack" },
            ].map((x) => (
              <li
                key={x.t}
                className="rounded-xl border border-ui-border-base bg-willow-card px-4 py-3 small:px-5 small:py-4"
              >
                <p className="font-display font-semibold text-sm small:text-base text-pitch uppercase tracking-tight m-0">
                  {x.t}
                </p>
                <p className="text-xs text-mist mt-1 m-0 leading-snug">{x.d}</p>
              </li>
            ))}
          </ul>

          <header className="flex items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-boundary text-[11px] uppercase tracking-[0.28em] font-medium m-0">
                Featured · cricket
              </p>
              <h2
                id="range-h"
                className="font-display font-bold text-4xl small:text-5xl text-ui-fg-base mt-2 m-0 tracking-tight uppercase"
              >
                In stock now
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
              {products.map((product: any, i: number) => (
                <Reveal as="li" key={product.id} delay={(i % 4) * 50}>
                  <ProductPreview product={product} region={region} />
                </Reveal>
              ))}
            </ul>
          ) : (
            <p className="text-ui-fg-muted text-sm m-0" data-testid="home-empty-catalog">
              Catalogue is connecting to inventory. Open{" "}
              <LocalizedClientLink href="/store" className="text-boundary underline">
                the store
              </LocalizedClientLink>{" "}
              or check Admin products if you are staff.
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
                Why OneCurve
              </p>
              <h2
                id="story-h"
                className="font-display font-bold text-4xl small:text-5xl text-ui-fg-base leading-[1.05] m-0 tracking-tight uppercase"
              >
                One inventory for every discipline.
              </h2>
              <p className="text-ui-fg-subtle leading-relaxed m-0 max-w-xl">
                We started with cricket because precision matters. The same
                standard — honest specs, fair price, pan-India fulfilment —
                scales to training, gym and nutrition without splitting your
                cart or your trust.
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
