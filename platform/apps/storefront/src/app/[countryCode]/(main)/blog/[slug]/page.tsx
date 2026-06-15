import { Metadata } from "next"
import { notFound } from "next/navigation"
import { BLOG_POSTS, getPost } from "@lib/blog/posts"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getBaseURL } from "@lib/util/env"

type Props = { params: Promise<{ countryCode: string; slug: string }> }

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params
  const post = getPost(slug)
  if (!post) return {}
  const url = `${getBaseURL()}/blog/${post.slug}`
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url,
      publishedTime: post.date,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt },
  }
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

export default async function BlogPost(props: Props) {
  const { slug } = await props.params
  const post = getPost(slug)
  if (!post) notFound()

  const base = getBaseURL()
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: "OneCurve Sports" },
    publisher: {
      "@type": "Organization",
      name: "OneCurve Sports",
      url: base,
    },
    mainEntityOfPage: `${base}/blog/${post.slug}`,
  }

  return (
    <article className="content-container py-12 max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LocalizedClientLink
        href="/blog"
        className="text-sm text-ui-fg-muted hover:text-gold"
      >
        ← All articles
      </LocalizedClientLink>
      <span className="block mt-6 text-xs uppercase tracking-[0.18em] text-ui-fg-muted">
        {fmtDate(post.date)} · {post.readMins} min read
      </span>
      <h1 className="font-display text-4xl small:text-5xl text-ui-fg-base mt-3 leading-tight">
        {post.title}
      </h1>
      <p className="text-lg text-ui-fg-subtle mt-4 leading-relaxed">
        {post.excerpt}
      </p>
      <div className="mt-8 flex flex-col gap-5">
        {post.body.map((block, i) =>
          block.type === "h2" ? (
            <h2
              key={i}
              className="font-display text-2xl text-ui-fg-base mt-4"
            >
              {block.text}
            </h2>
          ) : (
            <p key={i} className="text-ui-fg-subtle leading-relaxed">
              {block.text}
            </p>
          )
        )}
      </div>

      <div className="mt-12 border-t border-ui-border-base pt-8">
        <LocalizedClientLink
          href="/store"
          className="inline-block px-8 py-3 rounded-full bg-gold text-ink font-medium hover:bg-gold-hover transition-colors"
        >
          Shop the range
        </LocalizedClientLink>
      </div>
    </article>
  )
}
