import { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"

export default function robots(): MetadataRoute.Robots {
  const base = getBaseURL()
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/*/checkout", "/*/account", "/*/cart"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
