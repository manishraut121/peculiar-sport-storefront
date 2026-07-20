import { Metadata } from "next"
import { notFound } from "next/navigation"

import { categorySeo, SEO } from "@lib/brand/seo-copy"
import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { getBaseURL } from "@lib/util/env"
import { jsonLd } from "@lib/util/json-ld"
import { HttpTypes, StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
}

export async function generateStaticParams() {
  const product_categories = await listCategories()

  if (!product_categories) {
    return []
  }

  const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
    regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
  )

  const categoryHandles = product_categories.map(
    (category: HttpTypes.StoreProductCategory) => category.handle
  )

  const staticParams = countryCodes
    ?.map((countryCode: string | undefined) =>
      categoryHandles.map((handle: string) => ({
        countryCode,
        category: [handle],
      }))
    )
    .flat()

  return staticParams
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  try {
    const productCategory = await getCategoryByHandle(params.category)
    const name = productCategory.name
    const seo = categorySeo(productCategory.handle || "", name)
    const title = productCategory.description
      ? `${name} — Shop Online | OneCurve India`
      : seo.title
    const description =
      productCategory.description?.replace(/\s+/g, " ").slice(0, 160) ||
      seo.description
    const canonical = `${getBaseURL()}/${params.countryCode}/categories/${params.category.join("/")}`

    return {
      title: { absolute: title },
      description,
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
  } catch {
    notFound()
  }
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams

  const productCategory = await getCategoryByHandle(params.category)

  if (!productCategory) {
    notFound()
  }

  const base = getBaseURL()
  const path = params.category.join("/")
  const url = `${base}/${params.countryCode}/categories/${path}`
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${base}/${params.countryCode}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: `${base}/${params.countryCode}/store`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: productCategory.name,
        item: url,
      },
    ],
  }
  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: productCategory.name,
    description:
      productCategory.description ||
      categorySeo(productCategory.handle || "", productCategory.name)
        .description,
    url,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd([breadcrumb, collection]),
        }}
      />
      <CategoryTemplate
        category={productCategory}
        sortBy={sortBy}
        page={page}
        countryCode={params.countryCode}
      />
    </>
  )
}
