/**
 * Site-wide SEO copy & metadata helpers.
 * Keyword focus (India ecommerce): cricket bat, English willow, pads, gloves,
 * free shipping, buy online India — written naturally for readers first.
 */

export const SEO = {
  brand: "OneCurve",
  brandLegal: "OneCurve Sports",
  domain: "onecurve.in",
  market: "India",
  freeShip: "₹2,999",
  shipFee: "₹199",
  delivery: "3–5 business days",
  returns: "7 days",
  support: "support@onecurve.in",
} as const

export const HOME_SEO = {
  title:
    "OneCurve — Cricket Bats, Pads & Performance Gear | Buy Online India",
  description:
    "Shop premium cricket equipment online in India — English Willow bats, pads, gloves and keeping gear. Free shipping over ₹2,999. Training, nutrition & recovery guides live. Made for serious players.",
  keywords: [
    "cricket bat online India",
    "English Willow cricket bat",
    "buy cricket pads gloves",
    "performance sports equipment India",
    "OneCurve cricket",
    "cricket kit online",
  ],
  h1: "Move with the curve.",
  heroSub:
    "Premium cricket equipment for India — bats, pads and gloves live today. Training, nutrition and recovery advice free on OneCurve.",
  aboutTitle: "Performance sports equipment for India",
  aboutBody: [
    "OneCurve is a multi-discipline sports store built for Indian athletes. We started with cricket — handcrafted bats, protective gear and keeping kit with honest grades and clear stock — and we are expanding into training, nutrition and recovery on the same cart and inventory.",
    "Every product is managed from our CMS, priced in INR, and shipped pan-India. Free delivery on orders of ₹2,999 and above. Pay securely with UPI, cards or net-banking.",
  ],
  whyTitle: "Why buy cricket gear from OneCurve?",
  whyPoints: [
    {
      title: "Spec-honest catalogue",
      body: "Willow grades, weights and categories are written for players — not empty marketing copy.",
    },
    {
      title: "One inventory, pan-India",
      body: "Live stock from the warehouse. Free shipping over ₹2,999; ₹199 below. Typical delivery 3–5 business days.",
    },
    {
      title: "Multi-discipline platform",
      body: "Cricket is live. Training, nutrition and recovery guides are here; gear launches on the same store.",
    },
  ],
} as const

export const STORE_SEO = {
  title: "Shop Cricket Equipment Online — Bats, Pads, Gloves | OneCurve India",
  description:
    "Browse OneCurve’s full cricket catalogue: English Willow bats, batting pads, gloves and keeping gear. Free shipping over ₹2,999 pan-India. Secure UPI & card checkout.",
  h1: "Shop cricket equipment online",
  intro:
    "Buy performance cricket gear from OneCurve — bats for every grade, protective pads and gloves, and keeping kit. All prices in INR with free shipping on orders of ₹2,999 and above.",
  outroTitle: "Buying cricket kit online in India",
  outro: [
    "Choosing a bat online is easier when grades and weights are clear. Our store lists English Willow and Kashmir options with the specs players actually use. Pair a bat with pads and gloves for a match-ready kit.",
    "Orders ship pan-India in 3–5 business days after dispatch. Unused items can be returned within 7 days — see Shipping & Returns for full details.",
  ],
} as const

/** Fallback SEO when Medusa category has no description */
export const CATEGORY_SEO: Record<
  string,
  { titleSuffix: string; description: string; intro: string }
> = {
  bats: {
    titleSuffix: "English Willow & Kashmir Cricket Bats",
    description:
      "Shop cricket bats online in India — English Willow and Kashmir grades, player and club options. Free shipping over ₹2,999 at OneCurve.",
    intro:
      "Browse cricket bats by grade and style. From English Willow player editions to club and Kashmir options for nets and tennis-ball cricket — honest specs, live stock, pan-India delivery.",
  },
  pads: {
    titleSuffix: "Batting Pads & Protection",
    description:
      "Buy cricket batting pads online in India. Lightweight protection for club and match play. Free shipping over ₹2,999 — OneCurve.",
    intro:
      "Cricket batting pads built for movement and protection. Find a fit that stays locked in through long innings — shop OneCurve pads with free shipping over ₹2,999.",
  },
  gloves: {
    titleSuffix: "Batting & Keeping Gloves",
    description:
      "Shop cricket batting gloves and wicket-keeping gloves online in India. Comfort, grip and protection — free shipping over ₹2,999.",
    intro:
      "Batting and keeping gloves for Indian conditions — soft palms, secure fit, and durability for nets and match days. Free shipping on orders ₹2,999+.",
  },
  keeping: {
    titleSuffix: "Wicket-Keeping Gear",
    description:
      "Wicket-keeping gloves and pads online in India. Built for long days behind the stumps. Free shipping over ₹2,999 — OneCurve.",
    intro:
      "Keeping gear for full sessions behind the stumps — gloves, pads and essentials chosen for comfort and control.",
  },
  balls: {
    titleSuffix: "Cricket Balls",
    description:
      "Shop cricket balls online in India for match and nets. Free shipping over ₹2,999 at OneCurve.",
    intro:
      "Match and practice cricket balls for nets and games — stock updates live from our warehouse.",
  },
}

