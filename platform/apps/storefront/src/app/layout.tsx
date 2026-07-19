import { getBaseURL } from "@lib/util/env"
import { jsonLd } from "@lib/util/json-ld"
import { Metadata } from "next"
import { Barlow, Barlow_Condensed } from "next/font/google"
import "styles/globals.css"

/* Night Pitch brand type — athletic condensed display + clean body (BRAND.md) */
const display = Barlow_Condensed({
  weight: ["600", "700"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  adjustFontFallback: true,
  preload: true,
})

const body = Barlow({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  adjustFontFallback: true,
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default:
      "OneCurve Sports — Precision English Willow Cricket Bats | India",
    template: "%s | OneCurve Sports",
  },
  description:
    "The perfect curve. Handcrafted English Willow cricket bats, pads and gloves. Made in India. Free shipping over ₹2,999.",
  applicationName: "OneCurve Sports",
  keywords: [
    "English Willow cricket bat",
    "cricket equipment India",
    "OneCurve",
    "handcrafted cricket bat",
  ],
  openGraph: {
    siteName: "OneCurve Sports",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "geo.region": "IN",
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  const base = getBaseURL()
  return (
    <html
      lang="en-IN"
      data-mode="light"
      className={`${display.variable} ${body.variable}`}
    >
      <body className="font-body bg-ui-bg-base text-ui-fg-base antialiased">
        <link
          rel="preconnect"
          href={
            process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
            "http://localhost:9000"
          }
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "OneCurve Sports",
                url: base,
                logo: `${base}/opengraph-image.jpg`,
                description:
                  "Performance sports equipment for India — cricket, training and more. One inventory, pan-India delivery.",
                areaServed: { "@type": "Country", name: "India" },
                email: "support@onecurve.in",
                contactPoint: {
                  "@type": "ContactPoint",
                  email: "support@onecurve.in",
                  contactType: "customer service",
                  areaServed: "IN",
                  availableLanguage: ["English", "Hindi"],
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "OneCurve Sports",
                url: base,
                inLanguage: "en-IN",
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: `${base}/in/store?q={search_term_string}`,
                  },
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "Store",
                name: "OneCurve Sports",
                url: base,
                priceRange: "₹₹₹",
                currenciesAccepted: "INR",
                paymentAccepted: "UPI, Credit Card, Debit Card, Net Banking",
                address: {
                  "@type": "PostalAddress",
                  addressCountry: "IN",
                },
              },
            ]),
          }}
        />
        <main className="relative" id="main-content">
          {props.children}
        </main>
      </body>
    </html>
  )
}
