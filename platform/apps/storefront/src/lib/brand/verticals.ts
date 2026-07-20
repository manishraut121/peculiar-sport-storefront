export type VerticalStatus = "live" | "soon"

export type Vertical = {
  id: string
  name: string
  blurb: string
  description: string
  status: VerticalStatus
  href?: string
  links?: { label: string; href: string }[]
}

export const VERTICALS: Vertical[] = [
  {
    id: "cricket",
    name: "Cricket",
    blurb: "Bats, pads, gloves & keeping — live now.",
    description: "Performance cricket equipment for India.",
    status: "live",
    href: "/store",
    links: [
      { label: "Bats", href: "/categories/bats" },
      { label: "Pads", href: "/categories/pads" },
      { label: "Gloves", href: "/categories/gloves" },
    ],
  },
  {
    id: "training",
    name: "Training",
    blurb: "Strength & conditioning gear — soon.",
    description: "Gym and training equipment.",
    status: "soon",
  },
  {
    id: "nutrition",
    name: "Nutrition",
    blurb: "Fuel & recovery nutrition — soon.",
    description: "Performance nutrition.",
    status: "soon",
  },
  {
    id: "recovery",
    name: "Recovery",
    blurb: "Mobility & care — soon.",
    description: "Recovery essentials.",
    status: "soon",
  },
]

export const BRAND = {
  name: "OneCurve",
  tagline: "Move with the curve.",
  platformLine:
    "Performance sports equipment for India — cricket live, training next.",
  supportLine:
    "Spec-honest cricket gear. Free shipping over ₹2,999. One inventory.",
} as const
