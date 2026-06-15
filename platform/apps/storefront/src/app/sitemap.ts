import { MetadataRoute } from "next"
import { listProducts } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"
import { BLOG_POSTS } from "@lib/blog/posts"
import { getBaseURL, DEFAULT_REGION } from "@lib/util/env"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseURL()
  const r = DEFAULT_REGION
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/${r}`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/${r}/store`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/${r}/blog`, changeFrequency: "weekly", priority: 0.6 },
  ]

  let productRoutes: MetadataRoute.Sitemap = []
  try {
    const { response } = await listProducts({
      countryCode: r,
      queryParams: { limit: 100, fields: "handle" } as any,
    })
    productRoutes = response.products.map((p) => ({
      url: `${base}/${r}/products/${p.handle}`,
      changeFrequency: "weekly",
      priority: 0.8,
    }))
  } catch (e) {
    // backend unavailable at build — static + blog still emitted
  }

  let categoryRoutes: MetadataRoute.Sitemap = []
  try {
    const cats = await listCategories()
    categoryRoutes = (cats || []).map((c: any) => ({
      url: `${base}/${r}/categories/${c.handle}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }))
  } catch (e) {}

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${base}/${r}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.5,
  }))

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes].map(
    (e) => ({ lastModified: e.lastModified || now, ...e })
  )
}
