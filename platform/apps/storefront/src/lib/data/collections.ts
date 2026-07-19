"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { catalogFetchOptions } from "./catalog-cache"

export const retrieveCollection = async (id: string) => {
  const { next, cache } = catalogFetchOptions("collections")

  return await sdk.client
    .fetch<{ collection: HttpTypes.StoreCollection }>(
      `/store/collections/${id}`,
      {
        next,
        cache,
      }
    )
    .then(({ collection }) => collection)
}

export const listCollections = async (
  queryParams: Record<string, string> = {}
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> => {
  const { next, cache } = catalogFetchOptions("collections")

  queryParams.limit = queryParams.limit || "100"
  queryParams.offset = queryParams.offset || "0"

  return await sdk.client
    .fetch<{ collections: HttpTypes.StoreCollection[]; count: number }>(
      "/store/collections",
      {
        query: queryParams,
        next,
        cache,
      }
    )
    .then(({ collections }) => ({ collections, count: collections.length }))
}

export const getCollectionByHandle = async (
  handle: string
): Promise<HttpTypes.StoreCollection | null> => {
  const { next, cache } = catalogFetchOptions("collections")

  return await sdk.client
    .fetch<HttpTypes.StoreCollectionListResponse>(`/store/collections`, {
      query: { handle, fields: "*products" },
      next,
      cache,
    })
    .then(({ collections }) => collections[0] || null)
}
