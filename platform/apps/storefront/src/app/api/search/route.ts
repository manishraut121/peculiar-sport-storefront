import { NextRequest, NextResponse } from "next/server"
import { listProducts } from "@lib/data/products"
import { DEFAULT_REGION } from "@lib/util/env"

/* Instant-search proxy: runs server-side so the publishable key and region
 * logic stay in one place. Returns a light payload for the overlay. */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim().slice(0, 80)
  if (q.length < 2) {
    return NextResponse.json({ results: [] })
  }
  try {
    const { response } = await listProducts({
      countryCode: DEFAULT_REGION,
      queryParams: { q, limit: 6 } as any,
    })
    const results = response.products.map((p) => {
      const cheapest = (p.variants || [])
        .map((v: any) => v?.calculated_price?.calculated_amount)
        .filter((n: any) => typeof n === "number")
        .sort((a: number, b: number) => a - b)[0]
      return {
        title: p.title,
        handle: p.handle,
        thumbnail: p.thumbnail,
        category: p.categories?.[0]?.name || null,
        price: typeof cheapest === "number" ? cheapest : null,
        mrp: Number((p.metadata as any)?.mrp) || null,
      }
    })
    return NextResponse.json({ results })
  } catch (e) {
    return NextResponse.json({ results: [] }, { status: 200 })
  }
}
