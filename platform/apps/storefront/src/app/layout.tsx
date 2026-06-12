import { getBaseURL } from "@lib/util/env"
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
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-mode="dark"
      className={`${display.variable} ${body.variable}`}
    >
      <body className="font-body bg-ui-bg-base text-ui-fg-base antialiased">
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
