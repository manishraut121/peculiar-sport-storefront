"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"

import { catalogFetchOptions } from "./catalog-cache"
import { getAuthHeaders } from "./cookies"

export const retrieveVariant = async (
  variant_id: string
): Promise<HttpTypes.StoreProductVariant | null> => {
  const authHeaders = await getAuthHeaders()

  if (!authHeaders) return null

  const headers = {
    ...authHeaders,
  }

  const { next, cache } = catalogFetchOptions("products", "variants")

  return await sdk.client
    .fetch<{ variant: HttpTypes.StoreProductVariant }>(
      `/store/product-variants/${variant_id}`,
      {
        method: "GET",
        query: {
          fields: "*images",
        },
        headers,
        next,
        cache,
      }
    )
    .then(({ variant }) => variant)
    .catch(() => null)
}
