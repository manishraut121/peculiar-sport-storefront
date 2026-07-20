import { Metadata } from "next"
import { BLOG_POSTS } from "@lib/blog/posts"
import { SEO } from "@lib/brand/seo-copy"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getBaseURL } from "@lib/util/env"
import { jsonLd } from "@lib/util/json-ld"

type Props = { params: Promise<{ countryCode: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { countryCode } = await props.params
  const title =
    "Cricket Bat Guides & Gear Tips | OneCurve Blog India"
  const description =
    "Learn how to choose an English Willow cricket bat, knock in a new bat, and pick keeping gear. Straight advice from OneCurve for players in India."
  const canonical = `${getBaseURL()}/${countryCode}/blog`
  return {
    title: { absolute: title },
    description,
    keywords: [
      "how to choose cricket bat",
      "knocking in cricket bat",
      "wicket keeping gear guide",
      "cricket tips India",
    ],
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: "en_IN",
      siteName: SEO.brandLegal,
      type: "website",
    },
    robots: { index: true, follow: true },
  }
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

export default async function BlogIndex(props: Props) {
  const { countryCode } = await props.params
  const base = getBaseURL()
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "OneCurve cricket guides",
    numberOfItems: BLOG_POSTS.length,
    itemListElement: BLOG_POSTS.map((post, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: post.title,
      url: `${base}/${countryCode}/blog/${post.slug}`,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(itemList) }}
      />
      <header className="border-b border-line bg-mute">
        <div className="content-container py-12 small:py-16">
          <p className="text-xs uppercase tracking-[0.2em] text-signal font-bold m-0">
            OneCurve Journal
          </p>
          <h1 className="font-display font-extrabold text-3xl small:text-6xl text-ink mt-2 m-0 tracking-tight">
            Cricket guides &amp; equipment tips
          </h1>
          <p className="mt-3 max-w-2xl text-fog text-sm small:text-base leading-relaxed font-medium m-0">
            Straight-talking advice on choosing English Willow bats, knocking
            in kit, and caring for cricket gear — written for players shopping
            online in India.
          </p>
        </div>
      </header>

      <div className="content-container py-10 small:py-12">
        <ul className="grid grid-cols-1 small:grid-cols-3 gap-5 small:gap-8 list-none m-0 p-0">
          {BLOG_POSTS.map((post) => (
            <li key={post.slug} className="min-w-0">
              <article className="h-full">
                <LocalizedClientLink
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col h-full rounded-2xl border border-line p-6 hover:border-signal transition-colors bg-white"
                  data-testid={`blog-card-${post.slug}`}
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-fog m-0 font-semibold">
                    <time dateTime={post.date}>{fmtDate(post.date)}</time>
                    {" · "}
                    {post.readMins} min read
                  </p>
                  <h2 className="font-display font-extrabold text-xl small:text-2xl text-ink mt-3 group-hover:text-signal transition-colors leading-tight m-0">
                    {post.title}
                  </h2>
                  <p className="text-fog text-sm mt-3 leading-relaxed flex-1 m-0 font-medium">
                    {post.excerpt}
                  </p>
                  <span className="mt-5 text-signal text-sm font-bold">
                    Read guide →
                  </span>
                </LocalizedClientLink>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
