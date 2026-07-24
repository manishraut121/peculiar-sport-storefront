"use server"

import { sdk } from "@lib/config"
import { getFlags } from "@lib/flags"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { HttpTypes } from "@medusajs/types"

export const listCartPaymentMethods = async (regionId: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("payment_providers")),
  }

  const flags = getFlags()

  return sdk.client
    .fetch<HttpTypes.StorePaymentProviderListResponse>(
      `/store/payment-providers`,
      {
        method: "GET",
        query: { region_id: regionId },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ payment_providers }) => {
      // Backend + region links are the source of truth for which providers exist.
      // Only hide Manual when flags say so (prod). Never hide Razorpay if the
      // API returns it — stage often has stale NEXT_PUBLIC_OC_FEATURE_FLAGS=dev.
      let list = payment_providers || []
      if (!flags.payments.manual_checkout) {
        list = list.filter((p) => !p.id?.includes("system_default"))
      }
      // Prefer Razorpay first for India checkout
      return list.sort((a, b) => {
        const score = (id: string) =>
          id.includes("razorpay") ? 0 : id.includes("system") ? 2 : 1
        return score(a.id) - score(b.id)
      })
    })
    .catch(() => {
      return null
    })
}
