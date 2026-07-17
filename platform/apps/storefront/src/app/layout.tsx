import { getBaseURL } from "@lib/util/env"
import { jsonLd } from "@lib/util/json-ld"
import { Metadata } from "next"
import { Bebas_Neue, DM_Sans } from "next/font/google"
import "styles/globals.css"

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "OneCurve Sports — Premium Handcrafted Cricket Equipment",
    template: "%s | OneCurve Sports",
  },
  description:
    "Premium handcrafted English Willow cricket bats, pads and gloves. Made in India. Shop at onecurve.in.",
  applicationName: "OneCurve Sports",
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
    },
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-mode="light"
      className={`${display.variable} ${body.variable}`}
    >
      <body className="font-body bg-ui-bg-base text-ui-fg-base antialiased">
        {/* React hoists these into <head>: warm up the API origin early */}
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
                url: getBaseURL(),
                logo: `${getBaseURL()}/opengraph-image.jpg`,
                description:
                  "Premium handcrafted cricket equipment — English Willow bats, pads and gloves. Made in India.",
                areaServed: "IN",
                email: "support@onecurve.in",
              },
              {
                // Enables Google's sitelinks search box.
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "OneCurve Sports",
                url: getBaseURL(),
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: `${getBaseURL()}/in/store?q={search_term_string}`,
                  },
                  "query-input": "required name=search_term_string",
                },
              },
            ]),
          }}
        />
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
