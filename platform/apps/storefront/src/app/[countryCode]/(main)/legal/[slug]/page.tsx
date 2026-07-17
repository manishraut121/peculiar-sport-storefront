import { Metadata } from "next"
import { notFound } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const PAGES: Record<
  string,
  { title: string; seo: string; body: string[] }
> = {
  privacy: {
    title: "Privacy Policy",
    seo: "How OneCurve Sports collects and uses your data.",
    body: [
      "OneCurve Sports (onecurve.in) sells cricket equipment in India. We collect the information needed to process orders: name, email, phone, shipping address, and payment reference from Razorpay.",
      "We do not store full card numbers. Payments are handled by Razorpay. Order and account data lives in our own database on our hosting provider.",
      "We use your contact details to confirm orders, ship products, and respond to support requests. We do not sell personal data.",
      "You may request export or deletion of your account data by emailing support@onecurve.in.",
      "This policy will be updated as we add features (accounts, marketing email). Last updated: 2026-07.",
    ],
  },
  terms: {
    title: "Terms of Sale",
    seo: "Terms for purchasing from OneCurve Sports.",
    body: [
      "By placing an order on onecurve.in you agree to these terms. All prices are in INR and, unless stated otherwise, inclusive of applicable taxes.",
      "Orders are confirmed after successful payment (or COD acceptance, if offered). We reserve the right to cancel orders we cannot fulfil and will refund any amount paid.",
      "Product descriptions and grades are provided in good faith. Natural willow variation means grain and weight can differ slightly within a grade.",
      "Governing law: India. Disputes: courts of the seller's place of business.",
    ],
  },
  "shipping-returns": {
    title: "Shipping & Returns",
    seo: "Delivery timelines and return policy for OneCurve Sports.",
    body: [
      "We ship pan-India. Standard delivery is 3–5 business days after dispatch. Free shipping applies on orders of ₹2,999 and above; otherwise a flat ₹199 shipping fee applies.",
      "You will receive dispatch updates by email/SMS when available.",
      "Returns: unused items in original condition may be returned within 7 days of delivery. Custom-knocked or used bats are not returnable. Contact support@onecurve.in with your order ID to start a return.",
      "Refunds (when approved) are issued to the original payment method within 5–7 business days after we receive the return.",
    ],
  },
}

type Props = { params: Promise<{ slug: string; countryCode: string }> }

export async function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params
  const page = PAGES[slug]
  if (!page) return {}
  return { title: page.title, description: page.seo }
}

export default async function LegalPage(props: Props) {
  const { slug } = await props.params
  const page = PAGES[slug]
  if (!page) notFound()

  return (
    <div
      className="content-container py-16 small:py-24 max-w-3xl"
      data-testid={`legal-page-${slug}`}
    >
      <p className="text-xs uppercase tracking-[0.2em] text-gold mb-3">Legal</p>
      <h1 className="font-display text-4xl small:text-5xl mb-8">{page.title}</h1>
      <div className="flex flex-col gap-5 text-ui-fg-subtle leading-relaxed text-sm small:text-base">
        {page.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <p className="mt-10 text-sm">
        <LocalizedClientLink href="/" className="text-gold hover:underline">
          ← Back to shop
        </LocalizedClientLink>
      </p>
    </div>
  )
}
