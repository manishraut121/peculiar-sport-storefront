# OneCurve Design System — Studio Curve v3

See [BRAND.md](../../BRAND.md).

## Tokens
| Name | Hex |
|---|---|
| ink | `#0A0A0A` |
| paper | `#FAFAF8` |
| signal | `#FF6B1A` |
| mute | `#F0EFEC` |
| fog | `#6B6B66` |
| Display | Rubik |
| Body | Nunito Sans |

## Motion
- Hero: CSS stagger rise (`oc-hero-enter`)
- Mesh: single-layer aurora transform
- Scroll: Reveal component (SEO-safe, reduced-motion off)
- Cards: lift 3–5px, 200–300ms ease
- Marquee: infinite, paused on hover

## Performance
- content-visibility on sections
- next/image AVIF/WebP, LCP priority first image only
- Soft glass blur desktop-only
- next/font swap + fallback

## SEO
SSR copy · H1 rules · JSON-LD · catalog from Medusa CMS
