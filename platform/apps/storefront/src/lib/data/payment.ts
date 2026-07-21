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
      let list = payment_providers || []
      // Prod: hide manual "place order without pay"
      if (!flags.payments.manual_checkout) {
        list = list.filter((p) => !p.id?.includes("system_default"))
      }
      // Hide Razorpay option if flag off (provider may still be registered)
      if (!flags.payments.razorpay) {
        list = list.filter((p) => !p.id?.includes("razorpay"))
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
