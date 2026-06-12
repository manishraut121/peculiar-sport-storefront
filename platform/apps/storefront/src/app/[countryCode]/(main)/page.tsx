import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import { listCategories } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"

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
    listCategories(),
    listProducts({
      countryCode,
      queryParams: { limit: 8 },
    }),
  ])
  const products = response.products

  return (
    <>
      <Hero />

      {/* Category tiles */}
      <section className="content-container py-24">
        <div className="flex items-end justify-between mb-10">
          <h2 className="font-display text-4xl small:text-5xl text-cream">
            Shop by category
          </h2>
        </div>
        <ul className="grid grid-cols-1 small:grid-cols-3 gap-6">
          {(categories || []).map((category) => (
            <li key={category.id}>
              <LocalizedClientLink
                href={`/categories/${category.handle}`}
                data-testid={`home-category-${category.handle}`}
                className="group block rounded-2xl bg-ink-card border border-cream/10 p-10 hover:border-gold transition-colors"
              >
                <span className="font-display text-3xl text-cream group-hover:text-gold transition-colors">
                  {category.name}
                </span>
                <p className="text-cream-muted text-sm mt-3 leading-relaxed">
                  {CATEGORY_BLURBS[category.handle] || "Explore the range."}
                </p>
                <span className="inline-block mt-6 text-gold text-sm">
                  Browse {category.name.toLowerCase()} →
                </span>
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </section>

      {/* Featured products */}
      <section className="bg-ink-surface border-y border-cream/5">
        <div className="content-container py-24">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-display text-4xl small:text-5xl text-cream">
              The range
            </h2>
            <LocalizedClientLink
              href="/store"
              data-testid="home-view-all-link"
              className="text-gold hover:text-gold-hover text-sm"
            >
              View all →
            </LocalizedClientLink>
          </div>
          <ul
            className="grid grid-cols-2 small:grid-cols-4 gap-x-6 gap-y-10"
            data-testid="home-products-grid"
          >
            {products.map((product) => (
              <li key={product.id}>
                <ProductPreview product={product} region={region} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Craft strip */}
      <section className="content-container py-24">
        <div className="max-w-3xl mx-auto text-center flex flex-col gap-6">
          <span className="text-gold tracking-[0.35em] text-xs uppercase font-medium">
            The OneCurve difference
          </span>
          <h2 className="font-display text-4xl small:text-6xl text-cream leading-tight">
            Every bat is picked, pressed and balanced by hand.
          </h2>
          <p className="text-cream-muted leading-relaxed">
            We grade every cleft of willow ourselves, press it for the perfect
            rebound, and balance the pickup so the bat feels lighter than the
            scale says. That is the curve in OneCurve.
          </p>
        </div>
      </section>
    </>
  )
}
