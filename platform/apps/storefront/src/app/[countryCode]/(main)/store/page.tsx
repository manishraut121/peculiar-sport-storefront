import { Metadata } from "next"

import { STORE_SEO, SEO } from "@lib/brand/seo-copy"
import { listProducts } from "@lib/data/products"
import { getBaseURL } from "@lib/util/env"
import { jsonLd } from "@lib/util/json-ld"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export async function generateMetadata(props: {
  params: Promise<{ countryCode: string }>
}): Promise<Metadata> {
  const { countryCode } = await props.params
  const title = STORE_SEO.title
  const description = STORE_SEO.description
  const canonical = `${getBaseURL()}/${countryCode}/store`
  return {
    title: { absolute: title },
    description,
    keywords: [
      "cricket equipment online India",
      "buy cricket bat",
      "cricket pads gloves",
      "OneCurve store",
    ],
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: "en_IN",
      siteName: SEO.brandLegal,
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  }
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { sortBy, page } = searchParams

  // ItemList JSON-LD → helps Google understand the catalog as a collection.
  // Same cached listProducts call the grid uses, so no extra backend load.
  let itemList: Record<string, any> | null = null
  try {
    const { response } = await listProducts({
      countryCode: params.countryCode,
      queryParams: { limit: 24, fields: "handle,title" } as any,
    })
    const base = getBaseURL()
    itemList = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "OneCurve cricket equipment",
      numberOfItems: response.count,
      itemListElement: response.products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.title,
        url: `${base}/${params.countryCode}/products/${p.handle}`,
      })),
    }
  } catch (e) {
    // schema is progressive enhancement — never block the page
  }

  return (
    <>
      {itemList && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(itemList) }}
        />
      )}
      <StoreTemplate
        sortBy={sortBy}
        page={page}
        countryCode={params.countryCode}
      />
    </>
  )
}
