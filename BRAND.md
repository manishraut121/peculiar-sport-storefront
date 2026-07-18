# OneCurve — Brand Identity v2 (Multi-sport platform)

**Status:** Canonical · 2026-07-18  
**Scope:** Customer storefront + marketing. Commerce ops → [OPS_CMS.md](OPS_CMS.md).

---

## 1. Strategic positioning (marketer view)

| | |
|---|---|
| **Name** | OneCurve Sports |
| **Platform idea** | India’s performance equipment house — **one trusted inventory**, many sports. |
| **Flagship today** | Cricket (bats, pads, gloves, keeping). |
| **Roadmap verticals** | Training & gym · Nutrition · Team sports · Recovery. |
| **One-liner** | **Performance gear with a perfect curve — built for India.** |
| **Promise** | Spec-honest products, fair pricing, pan-India delivery, workshop-grade quality where we manufacture. |
| **Audience** | Athletes, club players, parents, coaches, gym-goers (India, mobile-first). |
| **Enemy** | Marketplace noise, fake “pro” claims, stockouts, confusing returns. |

### Why “curve”
- Cricket: the pickup curve of a bat.  
- Training: the progress curve.  
- Brand: continuous improvement — not a one-sport dead end.

### Taglines
- Primary: **The perfect curve.**  
- Platform: **Gear for every discipline.**  
- Support: *Engineered for performance.*

---

## 2. Category architecture (IA)

Home and nav sell **verticals**. Catalog is **Medusa categories**.

```text
Shop
├── Cricket          ← LIVE
│   ├── Bats
│   ├── Pads
│   ├── Gloves
│   └── Keeping
├── Training & Gym   ← coming soon (empty state OK)
├── Nutrition        ← coming soon (claims compliance later)
└── Recovery         ← coming soon
```

**SEO silos:** one URL tree per vertical → categories → products.  
Never hardcode “cricket only” in global chrome (nav/footer/store H1).

---

## 3. Personality & voice

| We are | We are not |
|---|---|
| Precise, calm, performance-led | Loud discount circus |
| Spec-first when it helps | Supplement bro-science |
| India-made pride (where true) | Fake “import only” prestige |
| Expandable platform | One-product gimmick brand |

**Voice:** Short. Technical when useful. No all-caps paragraphs.  
Cricket copy can stay workshop-specific; platform copy stays open.

---

## 4. Visual system — Night Pitch (unchanged tokens)

| Token | Hex | Role |
|---|---|---|
| Pitch | `#0B1210` | Dark immersive |
| Boundary | `#D4A017` | Sole accent / CTA |
| Willow | `#F4F0E6` | Light commerce surfaces |
| Ink | `#0C0F0D` | Body text on light |
| Display | Barlow Condensed | Headings, prices, brand |
| Body | Barlow | UI copy |

Logo: wordmark **OneCurve** + curve stroke. See v1 logo rules.

---

## 5. Homepage job-to-be-done

1. **Position** multi-sport performance brand (not “only bats”).  
2. **Route** shoppers into a live vertical (Cricket) or waitlist-style coming soon.  
3. **Convert** featured products + trust (ship, pay, returns).  
4. **Rank** for cricket commercial terms today + brand terms always.

---

## 6. What staff maintain vs what code owns

| Marketing need | Owner |
|---|---|
| Price, stock, SEO title/desc, images | **Medusa Admin** ([OPS_CMS.md](OPS_CMS.md)) |
| Promotions | **Medusa Promotions** |
| Home vertical order / brand story | Code (rare) |
| Product truth | Admin only — never duplicate in a page builder |

---

## 7. Don’ts

- Second product database in WordPress/Shopify “just for content”  
- Multiple accent colors per vertical (one brand, one boundary gold)  
- Client-only H1 or prices (breaks sticky SEO)  
- Launch nutrition without legal review of claims  

---

*Implementation: storefront verticals module + Night Pitch UI. Expand categories in Admin as SKUs land.*
