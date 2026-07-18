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
  "OneCurve Sports — Premium English Willow Cricket Bats & Gear | India"
const SITE_DESC =
  "Buy handcrafted English Willow cricket bats, pads and gloves. Made in India, free shipping over ₹2,999, 3–5 day pan-India delivery. Shop onecurve.in."

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
      "buy cricket bat India",
      "handcrafted cricket equipment",
      "OneCurve",
      "cricket pads gloves",
      "Grade 1+ willow",
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
  bats: "Grade 1+ to Grade 4 English Willow, hand-pressed for power.",
  pads: "Lightweight protection — players edition to academy.",
  gloves: "Sheep-leather palms with moulded finger protection.",
}

const VALUE_PROPS = [
  { stat: "Grade 1+", label: "English Willow, hand-graded" },
  { stat: "Made in", label: "India — our own workshop" },
  { stat: "Free ship", label: "orders over ₹2,999" },
  { stat: "3–5 days", label: "pan-India delivery" },
]

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

  // Sticky SEO: ItemList + Breadcrumb always in first HTML response
  const itemList =
    products.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Featured OneCurve cricket equipment",
          itemListOrder: "https://schema.org/ItemListOrderAscending",
          numberOfItems: products.length,
          itemListElement: products.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${base}/${countryCode}/products/${p.handle}`,
            name: p.title,
          })),
        }
      : null

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${base}/${countryCode}`,
      },
    ],
  }

  return (
    <div className="oc-dark">
      {itemList && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(itemList) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumb) }}
      />

      <Hero />

      <Marquee />

      {/* Trust / value props — semantic list for crawlers */}
      <section
        aria-label="Why shop OneCurve"
        className="border-y border-ui-border-base"
      >
        <ul className="content-container grid grid-cols-2 small:grid-cols-4 divide-x divide-ui-border-base list-none m-0 p-0">
          {VALUE_PROPS.map((v) => (
            <li
              key={v.label}
              className="flex flex-col items-center text-center gap-1.5 py-8 px-4"
            >
              <span className="font-display text-2xl small:text-3xl text-gold">
                {v.stat}
              </span>
              <span className="text-xs small:text-sm text-ui-fg-muted leading-snug">
                {v.label}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Categories */}
      <section
        className="content-container py-16 small:py-24"
        aria-labelledby="home-categories-heading"
      >
        <header className="flex items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-gold tracking-[0.3em] text-xs uppercase font-medium m-0">
              The kit
            </p>
            <h2
              id="home-categories-heading"
              className="font-display text-4xl small:text-6xl text-ui-fg-base mt-2 m-0"
            >
              Shop by category
            </h2>
          </div>
          <LocalizedClientLink
            href="/store"
            className="hidden small:inline-flex text-gold hover:text-gold-hover text-sm uppercase tracking-wide font-medium min-h-[44px] items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Full store →
          </LocalizedClientLink>
        </header>
        <ul className="grid grid-cols-1 small:grid-cols-3 gap-4 small:gap-5 list-none m-0 p-0">
          {topCategories.map((category: any, i: number) => (
            <Reveal as="li" key={category.id} delay={i * 60}>
              <LocalizedClientLink
                href={`/categories/${category.handle}`}
                data-testid={`home-category-${category.handle}`}
                className="group relative flex flex-col justify-between min-h-[16rem] h-64 rounded-2xl bg-ui-bg-component border border-ui-border-base p-7 small:p-8 overflow-hidden hover:border-gold transition-colors duration-200 oc-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <div
                  aria-hidden
                  className="absolute -right-8 -bottom-10 font-display text-[10rem] leading-none text-ui-fg-base/5 group-hover:text-gold/10 transition-colors select-none"
                >
                  {category.name.charAt(0)}
                </div>
                <h3 className="relative font-display text-3xl small:text-4xl text-ui-fg-base group-hover:text-gold transition-colors m-0">
                  {category.name}
                </h3>
                <div className="relative">
                  <p className="text-ui-fg-muted text-sm leading-relaxed mb-4 max-w-[15rem] m-0">
                    {CATEGORY_BLURBS[category.handle] || "Explore the range."}
                  </p>
                  <span className="text-gold text-sm font-medium uppercase tracking-wide">
                    Shop {category.name.toLowerCase()} →
                  </span>
                </div>
              </LocalizedClientLink>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Featured products */}
      <section
        className="border-t border-ui-border-base"
        aria-labelledby="home-range-heading"
      >
        <div className="content-container py-16 small:py-24">
          <header className="flex items-end justify-between mb-10 gap-4">
            <h2
              id="home-range-heading"
              className="font-display text-4xl small:text-6xl text-ui-fg-base m-0"
            >
              Featured cricket gear
            </h2>
            <LocalizedClientLink
              href="/store"
              data-testid="home-view-all-link"
              className="text-gold hover:text-gold-hover text-sm uppercase tracking-wide font-medium min-h-[44px] inline-flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              View all →
            </LocalizedClientLink>
          </header>
          {products.length > 0 ? (
            <ul
              className="grid grid-cols-2 small:grid-cols-4 gap-x-4 small:gap-x-5 gap-y-8 small:gap-y-10 list-none m-0 p-0"
              data-testid="home-products-grid"
            >
              {products.map((product, i) => (
                <Reveal as="li" key={product.id} delay={(i % 4) * 60}>
                  <ProductPreview product={product} region={region} />
                </Reveal>
              ))}
            </ul>
          ) : (
            <p className="text-ui-fg-muted text-sm">
              Catalog is warming up — visit{" "}
              <LocalizedClientLink href="/store" className="text-gold underline">
                the store
              </LocalizedClientLink>{" "}
              shortly.
            </p>
          )}
        </div>
      </section>

      <CraftProcess />

      <section
        className="border-t border-ui-border-base"
        aria-labelledby="home-story-heading"
      >
        <div className="content-container py-20 small:py-28">
          <Reveal className="max-w-3xl mx-auto text-center flex flex-col gap-6">
            <p className="text-gold tracking-[0.3em] text-xs uppercase font-medium m-0">
              The OneCurve difference
            </p>
            <h2
              id="home-story-heading"
              className="font-display text-4xl small:text-6xl text-ui-fg-base leading-[1.05] m-0"
            >
              Every bat is picked, pressed and balanced by hand.
            </h2>
            <p className="text-ui-fg-subtle leading-relaxed m-0">
              We grade every cleft of willow ourselves, press it for the perfect
              rebound, and balance the pickup so the bat feels lighter than the
              scale says. That is the curve in OneCurve — premium cricket
              equipment from our workshop to your crease.
            </p>
            <div className="mt-2">
              <LocalizedClientLink
                href="/store"
                className="inline-flex items-center justify-center min-h-[48px] px-10 py-3.5 rounded-full bg-gold text-ink font-medium hover:bg-gold-hover transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                Shop the range
              </LocalizedClientLink>
            </div>
          </Reveal>
        </div>
      </section>

      <Faq />
    </div>
  )
}
