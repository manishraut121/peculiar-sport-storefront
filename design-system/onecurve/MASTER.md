# OneCurve Design System (Master)

**Stack:** Next.js App Router (SSR) + Tailwind · Medusa storefront  
**Audience:** India cricket buyers (mobile-first) · staff use admin separately  
**Non-negotiables:** Gold accent only · Bebas Neue + DM Sans · SEO via SSR (no client-only content for primary copy)

## Brand tokens (locked)

| Token | Value |
|---|---|
| Gold | `#C9A84C` (hover `#E2B84C`) |
| Ink | `#080808` |
| Cream | `#F0EEE8` |
| Card dark | `#181818` |
| Display | Bebas Neue (`font-display`) |
| Body | DM Sans (`font-body`) |

UI Pro Max suggested Cormorant/Montserrat and amber `#A16207` — **rejected** in favor of brand lock above. Gold on ink verified for large text; body on dark uses cream with muted at ≥0.72 opacity for WCAG.

## Pattern

- **Home:** Immersive dark (`oc-dark`) → trust → categories → product grid → craft → FAQ  
- **Shop/PDP/Cart:** Light surfaces, gold CTAs  
- **CTA:** Primary solid gold on ink/cream; secondary glass outline  
- **Motion:** 150–300ms, transform/opacity only; respect `prefers-reduced-motion`  
- **Density:** Standard (spacious marketing, not dashboard)

## Sticky SEO rules (never compromise)

1. All commercial copy in **server components** (crawlable HTML).  
2. Every route: unique `title` + `description` + `canonical` via Next Metadata API.  
3. Product: `Product` + `Offer` + `BreadcrumbList` JSON-LD (safe via `jsonLd()`).  
4. Home/store: `ItemList` for featured/catalog when products exist.  
5. `sitemap.xml` + `robots.txt` always include legal + products + categories.  
6. Images: `next/image` or sized Thumbnail + descriptive `alt`.  
7. No index for cart/checkout/account (`robots.ts`).  
8. `lang="en-IN"`, `metadataBase`, Open Graph `en_IN`.  
9. H1 once per page; product title is H1 on PDP.  
10. Internal links as real `<a>` via `LocalizedClientLink` (not JS-only nav).

## UX checklist

- [x] Touch targets ≥ 44px on primary CTAs  
- [x] Focus-visible gold ring  
- [x] Sticky nav with utility trust strip  
- [x] Reduced motion safe  
- [ ] Lighthouse on stage after deploy  

## Anti-patterns

- Blue/green accents · emoji icons · client-only hero text · horizontal page scroll · animating layout width/height  
