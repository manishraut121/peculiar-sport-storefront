"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { catalogFetchOptions } from "./catalog-cache"

export const listRegions = async () => {
  const { next, cache } = catalogFetchOptions("regions")

  return await sdk.client
    .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      next,
      cache,
    })
    .then(({ regions }) => regions)
}

export const retrieveRegion = async (id: string) => {
  const { next, cache } = catalogFetchOptions("regions", id)

  return await sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      next,
      cache,
    })
    .then(({ region }) => region)
}

/** Resolve region from country code — no process-global Map (stale cache bug). */
export const getRegion = async (countryCode: string) => {
  const regions = await listRegions()

  if (!regions?.length) {
    return null
  }

  const regionMap = new Map<string, HttpTypes.StoreRegion>()
  regions.forEach((region) => {
    region.countries?.forEach((c) => {
      regionMap.set(c?.iso_2 ?? "", region)
    })
  })

  return countryCode
    ? regionMap.get(countryCode) ?? null
    : regionMap.get("in") ?? regionMap.values().next().value ?? null
}
