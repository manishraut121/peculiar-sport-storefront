# OneCurve Sports — onecurve.in

Two things live in this repo:

| Directory | What | Status |
|---|---|---|
| `/` (root) | **Legacy vanilla site** — single-page storefront on Netlify with Razorpay serverless functions. The revenue **bridge** while the new platform is built. | Live-ready (needs Razorpay keys in Netlify env) |
| [`platform/`](platform/) | **The new platform** — Medusa v2 + Next.js: admin CMS, ONE shared inventory for online + POS, SSR storefront. | In build — runs locally today |

- **Test it online (share with your partner):** [CODESPACES.md](CODESPACES.md) — one-click GitHub Codespaces, public link, no installs
- **Platform decision & architecture:** [PLATFORM.md](PLATFORM.md)
- **Run the new platform:** [platform/README.md](platform/README.md) — `cd platform && ./dev.sh`,
  then storefront at http://localhost:8000, admin at http://localhost:9000/app
- **Working agreements / design system:** [CLAUDE.md](CLAUDE.md)
