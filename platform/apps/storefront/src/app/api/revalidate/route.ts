import { CATALOG_TAGS } from "@lib/data/catalog-cache"
import { revalidatePath, revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

/**
 * Bust storefront catalog cache after CMS (Medusa Admin) changes.
 *
 *   curl -X POST https://YOUR_SHOP/api/revalidate \
 *     -H "x-revalidate-secret: $REVALIDATE_SECRET"
 *
 * Optional body: { "paths": ["/in", "/in/store"] }
 * Without secret in env, allows open revalidate only when OC_ENV is dev/stage
 * (never open in prod without secret).
 */
export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET
  const header = req.headers.get("x-revalidate-secret") || ""
  const env = (process.env.NEXT_PUBLIC_OC_ENV || "dev").toLowerCase()
  const isProd = env === "prod" || env === "production"

  if (secret) {
    if (header !== secret) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
    }
  } else if (isProd) {
    return NextResponse.json(
      { ok: false, error: "REVALIDATE_SECRET not configured" },
      { status: 503 }
    )
  }

  for (const tag of CATALOG_TAGS) {
    revalidateTag(tag)
  }

  let paths: string[] = ["/", "/in", "/in/store"]
  try {
    const body = await req.json().catch(() => ({}))
    if (Array.isArray(body?.paths)) {
      paths = body.paths.map(String)
    }
  } catch {
    /* no body */
  }

  for (const p of paths) {
    try {
      revalidatePath(p)
    } catch {
      /* ignore invalid paths */
    }
  }

  return NextResponse.json({
    ok: true,
    revalidated: true,
    tags: CATALOG_TAGS,
    paths,
    at: new Date().toISOString(),
  })
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    hint: "POST with x-revalidate-secret to bust catalog cache",
  })
}
