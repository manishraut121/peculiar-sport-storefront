/**
 * Catalog cache policy — Medusa Admin is source of truth (CMS).
 *
 * Stage/dev: short revalidate so price/title/desc/image edits show fast (near-WYSIWYG).
 * Prod: slightly longer for performance; still auto-refreshes.
 *
 * Instant bust: POST /api/revalidate with header x-revalidate-secret
 *   (set REVALIDATE_SECRET in storefront env; optional webhook from ops).
 */

export type CatalogFetchInit = {
  cache: "force-cache"
  next: { revalidate: number; tags: string[] }
}

/** Seconds before Next refetches catalog data from Medusa */
export function catalogRevalidateSeconds(): number {
  const raw = process.env.CATALOG_REVALIDATE_SECONDS
  if (raw && !Number.isNaN(Number(raw))) {
    return Math.max(0, Number(raw))
  }
  const env = (process.env.NEXT_PUBLIC_OC_ENV || "dev").toLowerCase()
  if (env === "prod" || env === "production") return 60
  // stage + dev: near live after Admin save (refresh within ~15s)
  return 15
}

/**
 * Use for products, categories, collections, regions.
 * Always tags `catalog` so one revalidate busts all shop listing data.
 */
export function catalogFetchOptions(
  ...tags: string[]
): CatalogFetchInit {
  const revalidate = catalogRevalidateSeconds()
  const unique = Array.from(new Set(["catalog", ...tags.filter(Boolean)]))
  return {
    cache: "force-cache",
    next: {
      revalidate,
      tags: unique,
    },
  }
}

/** All tags used for storefront catalog busting */
export const CATALOG_TAGS = [
  "catalog",
  "products",
  "categories",
  "collections",
  "regions",
] as const
