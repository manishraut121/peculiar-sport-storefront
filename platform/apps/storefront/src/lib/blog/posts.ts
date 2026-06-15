// File-based blog content. Each post renders SSR with Article JSON-LD and is
// included in the sitemap. Owner can add posts here (or migrate to a CMS later).

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  date: string // ISO
  author: string
  readMins: number
  // Body is an array of simple blocks for clean, dependency-free rendering.
  body: { type: "h2" | "p"; text: string }[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-choose-a-cricket-bat",
    title: "How to Choose the Right Cricket Bat: Willow Grades Explained",
    excerpt:
      "Grade 1+ to Grade 4, English vs Kashmir willow, weight and pickup — a simple guide to picking the bat that suits your game and budget.",
    date: "2026-06-02",
    author: "OneCurve",
    readMins: 6,
    body: [
      { type: "p", text: "Choosing a cricket bat is part science, part feel. The right bat should feel light in your hands, have a sweet spot where you naturally hit the ball, and match the level you play at. Here is how to decide." },
      { type: "h2", text: "Understand willow grades" },
      { type: "p", text: "English Willow is graded from 1+ (the finest, with straight, even grains and a clean blade) down to Grade 4. Higher grades offer better performance and a bigger sweet spot, but cosmetic marks on lower grades rarely affect how the bat plays. Kashmir Willow is denser and more affordable — ideal for beginners, tennis-ball cricket and net practice." },
      { type: "h2", text: "Weight and pickup" },
      { type: "p", text: "A heavier bat is not always more powerful. What matters is pickup — how light the bat feels when you lift it, which depends on where the wood is concentrated. A well-balanced 1180g bat can feel lighter than a poorly balanced 1150g one. Always lift a bat before you judge its weight." },
      { type: "h2", text: "Match the bat to your game" },
      { type: "p", text: "Top-order batsmen who play along the ground often prefer a mid sweet spot and balanced pickup. Big hitters favour a low-to-mid sweet spot and thicker edges. If you are starting out or buying for an academy player, a Grade 3 or Kashmir Willow bat gives reliable performance without overspending." },
      { type: "h2", text: "Care for your bat" },
      { type: "p", text: "Knock in a new bat before heavy use, oil natural-faced blades sparingly, and store it away from extreme heat. A well-cared-for bat lasts seasons. Every OneCurve bat is hand-pressed and ready to knock in." },
    ],
  },
  {
    slug: "knocking-in-a-new-cricket-bat",
    title: "Knocking In a New Cricket Bat: A Step-by-Step Guide",
    excerpt:
      "A new bat needs knocking in to compress the fibres and prevent cracking. Here is how to do it properly so your bat lasts and performs.",
    date: "2026-06-08",
    author: "OneCurve",
    readMins: 5,
    body: [
      { type: "p", text: "A brand-new bat is not ready for match pace straight away. Knocking in compresses the soft willow fibres on the face and edges so the bat can withstand a hard cricket ball without surface cracking — and it improves performance too." },
      { type: "h2", text: "What you need" },
      { type: "p", text: "A bat mallet or an old ball in a sock, a little raw linseed oil for natural-faced bats (skip this for pre-oiled or anti-scuff covered bats), and patience. The whole process takes a few hours spread over a couple of weeks." },
      { type: "h2", text: "The process" },
      { type: "p", text: "Start gently with the mallet across the face and edges, gradually increasing force over several sessions of 15–20 minutes. Pay extra attention to the edges and toe — these are the most vulnerable areas. After mallet work, hit some old balls in the nets before facing a new ball." },
      { type: "h2", text: "Signs it is ready" },
      { type: "p", text: "When the edges look slightly rounded and rebound feels springy rather than dead, your bat is match-ready. Take your time — proper knocking in is the single biggest thing you can do to extend the life of a quality bat." },
    ],
  },
  {
    slug: "wicket-keeping-gear-guide",
    title: "Wicket-Keeping Gear: Gloves and Pads That Go the Distance",
    excerpt:
      "Keeping is the most demanding job on the field. Here is what to look for in keeping gloves and pads so you stay sharp all day.",
    date: "2026-06-12",
    author: "OneCurve",
    readMins: 4,
    body: [
      { type: "p", text: "A wicket-keeper touches the ball more than anyone on the field, so comfortable, protective gear is non-negotiable. The right kit keeps your hands fresh and your reflexes sharp through long sessions behind the stumps." },
      { type: "h2", text: "Keeping gloves" },
      { type: "p", text: "Look for a supple catching mesh between thumb and forefinger, good padding across the palm to absorb repeated impact, and a towelling cuff to keep sweat off your hands. A pre-curved fit reduces fatigue. Always wear inners for hygiene and an extra layer of protection." },
      { type: "h2", text: "Keeping pads" },
      { type: "p", text: "Keeping pads are lighter and lower-profile than batting pads so you can crouch and move quickly. A flexible instep and secure straps let you spring sideways without the pad shifting. High-density foam protects the shin without slowing you down." },
      { type: "h2", text: "Fit and care" },
      { type: "p", text: "Gear that fits well protects better and lasts longer. Air out your gloves after every session and store pads flat. OneCurve keeping gloves and pads are built for the demands of a full day behind the stumps." },
    ],
  },
]

export const getPost = (slug: string) =>
  BLOG_POSTS.find((p) => p.slug === slug)
