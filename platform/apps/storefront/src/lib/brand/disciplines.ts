/**
 * Editorial discipline pages (Training / Nutrition / Recovery).
 * Products live in Medusa CMS; these pages educate until catalog is filled.
 */

export type DisciplineSlug = "training" | "nutrition" | "recovery"

export type DisciplinePage = {
  slug: DisciplineSlug
  name: string
  eyebrow: string
  headline: string
  lede: string
  comingSoonLabel: string
  advice: { title: string; body: string }[]
  tips: string[]
  ctaShopHref: string
  ctaShopLabel: string
  seoTitle: string
  seoDesc: string
}

export const DISCIPLINES: Record<DisciplineSlug, DisciplinePage> = {
  training: {
    slug: "training",
    name: "Training",
    eyebrow: "Strength · conditioning · skill",
    headline: "Train with intent.",
    lede: "Gym and training equipment is next on OneCurve — same checkout, same pan-India delivery. Until then, use these fundamentals to build power that transfers to the field.",
    comingSoonLabel: "Products coming soon",
    advice: [
      {
        title: "Strength that serves sport",
        body: "Prioritise compound patterns — squat, hinge, push, pull, carry. Two to three full-body sessions a week beat random isolation work for most athletes.",
      },
      {
        title: "Power and speed",
        body: "After a solid warm-up, train jumps, medicine-ball throws, or short sprints early in the session while you are fresh. Quality over volume.",
      },
      {
        title: "Recovery is training",
        body: "Sleep and protein intake drive adaptation. If you cut either, extra sets in the gym rarely pay off.",
      },
    ],
    tips: [
      "Warm up 8–12 minutes before heavy lifts",
      "Log loads — progressive overload needs a notebook",
      "One rest day minimum between hard lower-body sessions",
      "Mobility after, not only before",
    ],
    ctaShopHref: "/store",
    ctaShopLabel: "Shop cricket gear now",
    seoTitle:
      "Cricket Training & Strength Advice India | Gear Coming Soon — OneCurve",
    seoDesc:
      "Training advice for cricket and multi-sport athletes in India: strength, power and recovery fundamentals. OneCurve gym gear coming soon — shop cricket equipment today with free shipping over ₹2,999.",
  },
  nutrition: {
    slug: "nutrition",
    name: "Nutrition",
    eyebrow: "Fuel · hydrate · recover",
    headline: "Eat for the work you do.",
    lede: "Performance nutrition products are on the roadmap. Until they land in our catalogue, these principles keep energy high and recovery honest — without hype claims.",
    comingSoonLabel: "Products coming soon",
    advice: [
      {
        title: "Match food to the session",
        body: "Hard training days need more carbohydrate. Rest days can be lighter. Think “fuel for the work required,” not permanent cutting.",
      },
      {
        title: "Protein distribution",
        body: "Aim for a palm-sized protein source at each meal. Consistency across the day beats one huge shake at night.",
      },
      {
        title: "Hydration under heat",
        body: "In Indian summers, start sessions already hydrated. Clear-ish urine and steady energy beat waiting until you are thirsty mid-drill.",
      },
    ],
    tips: [
      "Whole foods first; supplements second",
      "Read labels — avoid miracle claims",
      "Caffeine 30–60 min pre-session if you tolerate it",
      "Post-session: protein + carbs within a few hours",
    ],
    ctaShopHref: "/store",
    ctaShopLabel: "Shop live products",
    seoTitle:
      "Sports Nutrition Advice for Athletes India | Coming Soon — OneCurve",
    seoDesc:
      "Practical sports nutrition for Indian athletes: fuelling, protein and hydration. OneCurve nutrition products coming soon. Shop cricket gear today — free shipping over ₹2,999.",
  },
  recovery: {
    slug: "recovery",
    name: "Recovery",
    eyebrow: "Rest · mobility · longevity",
    headline: "Recover like it matters.",
    lede: "Recovery tools and care products are coming to OneCurve. Until then, these habits keep you available for the next session — and the next season.",
    comingSoonLabel: "Products coming soon",
    advice: [
      {
        title: "Sleep is non-negotiable",
        body: "Seven to nine hours is the highest-ROI recovery tool. No gadget replaces a dark, cool room and a consistent bedtime.",
      },
      {
        title: "Active recovery",
        body: "Easy walks, light cycling, or mobility flows on off days improve blood flow without adding stress. Save max intensity for planned sessions.",
      },
      {
        title: "Listen early",
        body: "Sharp joint pain is a stop signal. Dull muscle soreness is normal; progressive sharp pain needs rest or a clinician, not another set.",
      },
    ],
    tips: [
      "Deload every 4–6 hard weeks",
      "Hydrate and eat enough on rest days too",
      "Short daily mobility > rare long sessions",
      "Manage stress — cortisol affects recovery",
    ],
    ctaShopHref: "/store",
    ctaShopLabel: "Browse the store",
    seoTitle:
      "Athlete Recovery & Mobility Advice India | Coming Soon — OneCurve",
    seoDesc:
      "Recovery advice for serious athletes in India — sleep, active recovery and injury signals. OneCurve recovery products coming soon. Shop cricket equipment with pan-India delivery.",
  },
}

export const DISCIPLINE_SLUGS = Object.keys(DISCIPLINES) as DisciplineSlug[]

export function getDiscipline(slug: string): DisciplinePage | null {
  if (slug in DISCIPLINES) {
    return DISCIPLINES[slug as DisciplineSlug]
  }
  return null
}
