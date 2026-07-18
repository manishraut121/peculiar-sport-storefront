# OneCurve Design System — Night Pitch v1

See also: [BRAND.md](../../BRAND.md) (identity, voice, logo).

## Stack
Next.js App Router (SSR) · Tailwind · Medusa storefront

## Tokens
| Name | Hex |
|---|---|
| pitch | `#0B1210` |
| boundary | `#D4A017` |
| willow | `#F4F0E6` |
| ink | `#0C0F0D` |
| Display | Barlow Condensed |
| Body | Barlow |

## Layout pattern
1. Sticky nav (light on shop, dark glass on home optional)  
2. Hero (dark pitch, boundary CTAs)  
3. Trust strip  
4. Categories bento  
5. Product grid (light willow ground)  
6. Craft / story  
7. FAQ (FAQPage JSON-LD)  
8. Footer (pitch)

## SEO (sticky)
SSR copy · Metadata API · JSON-LD · sitemap · en-IN · one H1 · real links

## Components
- **Btn primary:** bg-boundary text-pitch rounded-full min-h-12  
- **Btn secondary:** border line-dark text-willow  
- **Card:** white / pitch-elevated + 12px radius  
- **Price:** font-display boundary or ink  

## Anti-patterns
Multi-accent UI · emoji icons · horizontal scroll · FOIT fonts without `display: swap`
