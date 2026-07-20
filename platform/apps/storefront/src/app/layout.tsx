import { getBaseURL } from "@lib/util/env"
import { jsonLd } from "@lib/util/json-ld"
import { Metadata } from "next"
import { Nunito_Sans, Rubik } from "next/font/google"
import "styles/globals.css"

/* Studio Curve v3 — Rubik display + Nunito Sans body (retail / performance) */
const display = Rubik({
  weight: ["600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  adjustFontFallback: true,
  preload: true,
})

const body = Nunito_Sans({
  weight: ["400", "500", "600", "700"],
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
      "OneCurve — Cricket Bats, Pads & Performance Gear | Buy Online India",
    template: "%s | OneCurve",
  },
  description:
    "Shop premium cricket equipment online in India — English Willow bats, pads, gloves. Free shipping over ₹2,999. Training, nutrition & recovery guides live.",
  applicationName: "OneCurve",
  keywords: [
    "cricket bat online India",
    "English Willow cricket bat",
    "buy cricket pads gloves",
    "OneCurve",
    "performance sports equipment India",
    "cricket kit online",
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
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
}

/** Viewport for latest iOS/Android — notch safe-area + no accidental zoom traps */
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover" as const,
  themeColor: "#FAFAF8",
}

export default function RootLayout(props: { children: React.ReactNode }) {
  const base = getBaseURL()
  return (
    <html
      lang="en-IN"
      data-mode="light"
      className={`${display.variable} ${body.variable}`}
    >
      <body className="font-body bg-paper text-ink antialiased overflow-x-clip">
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
        <main className="relative w-full min-w-0" id="main-content">
          {props.children}
        </main>
      </body>
    </html>
  )
}
