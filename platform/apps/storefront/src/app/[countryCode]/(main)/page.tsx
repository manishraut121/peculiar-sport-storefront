import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import Marquee from "@modules/home/components/marquee"
import CraftProcess from "@modules/home/components/craft-process"
import Faq from "@modules/home/components/faq"
import { listCategories } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"
import Reveal from "@modules/common/components/reveal"

export const metadata: Metadata = {
  title: "OneCurve Sports — Premium Handcrafted Cricket Equipment",
  description:
    "Premium handcrafted English Willow cricket bats, pads and gloves. Made in India, delivered pan-India. Shop at onecurve.in.",
}

const CATEGORY_BLURBS: Record<string, string> = {
  bats: "Grade 1+ to Grade 4 English Willow, hand-pressed for power.",
  pads: "Lightweight protection, players edition to academy.",
  gloves: "Sheep-leather palms with moulded finger protection.",
}

const VALUE_PROPS = [
  { stat: "Grade 1+", label: "English Willow, hand-graded" },
  { stat: "Made in", label: "India — our own workshop" },
  { stat: "Free", label: "shipping over ₹2,999" },
  { stat: "3–5 days", label: "pan-India delivery" },
]

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  const region = await getRegion(countryCode)
  if (!region) {
    return null
  }

  const [categories, { response }] = await Promise.all([
    listCategories().catch(() => []),
    listProducts({ countryCode, queryParams: { limit: 8 } }),
  ])
  const products = response.products
  const topCategories = (categories || []).filter((c: any) => !c.parent_category)

  return (
    <div className="oc-dark">
      <Hero />

      <Marquee />

      {/* Value-prop strip */}
      <section className="border-y border-ui-border-base">
        <div className="content-container grid grid-cols-2 small:grid-cols-4 divide-x divide-ui-border-base">
          {VALUE_PROPS.map((v) => (
            <div
              key={v.label}
              className="flex flex-col items-center text-center gap-1 py-8 px-4"
            >
              <span className="font-display text-2xl small:text-3xl text-gold">
                {v.stat}
              </span>
              <span className="text-xs small:text-sm text-ui-fg-muted">
                {v.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Category blocks */}
      <section className="content-container py-20 small:py-28">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-gold tracking-[0.3em] text-xs uppercase font-medium">
              The kit
            </span>
            <h2 className="font-display text-4xl small:text-6xl text-ui-fg-base mt-2">
              Shop by category
            </h2>
          </div>
        </div>
        <ul className="grid grid-cols-1 small:grid-cols-3 gap-5">
          {topCategories.map((category: any, i: number) => (
            <Reveal as="li" key={category.id} delay={i * 70}>
              <LocalizedClientLink
                href={`/categories/${category.handle}`}
                data-testid={`home-category-${category.handle}`}
                className="group relative flex flex-col justify-between h-64 rounded-2xl bg-ui-bg-subtle border border-ui-border-base p-8 overflow-hidden hover:border-gold transition-colors"
              >
                <div
                  aria-hidden
                  className="absolute -right-8 -bottom-10 font-display text-[10rem] leading-none text-ui-fg-base/5 group-hover:text-gold/10 transition-colors select-none"
                >
                  {category.name.charAt(0)}
                </div>
                <span className="relative font-display text-4xl text-ui-fg-base group-hover:text-gold transition-colors">
                  {category.name}
                </span>
                <div className="relative">
                  <p className="text-ui-fg-muted text-sm leading-relaxed mb-4 max-w-[15rem]">
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
      <section className="border-t border-ui-border-base">
        <div className="content-container py-20 small:py-28">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-display text-4xl small:text-6xl text-ui-fg-base">
              The range
            </h2>
            <LocalizedClientLink
              href="/store"
              data-testid="home-view-all-link"
              className="text-gold hover:text-gold-hover text-sm uppercase tracking-wide font-medium"
            >
              View all →
            </LocalizedClientLink>
          </div>
          <ul
            className="grid grid-cols-2 small:grid-cols-4 gap-x-5 gap-y-10"
            data-testid="home-products-grid"
          >
            {products.map((product, i) => (
              <Reveal as="li" key={product.id} delay={(i % 4) * 70}>
                <ProductPreview product={product} region={region} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <CraftProcess />

      {/* Brand story */}
      <section className="border-t border-ui-border-base">
        <div className="content-container py-24 small:py-32">
          <Reveal className="max-w-3xl mx-auto text-center flex flex-col gap-6">
            <span className="text-gold tracking-[0.3em] text-xs uppercase font-medium">
              The OneCurve difference
            </span>
            <h2 className="font-display text-4xl small:text-6xl text-ui-fg-base leading-[1.05]">
              Every bat is picked, pressed and balanced by hand.
            </h2>
            <p className="text-ui-fg-subtle leading-relaxed">
              We grade every cleft of willow ourselves, press it for the perfect
              rebound, and balance the pickup so the bat feels lighter than the
              scale says. That is the curve in OneCurve.
            </p>
            <div className="mt-2">
              <LocalizedClientLink
                href="/store"
                className="inline-block px-10 py-4 rounded-full bg-gold text-ink font-medium hover:bg-gold-hover transition-colors"
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
