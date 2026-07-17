# OneCurve Sports — onecurve.in

Two things live in this repo:

| Directory | What | Status |
|---|---|---|
| `/` (root) | **Legacy vanilla site** — single-page storefront on Netlify with Razorpay serverless functions. The revenue **bridge** while the new platform is built. | Live-ready (needs Razorpay keys in Netlify env) |
| [`platform/`](platform/) | **The new platform** — Medusa v2 + Next.js: admin CMS, ONE shared inventory for online + POS, SSR storefront. | In build — runs locally today |

- **🚀 Launch plan (start here):** [LAUNCH.md](LAUNCH.md) — env flags, cloud choice, e2e, bookkeeping, prod flip
- **🧭 CTO Handbook:** [HANDBOOK.md](HANDBOOK.md) — architecture, secrets, DB, CI/CD
- **Deploy (VPS preferred after Railway trial):** [DEPLOY.md](DEPLOY.md) — DigitalOcean docker-compose Path A
- **Test it online (share with your partner):** [CODESPACES.md](CODESPACES.md) — one-click GitHub Codespaces
- **Platform decision & architecture:** [PLATFORM.md](PLATFORM.md)
- **Run locally:** [platform/README.md](platform/README.md) — `cd platform && ./scripts/flip-env.sh dev && ./dev.sh`
- **Working agreements / design system:** [CLAUDE.md](CLAUDE.md)

### Quick commands (platform)

```bash
cd platform
./scripts/flip-env.sh dev|stage|prod   # feature flags + env
./dev.sh                               # local stack
npm run test:e2e:smoke                 # deploy gate (stack must be up)
```
