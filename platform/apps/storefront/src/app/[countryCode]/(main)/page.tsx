import { Metadata } from "next"

import { listCategories } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getBaseURL } from "@lib/util/env"
import { jsonLd } from "@lib/util/json-ld"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"
import Reveal from "@modules/common/components/reveal"
import Faq from "@modules/home/components/faq"

/**
 * Apple / Google Store–inspired home:
 * vast white space, huge type, simple CTAs, large tiles, product grid.
 * Energetic signal orange kept for sport brand energy.
 */

const SITE_TITLE =
  "OneCurve — Performance Sports Equipment | India"
const SITE_DESC =
  "Move with the curve. Shop cricket gear now. Training, nutrition and recovery guides live — products coming soon. Free shipping over ₹2,999."

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
    robots: { index: true, follow: true },
  }
}

const TILES = [
  {
    name: "Cricket",
    href: "/store",
    status: "live" as const,
    blurb: "Bats, pads, gloves — shop now.",
    dark: true,
  },
  {
    name: "Training",
    href: "/disciplines/training",
    status: "soon" as const,
    blurb: "Advice live. Gear soon.",
    dark: false,
  },
  {
    name: "Nutrition",
    href: "/disciplines/nutrition",
    status: "soon" as const,
    blurb: "Fuel smart. Products soon.",
    dark: false,
  },
  {
    name: "Recovery",
    href: "/disciplines/recovery",
    status: "soon" as const,
    blurb: "Rest better. Gear soon.",
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
    .slice(0, 3)

  const itemList =
    products.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "OneCurve products",
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
    <div className="bg-paper w-full overflow-x-clip">
      {itemList && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(itemList) }}
        />
      )}

      {/* ——— Apple-style centered hero ——— */}
      <section className="border-b border-line">
        <div className="content-container py-14 xsmall:py-20 small:py-28 medium:py-32">
          <div className="oc-hero-enter flex flex-col items-center gap-5 small:gap-6 text-center mx-auto w-full max-w-3xl">
            <p className="text-signal text-xs small:text-sm font-bold m-0 tracking-wide uppercase">
              New
            </p>
            <h1 className="font-display font-extrabold text-[2.5rem] leading-[1.05] xsmall:text-5xl small:text-7xl medium:text-8xl text-ink tracking-tight m-0">
              Move with
              <br />
              the curve.
            </h1>
            <p className="text-fog text-base xsmall:text-lg small:text-2xl m-0 max-w-md small:max-w-xl font-medium leading-snug px-1">
              Performance equipment for India. Cricket live today.
            </p>
            <div className="flex flex-col xsmall:flex-row items-stretch xsmall:items-center justify-center gap-3 mt-1 w-full xsmall:w-auto px-0">
              <LocalizedClientLink
                href="/store"
                data-testid="hero-shop-link"
                className="oc-btn oc-btn-primary w-full xsmall:w-auto px-8"
              >
                Shop
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/categories/bats"
                data-testid="hero-bats-link"
                className="oc-btn oc-btn-dark w-full xsmall:w-auto px-8"
              >
                Learn about bats
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Google Store–style large tiles ——— */}
      <section
        className="content-container py-10 small:py-16"
        aria-labelledby="tiles-h"
      >
        <h2 id="tiles-h" className="sr-only">
          Shop by discipline
        </h2>
        <ul className="grid grid-cols-1 xsmall:grid-cols-2 gap-3 small:gap-5 list-none m-0 p-0">
          {TILES.map((t, i) => (
            <Reveal as="li" key={t.name} delay={i * 50} className="min-w-0">
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
                    {t.name}
                  </h3>
                  {t.status === "soon" ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 text-fog border border-line shrink-0 whitespace-nowrap">
                      Soon
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-signal text-white shrink-0">
                      Shop
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
                    {t.status === "live" ? "Buy →" : "Read advice →"}
                  </span>
                </div>
              </LocalizedClientLink>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ——— Product shelf ——— */}
      <section
        className="bg-mute border-y border-line"
        aria-labelledby="new-h"
      >
        <div className="content-container py-12 small:py-20">
          <div className="text-center mb-8 small:mb-12 px-1">
            <h2
              id="new-h"
              className="font-display font-extrabold text-2xl xsmall:text-3xl small:text-5xl text-ink m-0 tracking-tight"
            >
              Cricket. Ready to play.
            </h2>
            <p className="text-fog text-base small:text-lg mt-3 m-0 font-medium">
              Live from our warehouse.{" "}
              <LocalizedClientLink
                href="/store"
                className="text-signal font-bold hover:underline"
                data-testid="home-view-all-link"
              >
                See all
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

      {/* ——— Category chips ——— */}
      {topCategories.length > 0 && (
        <section className="content-container py-12 small:py-16">
          <h2 className="font-display font-extrabold text-xl small:text-3xl text-ink text-center m-0 mb-6 small:mb-8">
            Shop cricket
          </h2>
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

      {/* ——— Quiet trust ——— */}
      <section className="border-t border-line">
        <ul className="content-container grid grid-cols-1 xsmall:grid-cols-3 gap-0 list-none m-0 p-0 divide-y xsmall:divide-y-0 xsmall:divide-x divide-line">
          {[
            { t: "Free shipping", d: "Orders ₹2,999 and above" },
            { t: "Fast delivery", d: "3–5 days pan-India" },
            { t: "Easy returns", d: "7 days on unused gear" },
          ].map((x) => (
            <li key={x.t} className="py-8 small:py-10 px-4 small:px-6 text-center">
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
