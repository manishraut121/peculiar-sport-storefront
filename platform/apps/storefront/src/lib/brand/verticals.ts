/**
 * Platform verticals — marketing IA for multi-sport OneCurve.
 * Live verticals link into Medusa categories/collections.
 * Future verticals show as "coming soon" until categories exist in Admin.
 */

export type VerticalStatus = "live" | "soon"

export type Vertical = {
  id: string
  name: string
  /** Short line for cards */
  blurb: string
  /** SEO / accessibility */
  description: string
  status: VerticalStatus
  /** Primary shop path when live */
  href?: string
  /** Optional secondary deep links */
  links?: { label: string; href: string }[]
  /** Display index for grid */
  accent?: string
}

export const VERTICALS: Vertical[] = [
  {
    id: "cricket",
    name: "Cricket",
    blurb: "English Willow bats, pads, gloves & keeping.",
    description:
      "Handcrafted cricket equipment — Grade 1+ willow to academy pads.",
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
    name: "Training & gym",
    blurb: "Strength, conditioning and training gear.",
    description: "Gym and training equipment — launching next.",
    status: "soon",
  },
  {
    id: "nutrition",
    name: "Nutrition",
    blurb: "Performance fuel — protein, hydration, recovery.",
    description: "Athletic nutrition — coming soon with full compliance.",
    status: "soon",
  },
  {
    id: "recovery",
    name: "Recovery",
    blurb: "Mobility, care and between-session essentials.",
    description: "Recovery and care products — on the roadmap.",
    status: "soon",
  },
]

export const BRAND = {
  name: "OneCurve Sports",
  tagline: "The perfect curve.",
  platformLine: "Performance gear for every discipline.",
  supportLine: "Engineered for performance.",
} as const
