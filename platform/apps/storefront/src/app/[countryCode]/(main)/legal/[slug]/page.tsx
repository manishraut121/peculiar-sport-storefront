import { Metadata } from "next"
import { notFound } from "next/navigation"
import { SEO } from "@lib/brand/seo-copy"
import { getBaseURL } from "@lib/util/env"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const PAGES: Record<
  string,
  { title: string; seo: string; h1: string; body: string[] }
> = {
  privacy: {
    title: "Privacy Policy | OneCurve Sports India",
    h1: "Privacy Policy",
    seo: "How OneCurve Sports collects and uses your data when you buy cricket equipment online in India. Contact support@onecurve.in for data requests.",
    body: [
      "OneCurve Sports (onecurve.in) sells cricket and performance sports equipment in India. We collect the information needed to process orders: name, email, phone, shipping address, and payment reference from Razorpay.",
      "We do not store full card numbers. Payments are handled by Razorpay. Order and account data lives in our own database on our hosting provider.",
      "We use your contact details to confirm orders, ship products, and respond to support requests. We do not sell personal data to third parties.",
      "You may request export or deletion of your account data by emailing support@onecurve.in.",
      "This policy will be updated as we add features (accounts, marketing email). Last updated: 2026-07.",
    ],
  },
  terms: {
    title: "Terms of Sale | OneCurve Sports India",
    h1: "Terms of Sale",
    seo: "Terms for purchasing cricket equipment and sports gear from OneCurve Sports online in India. Prices in INR; governing law India.",
    body: [
      "By placing an order on onecurve.in you agree to these terms. All prices are in INR and, unless stated otherwise, inclusive of applicable taxes.",
      "Orders are confirmed after successful payment (or COD acceptance, if offered). We reserve the right to cancel orders we cannot fulfil and will refund any amount paid.",
      "Product descriptions and grades are provided in good faith. Natural willow variation means grain and weight can differ slightly within a grade.",
      "Governing law: India. Disputes: courts of the seller's place of business.",
    ],
  },
  "shipping-returns": {
    title: "Shipping & Returns Policy | OneCurve Sports India",
    h1: "Shipping & Returns",
    seo: `OneCurve delivery timelines and returns for cricket equipment in India. Free shipping over ${SEO.freeShip}; ${SEO.delivery}; ${SEO.returns} returns on unused gear.`,
    body: [
      `We ship pan-India. Standard delivery is ${SEO.delivery} after dispatch. Free shipping applies on orders of ${SEO.freeShip} and above; otherwise a flat ${SEO.shipFee} shipping fee applies.`,
      "You will receive dispatch updates by email/SMS when available.",
      `Returns: unused items in original condition may be returned within ${SEO.returns} of delivery. Custom-knocked or used bats are not returnable. Contact support@onecurve.in with your order ID to start a return.`,
      "Refunds (when approved) are issued to the original payment method within 5–7 business days after we receive the return.",
    ],
  },
}

type Props = { params: Promise<{ slug: string; countryCode: string }> }

export async function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug, countryCode } = await props.params
  const page = PAGES[slug]
  if (!page) return {}
  const canonical = `${getBaseURL()}/${countryCode}/legal/${slug}`
  return {
    title: { absolute: page.title },
    description: page.seo,
    alternates: { canonical },
    openGraph: {
      title: page.title,
      description: page.seo,
      url: canonical,
      locale: "en_IN",
      siteName: SEO.brandLegal,
    },
    robots: { index: true, follow: true },
  }
}

export default async function LegalPage(props: Props) {
  const { slug } = await props.params
  const page = PAGES[slug]
  if (!page) notFound()

  return (
    <article
      className="content-container py-12 small:py-24"
      data-testid={`legal-page-${slug}`}
    >
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-signal font-bold mb-3 m-0">
          Legal
        </p>
        <h1 className="font-display font-extrabold text-3xl small:text-5xl text-ink mb-8 m-0 tracking-tight">
          {page.h1}
        </h1>
        <div className="flex flex-col gap-5 text-fog leading-relaxed text-sm small:text-base font-medium">
          {page.body.map((p, i) => (
            <p key={i} className="m-0">
              {p}
            </p>
          ))}
        </div>
        <p className="mt-10 text-sm m-0">
          <LocalizedClientLink
            href="/store"
            className="text-signal font-bold hover:underline"
          >
            ← Back to shop
          </LocalizedClientLink>
        </p>
      </div>
    </article>
  )
}