export function categorySeo(handle: string, name: string) {
  const key = handle.toLowerCase().split("/").pop() || handle
  const fallback = CATEGORY_SEO[key]
  if (fallback) {
    return {
      title: `${name} — ${fallback.titleSuffix} | OneCurve India`,
      description: fallback.description,
      intro: fallback.intro,
    }
  }
  return {
    title: `${name} — Shop Online | OneCurve Sports India`,
    description: `Shop ${name} at OneCurve. Performance cricket and sports equipment for India. Free shipping over ₹2,999 pan-India.`,
    intro: `Explore ${name} from OneCurve — performance equipment with clear pricing in INR, free shipping over ₹2,999, and pan-India delivery in ${SEO.delivery}.`,
  }
}

export const DISCIPLINE_EXTRA = {
  training: {
    bodyTitle: "Training equipment for cricket and multi-sport athletes",
    body: [
      "Strength and conditioning equipment will join the OneCurve catalogue soon — resistance tools, mobility gear and gym essentials managed from the same CMS as our cricket range.",
      "Until products launch, use this hub for practical training advice aimed at cricket players and multi-sport athletes in India: progressive overload, power work that transfers to the field, and recovery that protects your next session.",
    ],
    keywords: [
      "cricket training India",
      "strength conditioning athletes",
      "gym equipment coming soon",
    ],
  },
  nutrition: {
    bodyTitle: "Sports nutrition for Indian athletes",
    body: [
      "Performance nutrition products are on the OneCurve roadmap — transparent labelling, no miracle claims, and the same trusted checkout as our cricket store.",
      "These guides cover session fuelling, protein distribution and hydration in Indian heat so you can train hard while products are still coming soon.",
    ],
    keywords: [
      "sports nutrition India",
      "athlete diet tips",
      "hydration training heat",
    ],
  },
  recovery: {
    bodyTitle: "Recovery habits that keep you available",
    body: [
      "Recovery tools and care products will appear here and in the main store when ready. Sleep, active recovery and early injury signals matter more than any gadget.",
      "Bookmark this page for deload timing, mobility habits and rest-day nutrition while OneCurve recovery gear is still coming soon.",
    ],
    keywords: [
      "athlete recovery India",
      "sports mobility rest",
      "injury prevention tips",
    ],
  },
} as const

/** Expand FAQ answers for richer FAQPage schema + on-page SEO */
export const SITE_FAQS: { q: string; a: string }[] = [
  {
    q: "Where can I buy cricket bats online in India from OneCurve?",
    a: "Shop the full OneCurve cricket catalogue at onecurve.in — English Willow and Kashmir bats, pads, gloves and keeping gear. Free shipping on orders of ₹2,999 and above, pan-India delivery in 3–5 business days.",
  },
  {
    q: "How long does delivery take?",
    a: "We ship pan-India. Standard delivery is 3–5 business days after dispatch. Free shipping on orders of ₹2,999+; ₹199 below that threshold.",
  },
  {
    q: "What payment methods do you accept?",
    a: "UPI, credit/debit cards, and net-banking via Razorpay. All prices are in INR and include applicable taxes unless stated otherwise.",
  },
  {
    q: "Do I need to knock in a new English Willow cricket bat?",
    a: "Yes. Knock in gently over a couple of weeks before match pace. This compresses the face and edges, reduces the risk of surface cracks, and helps the bat perform. See our blog guide on knocking in a new bat.",
  },
  {
    q: "What is your return policy on cricket equipment?",
    a: "Unused items in original packaging may be returned within 7 days of delivery. Custom-knocked or used bats are not returnable. Email support@onecurve.in with your order ID to start a return.",
  },
  {
    q: "Will OneCurve sell training gear and sports nutrition?",
    a: "Yes. OneCurve is multi-discipline: cricket is live first. Training, nutrition and recovery advice pages are live now; products launch on the same site and cart when inventory is ready.",
  },
  {
    q: "Are OneCurve cricket bats made for Indian conditions?",
    a: "Our range is selected for club, academy and match play in India — clear grades, practical weights, and protective gear suited to long sessions in heat. Stock and prices are managed live from our CMS.",
  },
]
