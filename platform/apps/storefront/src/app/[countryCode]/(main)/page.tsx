import { Metadata } from "next"

import { listCategories } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HOME_SEO, SEO } from "@lib/brand/seo-copy"
import { getBaseURL } from "@lib/util/env"
import { jsonLd } from "@lib/util/json-ld"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"
import Reveal from "@modules/common/components/reveal"
import Faq from "@modules/home/components/faq"

type Props = { params: Promise<{ countryCode: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { countryCode } = await props.params
  const canonical = `${getBaseURL()}/${countryCode}`
  return {
    title: { absolute: HOME_SEO.title },
    description: HOME_SEO.description,
    keywords: [...HOME_SEO.keywords],
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: canonical,
      title: HOME_SEO.title,
      description: HOME_SEO.description,
      siteName: SEO.brandLegal,
    },
    twitter: {
      card: "summary_large_image",
      title: HOME_SEO.title,
      description: HOME_SEO.description,
    },
    robots: { index: true, follow: true },
  }
}

const TILES = [
  {
    name: "Cricket equipment",
    short: "Cricket",
    href: "/store",
    status: "live" as const,
    blurb:
      "English Willow bats, pads, gloves and keeping gear — shop online now.",
    dark: true,
  },
  {
    name: "Training advice",
    short: "Training",
    href: "/disciplines/training",
    status: "soon" as const,
    blurb:
      "Strength and conditioning guides for athletes. Gear coming soon.",
    dark: false,
  },
  {
    name: "Sports nutrition",
    short: "Nutrition",
    href: "/disciplines/nutrition",
    status: "soon" as const,
    blurb: "Fuel and hydration tips for Indian conditions. Products soon.",
    dark: false,
  },
  {
    name: "Athlete recovery",
    short: "Recovery",
    href: "/disciplines/recovery",
    status: "soon" as const,
    blurb: "Sleep, mobility and rest habits. Recovery products soon.",
    dark: false,
  },
]

