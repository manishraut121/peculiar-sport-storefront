# OneCurve — Brand Identity v1

**Status:** Canonical · defined 2026-07-18  
**Use:** All customer-facing UI (storefront). Admin can stay neutral Medusa chrome.

---

## 1. Positioning

| | |
|---|---|
| **Name** | OneCurve Sports |
| **One-liner** | Precision cricket equipment, handcrafted in India. |
| **Promise** | Willow graded and pressed for the perfect pickup curve — match-ready gear without the import markup. |
| **Audience** | Serious club & school cricketers, parents buying gear, coaches (India-first, mobile-first). |
| **Category** | Athletic-luxury retail (not toy-shop bright, not fashion-only minimal). |
| **Enemy** | Generic marketplace listings, vague “pro quality” claims, heavy imported brands with no workshop story. |

---

## 2. Personality

| We are | We are not |
|---|---|
| Precise, calm, confident | Loud, meme-y, festival-sale chaos |
| Technical when it helps | Jargon for jargon’s sake |
| Proudly Made in India | Patriotic cliché or cheap “desi” pastiche |
| Workshop-real | Influencer-fake |

**Voice:** Short sentences. Specs when useful. Never all-caps paragraphs. Prefer “hand-pressed” over “legendary”.

**Tagline options (use one consistently):**
- Primary: **The perfect curve.**
- Support: *Engineered for runs.*

---

## 3. Logo system

### Wordmark
- **ONE** + **CURVE** as one word: `ONECURVE` in display font (Barlow Condensed Bold, tracking slightly open).
- Accent: a single **curve stroke** under / through the “C” (SVG path = bat face arc). Never a cricket ball emoji.

### Lockups
| Context | Treatment |
|---|---|
| Nav | Compact: `ONECURVE` + thin curve mark |
| Footer / hero | Large display + tagline under |
| Favicon | Curve mark alone on pitch black |

### Clear space
Min height 24px digital. Don’t outline, don’t add drop shadows, don’t put on busy photo without scrim.

---

## 4. Color system — “Night Pitch”

Named for a floodlit ground: deep pitch, boundary rope, willow face.

| Token | Hex | Role |
|---|---|---|
| `pitch` | `#0B1210` | Dark surfaces, hero, footer |
| `pitch-elevated` | `#121A17` | Cards on dark |
| `outfield` | `#1C3329` | Secondary dark / badges |
| `boundary` | `#D4A017` | **Primary CTA / accent** |
| `boundary-hover` | `#E8B84A` | Hover / focus |
| `willow` | `#F4F0E6` | Light page background |
| `willow-card` | `#FFFFFF` | Light cards |
| `crease` | `#EDE8DC` | Muted light surface |
| `ink` | `#0C0F0D` | Body text on light |
| `mist` | `#5E6B64` | Muted text |
| `line` | `#D9D3C6` | Borders on light |
| `line-dark` | `rgba(244,240,230,0.12)` | Borders on dark |

**Rule:** `boundary` is the **only** chromatic accent in UI. No blue links, no green success bars in customer UI (use boundary/ink states).

**Contrast:** Boundary on pitch ≥ large text; on light use `ink` for body, `boundary` for CTAs on dark buttons only (button fill boundary + text pitch).

---

## 5. Typography

| Role | Family | Weight | Use |
|---|---|---|---|
| Display | **Barlow Condensed** | 600–700 | H1–H3, prices, nav brand, stats |
| Body | **Barlow** | 400–500 | UI, paragraphs, forms |
| Optional mono | system ui-monospace | — | SKUs only |

**Scale (mobile → desktop):**  
H1 2.75rem / 4.5rem · H2 2rem / 3rem · Body 1rem · Small 0.8125rem  
Line-height body 1.55 · Display 0.95–1.05  

---

## 6. Shape & motion

- **Radius:** 4px controls · 12px cards · 999px pills/CTAs  
- **Shadow:** Soft only on light cards (`0 8px 30px rgba(11,18,16,0.06)`); dark uses border not heavy shadow  
- **Motion:** 180–280ms, ease-out; transform + opacity only; honor `prefers-reduced-motion`  
- **Glass:** Optional on dark nav only; keep light UI flat for performance/SEO LCP  

---

## 7. Imagery

- Neutral / workshop / outfield dusk. Prefer real product on clean ground.  
- Alt text: `{name} cricket {category} — OneCurve`.  
- No stock “cheering stadium” as primary product hero until we own rights.

---

## 8. SEO brand phrases (sticky)

Use naturally in H1/meta (not stuffed):
- English Willow cricket bat  
- Handcrafted in India  
- Free shipping over ₹2,999  
- OneCurve Sports  

---

## 9. Don’ts

- Rainbow gradients, neon, purple tech aesthetic  
- Comic fonts, Bebas-only nostalgia if we’re on Barlow system  
- Multiple accent colors  
- Client-only critical text (breaks SEO)  

---

*Implementation: CSS vars in `globals.css`, Tailwind tokens, Next fonts in `layout.tsx`.*
