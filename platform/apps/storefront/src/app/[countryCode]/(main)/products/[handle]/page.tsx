import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"
import { getBaseURL } from "@lib/util/env"
import { getProductPrice } from "@lib/util/get-product-price"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

export async function generateStaticParams() {
  try {
    const countryCodes = await listRegions().then((regions) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )

    if (!countryCodes) {
      return []
    }

    const promises = countryCodes.map(async (country) => {
      const { response } = await listProducts({
        countryCode: country,
        queryParams: { limit: 100, fields: "handle" },
      })

      return {
        country,
        products: response.products,
      }
    })

    const countryProducts = await Promise.all(promises)

    return countryProducts
      .flatMap((countryData) =>
        countryData.products.map((product) => ({
          countryCode: countryData.country,
          handle: product.handle,
        }))
      )
      .filter((param) => param.handle)
  } catch (error) {
    console.error(
      `Failed to generate static paths for product pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }.`
    )
    return []
  }
}

function getImagesForVariant(
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string
) {
  if (!selectedVariantId || !product.variants) {
    return product.images
  }

  const variant = product.variants!.find((v) => v.id === selectedVariantId)
  if (!variant || !variant.images?.length) {
    return product.images
  }

  const imageIdsMap = new Map(variant.images!.map((i) => [i.id, true]))
  return product.images?.filter((i) => imageIdsMap.has(i.id)) ?? null
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle } = params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const product = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle },
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  const meta = (product.metadata as any) || {}
  const title = meta.seo_title || `${product.title} | OneCurve Sports`
  const description =
    meta.seo_desc ||
    product.description?.slice(0, 160) ||
    `${product.title} — shop at OneCurve.`
  const canonical = `${getBaseURL()}/${params.countryCode}/products/${handle}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)
  const searchParams = await props.searchParams

  const selectedVariantId = searchParams.v_id

  if (!region) {
    notFound()
  }

  const pricedProduct = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle: params.handle },
  }).then(({ response }) => response.products[0])

  const images = getImagesForVariant(pricedProduct, selectedVariantId)

  if (!pricedProduct) {
    notFound()
  }

  const base = getBaseURL()
  const cc = params.countryCode
  const meta = (pricedProduct.metadata as any) || {}
  const { cheapestPrice } = getProductPrice({ product: pricedProduct })
  const price = cheapestPrice?.calculated_price_number
  const inStock = pricedProduct.variants?.some(
    (v: any) =>
      !v.manage_inventory ||
      v.allow_backorder ||
      (v.inventory_quantity || 0) > 0
  )

  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: pricedProduct.title,
    description:
      meta.seo_desc || pricedProduct.description || pricedProduct.title,
    image: pricedProduct.thumbnail ? [pricedProduct.thumbnail] : undefined,
    brand: { "@type": "Brand", name: "OneCurve" },
    category: pricedProduct.categories?.[0]?.name,
    sku: pricedProduct.variants?.[0]?.sku,
  }
  if (price) {
    jsonLd.offers = {
      "@type": "Offer",
      url: `${base}/${cc}/products/${pricedProduct.handle}`,
      priceCurrency: "INR",
      price: String(price),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "OneCurve Sports" },
    }
  }

  const breadcrumb = {
    "@context": "https://schema.org/",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${base}/${cc}` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: `${base}/${cc}/store`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: pricedProduct.title,
        item: `${base}/${cc}/products/${pricedProduct.handle}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={params.countryCode}
        images={images ?? []}
      />
    </>
  )
}
