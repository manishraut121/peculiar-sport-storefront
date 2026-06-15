import { Metadata } from "next"
import { BLOG_POSTS } from "@lib/blog/posts"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getBaseURL } from "@lib/util/env"

export const metadata: Metadata = {
  title: "Blog — Cricket Guides & Tips",
  description:
    "Cricket equipment guides, bat care, and gear advice from OneCurve. Learn how to choose, knock in and look after your kit.",
  alternates: { canonical: `${getBaseURL()}/blog` },
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

export default function BlogIndex() {
  return (
    <>
      <div className="border-b border-ui-border-base bg-ui-bg-subtle">
        <div className="content-container py-12">
          <span className="text-xs uppercase tracking-[0.25em] text-ui-fg-muted">
            OneCurve Journal
          </span>
          <h1 className="font-display text-5xl small:text-6xl text-ui-fg-base mt-2">
            Cricket guides &amp; tips
          </h1>
          <p className="mt-3 max-w-2xl text-ui-fg-subtle">
            Straight-talking advice on choosing, knocking in and caring for your
            cricket gear — from our workshop to your crease.
          </p>
        </div>
      </div>

      <div className="content-container py-12">
        <ul className="grid grid-cols-1 small:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post) => (
            <li key={post.slug}>
              <LocalizedClientLink
                href={`/blog/${post.slug}`}
                className="group flex flex-col h-full rounded-2xl border border-ui-border-base p-6 hover:border-gold transition-colors"
                data-testid={`blog-card-${post.slug}`}
              >
                <span className="text-xs uppercase tracking-[0.18em] text-ui-fg-muted">
                  {fmtDate(post.date)} · {post.readMins} min read
                </span>
                <h2 className="font-display text-2xl text-ui-fg-base mt-3 group-hover:text-gold transition-colors leading-tight">
                  {post.title}
                </h2>
                <p className="text-ui-fg-subtle text-sm mt-3 leading-relaxed flex-1">
                  {post.excerpt}
                </p>
                <span className="mt-5 text-gold text-sm font-medium uppercase tracking-wide">
                  Read more →
                </span>
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