export default async function Home(props: Props) {
  const { countryCode } = await props.params
  const base = getBaseURL()
  const region = await getRegion(countryCode)

  if (!region) {
    return (
      <div className="content-container py-32 text-center">
        <h1 className="font-display font-extrabold text-4xl">OneCurve</h1>
        <p className="text-fog mt-3">Connecting to inventory…</p>
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
  const topCategories = (categories || [])
    .filter((c: any) => !c.parent_category)
    .slice(0, 6)

  const schemas: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: HOME_SEO.title,
      description: HOME_SEO.description,
      url: `${base}/${countryCode}`,
      isPartOf: {
        "@type": "WebSite",
        name: SEO.brandLegal,
        url: base,
      },
      about: {
        "@type": "Thing",
        name: "Cricket and performance sports equipment",
      },
      inLanguage: "en-IN",
    },
  ]

  if (products.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Featured cricket equipment at OneCurve",
      numberOfItems: products.length,
      itemListElement: products.map((p: any, i: number) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${base}/${countryCode}/products/${p.handle}`,
        name: p.title,
      })),
    })
  }

  return (
    <div className="bg-paper w-full overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(schemas) }}
      />

      {/* Hero — single H1 for SEO */}
      <section className="border-b border-line" aria-labelledby="home-h1">
        <div className="content-container py-14 xsmall:py-20 small:py-28 medium:py-32">
          <div className="oc-hero-enter flex flex-col items-center gap-5 small:gap-6 text-center mx-auto w-full max-w-3xl">
            <p className="text-signal text-xs small:text-sm font-bold m-0 tracking-wide uppercase">
              Cricket · Training · Nutrition · Recovery
            </p>
            <h1
              id="home-h1"
              className="font-display font-extrabold text-[2.5rem] leading-[1.05] xsmall:text-5xl small:text-7xl medium:text-8xl text-ink tracking-tight m-0"
            >
              Move with
              <br />
              the curve.
            </h1>
            <p className="text-fog text-base xsmall:text-lg small:text-2xl m-0 max-w-md small:max-w-xl font-medium leading-snug px-1">
              {HOME_SEO.heroSub}
            </p>
            <div className="flex flex-col xsmall:flex-row items-stretch xsmall:items-center justify-center gap-3 mt-1 w-full xsmall:w-auto px-0">
              <LocalizedClientLink
                href="/store"
                data-testid="hero-shop-link"
                className="oc-btn oc-btn-primary w-full xsmall:w-auto px-8"
              >
                Shop cricket gear
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/categories/bats"
                data-testid="hero-bats-link"
                className="oc-btn oc-btn-dark w-full xsmall:w-auto px-8"
              >
                Buy cricket bats
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </section>

      {/* Disciplines */}
      <section
        className="content-container py-10 small:py-16"
        aria-labelledby="tiles-h"
      >
        <header className="text-center mb-8 small:mb-10 max-w-2xl mx-auto">
          <h2
            id="tiles-h"
            className="font-display font-extrabold text-2xl small:text-4xl text-ink m-0 tracking-tight"
          >
            Shop by discipline
          </h2>
          <p className="text-fog text-sm small:text-base mt-3 m-0 font-medium leading-relaxed">
            Cricket gear is live. Training, nutrition and recovery guides help
            you perform while those product lines launch on the same store.
          </p>
        </header>
        <ul className="grid grid-cols-1 xsmall:grid-cols-2 gap-3 small:gap-5 list-none m-0 p-0">
          {TILES.map((t, i) => (
            <Reveal as="li" key={t.short} delay={i * 50} className="min-w-0">
              <LocalizedClientLink
                href={t.href}
                className={
                  "group flex flex-col justify-between h-full min-h-[180px] small:min-h-[260px] rounded-3xl small:rounded-[2rem] p-6 small:p-10 transition-transform duration-300 oc-lift " +
                  (t.dark
                    ? "bg-ink text-white"
                    : "bg-mute text-ink border border-line")
                }
              >
                <div className="flex justify-between items-start gap-3">
                  <h3 className="font-display font-extrabold text-2xl small:text-4xl m-0 tracking-tight">
                    {t.short}
                  </h3>
                  {t.status === "soon" ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 text-fog border border-line shrink-0 whitespace-nowrap">
                      Guides live
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-signal text-white shrink-0">
                      Shop now
                    </span>
                  )}
                </div>
                <div className="mt-6">
                  <p
                    className={
                      "text-sm small:text-lg font-medium m-0 " +
                      (t.dark ? "text-white/60" : "text-fog")
                    }
                  >
                    {t.blurb}
                  </p>
                  <span className="inline-block mt-3 text-sm font-bold text-signal">
                    {t.status === "live" ? "Browse store →" : "Read advice →"}
                  </span>
                </div>
              </LocalizedClientLink>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Product shelf */}
      <section
        className="bg-mute border-y border-line"
        aria-labelledby="new-h"
      >
        <div className="content-container py-12 small:py-20">
          <div className="text-center mb-8 small:mb-12 px-1 max-w-2xl mx-auto">
            <h2
              id="new-h"
              className="font-display font-extrabold text-2xl xsmall:text-3xl small:text-5xl text-ink m-0 tracking-tight"
            >
              Featured cricket equipment
            </h2>
            <p className="text-fog text-base small:text-lg mt-3 m-0 font-medium">
              Live stock from our warehouse — bats, pads and more.{" "}
              <LocalizedClientLink
                href="/store"
                className="text-signal font-bold hover:underline"
                data-testid="home-view-all-link"
              >
                See all cricket products
              </LocalizedClientLink>
            </p>
          </div>

          {products.length > 0 ? (
            <ul
              className="grid grid-cols-2 medium:grid-cols-4 gap-2.5 xsmall:gap-3 small:gap-5 list-none m-0 p-0"
              data-testid="home-products-grid"
            >
              {products.map((product: any, i: number) => (
                <Reveal
                  as="li"
                  key={product.id}
                  delay={(i % 4) * 40}
                  className="min-w-0 h-full"
                >
                  <ProductPreview product={product} region={region} />
                </Reveal>
              ))}
            </ul>
          ) : (
            <p className="text-center text-fog" data-testid="home-empty-catalog">
              Loading catalogue from CMS…
            </p>
          )}
        </div>
      </section>

      {/* Categories */}
      {topCategories.length > 0 && (
        <section
          className="content-container py-12 small:py-16"
          aria-labelledby="cat-h"
        >
          <h2
            id="cat-h"
            className="font-display font-extrabold text-xl small:text-3xl text-ink text-center m-0 mb-3 small:mb-4"
          >
            Shop cricket by category
          </h2>
          <p className="text-fog text-sm small:text-base text-center m-0 mb-6 small:mb-8 max-w-xl mx-auto font-medium">
            Find bats, pads, gloves and more — free shipping over {SEO.freeShip}.
          </p>
          <ul className="flex flex-wrap justify-center gap-2.5 small:gap-3 list-none m-0 p-0">
            {topCategories.map((c: any) => (
              <li key={c.id}>
                <LocalizedClientLink
                  href={`/categories/${c.handle}`}
                  data-testid={`home-category-${c.handle}`}
                  className="inline-flex items-center justify-center min-h-11 px-5 small:px-6 rounded-full bg-ink text-white font-bold text-sm hover:bg-signal transition-colors duration-200"
                >
                  {c.name}
                </LocalizedClientLink>
              </li>
            ))}
            <li>
              <LocalizedClientLink
                href="/store"
                className="inline-flex items-center justify-center min-h-11 px-5 small:px-6 rounded-full border-2 border-ink text-ink font-bold text-sm hover:bg-ink hover:text-white transition-colors duration-200"
              >
                All products
              </LocalizedClientLink>
            </li>
          </ul>
        </section>
      )}

      {/* About — crawlable SEO body */}
      <section
        className="border-t border-line bg-white"
        aria-labelledby="about-h"
      >
        <div className="content-container py-12 small:py-20">
          <div className="max-w-3xl mx-auto">
            <h2
              id="about-h"
              className="font-display font-extrabold text-2xl small:text-4xl text-ink m-0 tracking-tight text-center"
            >
              {HOME_SEO.aboutTitle}
            </h2>
            <div className="mt-6 small:mt-8 flex flex-col gap-4 text-fog text-sm small:text-base leading-relaxed font-medium">
              {HOME_SEO.aboutBody.map((p) => (
                <p key={p.slice(0, 40)} className="m-0">
                  {p}
                </p>
              ))}
            </div>

            <h3
              id="why-h"
              className="font-display font-extrabold text-xl small:text-2xl text-ink mt-10 small:mt-14 m-0 text-center"
            >
              {HOME_SEO.whyTitle}
            </h3>
            <ul className="grid grid-cols-1 small:grid-cols-3 gap-4 small:gap-5 list-none m-0 p-0 mt-6">
              {HOME_SEO.whyPoints.map((pt) => (
                <li
                  key={pt.title}
                  className="rounded-2xl border border-line bg-mute/60 p-5 small:p-6"
                >
                  <h4 className="font-display font-bold text-base small:text-lg text-ink m-0">
                    {pt.title}
                  </h4>
                  <p className="text-fog text-sm mt-2 m-0 leading-relaxed font-medium">
                    {pt.body}
                  </p>
                </li>
              ))}
            </ul>

            <nav
              className="mt-10 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-bold"
              aria-label="Popular OneCurve pages"
            >
              <LocalizedClientLink
                href="/categories/bats"
                className="text-signal hover:underline"
              >
                Cricket bats
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/store"
                className="text-signal hover:underline"
              >
                Full store
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/blog"
                className="text-signal hover:underline"
              >
                Cricket guides
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/disciplines/training"
                className="text-signal hover:underline"
              >
                Training advice
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/legal/shipping-returns"
                className="text-signal hover:underline"
              >
                Shipping &amp; returns
              </LocalizedClientLink>
            </nav>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-t border-line" aria-labelledby="trust-h">
        <h2 id="trust-h" className="sr-only">
          Delivery and returns
        </h2>
        <ul className="content-container grid grid-cols-1 xsmall:grid-cols-3 gap-0 list-none m-0 p-0 divide-y xsmall:divide-y-0 xsmall:divide-x divide-line">
          {[
            {
              t: "Free shipping",
              d: `Orders ${SEO.freeShip} and above across India`,
            },
            {
              t: "Fast delivery",
              d: `${SEO.delivery} pan-India after dispatch`,
            },
            {
              t: "Easy returns",
              d: `${SEO.returns} on unused gear in original pack`,
            },
          ].map((x) => (
            <li
              key={x.t}
              className="py-8 small:py-10 px-4 small:px-6 text-center"
            >
              <p className="font-display font-extrabold text-lg small:text-xl text-ink m-0">
                {x.t}
              </p>
              <p className="text-fog text-sm mt-1 m-0 font-medium">{x.d}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="border-t border-line bg-ink">
        <Faq />
      </div>
    </div>
  )
}
