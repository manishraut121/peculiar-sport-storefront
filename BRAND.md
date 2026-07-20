# OneCurve — Brand Identity v3 “Studio Curve”

**Status:** Canonical storefront identity · 2026-07-20  
**CMS:** Medusa Admin at `http://159.89.173.5:9000/app` (catalog source of truth)

---

## Positioning

| | |
|---|---|
| **Brand** | OneCurve |
| **Category** | Multi-discipline performance gear (cricket live → gym, nutrition, recovery) |
| **Promise** | Spec-honest equipment, fair India pricing, one inventory |
| **Tagline** | **Move with the curve.** |
| **Support** | Performance gear for every discipline. |
| **Voice** | Clear, athletic, confident — short lines, no hype walls |

---

## Visual system

| Token | Hex | Use |
|---|---|---|
| `ink` | `#0A0A0A` | Text, dark surfaces |
| `paper` | `#FAFAF8` | Page background |
| `surface` | `#FFFFFF` | Cards |
| `mute` | `#F0EFEC` | Soft bands |
| `fog` | `#6B6B66` | Secondary text |
| `line` | `#E6E4DF` | Borders |
| `signal` | `#FF6B1A` | **Only accent / CTAs** |
| `signal-deep` | `#E85A0C` | Hover |

**Display:** Rubik (600–700)  
**Body:** Nunito Sans (400–600)

**Logo:** Wordmark `OneCurve` — “Curve” in signal orange. Minimal arc underline optional.

---

## UX rules

- Light-first shop (trust + product photos)  
- Dark hero / footer for brand drama only  
- Large type, generous space (density 4)  
- Motion: CSS + light scroll reveal; `prefers-reduced-motion` respected  
- SEO: all commercial copy server-rendered  

---

## Catalog vs brand chrome

| Editable in CMS (`/app`) | In code (this identity) |
|---|---|
| Products, prices, stock, SEO meta | Hero, layout, fonts, colors |
| Categories | Nav structure labels |

See [OPS_CMS.md](OPS_CMS.md) · [WIRE_CMS_STOREFRONT.md](WIRE_CMS_STOREFRONT.md)
