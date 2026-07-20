import { Metadata } from "next"
import { notFound } from "next/navigation"
import { BLOG_POSTS, getPost } from "@lib/blog/posts"
import { SEO } from "@lib/brand/seo-copy"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getBaseURL } from "@lib/util/env"
import { jsonLd as toJsonLd } from "@lib/util/json-ld"

type Props = { params: Promise<{ countryCode: string; slug: string }> }

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug, countryCode } = await props.params
  const post = getPost(slug)
  if (!post) return {}
  const title = `${post.title} | OneCurve Blog`
  const url = `${getBaseURL()}/${countryCode}/blog/${post.slug}`
  return {
    title: { absolute: title },
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description: post.excerpt,
      url,
      publishedTime: post.date,
      locale: "en_IN",
      siteName: SEO.brandLegal,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.excerpt,
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

export default async function BlogPost(props: Props) {
  const { slug, countryCode } = await props.params
  const post = getPost(slug)
  if (!post) notFound()

  const base = getBaseURL()
  const pageUrl = `${base}/${countryCode}/blog/${post.slug}`
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      dateModified: post.date,
      author: { "@type": "Organization", name: SEO.brandLegal },
      publisher: {
        "@type": "Organization",
        name: SEO.brandLegal,
        url: base,
      },
      mainEntityOfPage: pageUrl,
      inLanguage: "en-IN",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${base}/${countryCode}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: `${base}/${countryCode}/blog`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: post.title,
          item: pageUrl,
        },
      ],
    },
  ]

  return (
    <article className="content-container py-10 small:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(schemas) }}
      />
      <div className="max-w-3xl mx-auto">
        <nav aria-label="Breadcrumb" className="text-xs text-fog mb-6">
          <ol className="flex flex-wrap items-center gap-2 list-none m-0 p-0">
            <li>
              <LocalizedClientLink href="/" className="hover:text-signal">
                Home
              </LocalizedClientLink>
            </li>
            <li aria-hidden>/</li>
            <li>
              <LocalizedClientLink href="/blog" className="hover:text-signal">
                Blog
              </LocalizedClientLink>
            </li>
            <li aria-hidden>/</li>
            <li className="text-ink font-medium truncate max-w-[12rem] small:max-w-none">
              {post.title}
            </li>
          </ol>
        </nav>

        <p className="text-xs uppercase tracking-[0.18em] text-fog m-0 font-semibold">
          <time dateTime={post.date}>{fmtDate(post.date)}</time>
          {" · "}
          {post.readMins} min read · {post.author}
        </p>
        <h1 className="font-display font-extrabold text-3xl small:text-5xl text-ink mt-3 leading-tight m-0 tracking-tight">
          {post.title}
        </h1>
        <p className="text-base small:text-lg text-fog mt-4 leading-relaxed m-0 font-medium">
          {post.excerpt}
        </p>
        <div className="mt-8 flex flex-col gap-5">
          {post.body.map((block, i) =>
            block.type === "h2" ? (
              <h2
                key={i}
                className="font-display font-extrabold text-xl small:text-2xl text-ink mt-4 m-0"
              >
                {block.text}
              </h2>
            ) : (
              <p
                key={i}
                className="text-fog leading-relaxed m-0 text-sm small:text-base font-medium"
              >
                {block.text}
              </p>
            )
          )}
        </div>

        <div className="mt-12 border-t border-line pt-8 flex flex-col xsmall:flex-row gap-3">
          <LocalizedClientLink
            href="/store"
            className="oc-btn oc-btn-primary"
          >
            Shop cricket gear
          </LocalizedClientLink>
          <LocalizedClientLink href="/blog" className="oc-btn oc-btn-dark">
            More guides
          </LocalizedClientLink>
        </div>
      </div>
    </article>
  )
}
