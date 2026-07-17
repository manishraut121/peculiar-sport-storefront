# OneCurve QA

## Primary: agentic (low maintenance)

You **do not** maintain CSS selectors. You maintain short **mission files** in
natural language:

```
apps/e2e/agentic/missions/
  smoke.yaml              # deploy gate
  shopper-journey.yaml    # browse → product → cart
  usability.yaml          # legal / trust / UX
```

An AI agent opens a real browser, reads the page (accessibility snapshot), and
decides what to click until the mission’s success criteria are met.

### Auto on every push

Workflow: [`.github/workflows/agentic-qa.yml`](../../../.github/workflows/agentic-qa.yml)

On each push/PR to `main` | `platform-phase-1` | `dev`:

1. Validates feature flags  
2. Pings stage URL (if configured)  
3. Runs **agentic smoke** missions against stage  
4. Uploads `report.md` as a CI artifact  

### One-time GitHub secrets

| Secret | Required | Purpose |
|---|---|---|
| `E2E_BASE_URL` | for UI QA | Stage storefront, e.g. `https://stage.onecurve.in` |
| `XAI_API_KEY` | preferred | SpaceXAI / xAI agent brain |
| `GROQ_API_KEY` | alt | Free-tier text model if no xAI key |
| `E2E_API_URL` | optional | Backend health check |
| `AGENTIC_MODEL` | optional | Override model id |

Without `E2E_BASE_URL`, the agentic job **skips** (workflow still green) so
local/dev repos are not blocked. Once stage is live, add the secret and every
push gets real shopper QA.

### Run locally

```bash
cd platform
./scripts/flip-env.sh dev && ./dev.sh   # terminal 1

# terminal 2
export XAI_API_KEY=...                  # or GROQ_API_KEY
export E2E_BASE_URL=http://localhost:8000
npm install
npx playwright install chromium -w @dtc/e2e
npm run test:agentic:smoke              # deploy gate
npm run test:agentic:all                # all missions
```

### Adding a mission (no code)

Copy a YAML file under `agentic/missions/`:

```yaml
id: checkout-address
name: Guest can fill shipping address
severity: major
tags: [regression]
max_steps: 18
start_path: /in
goal: |
  Get a product into the cart and open checkout. Fill a fake Indian address.
  Do not pay.
success_criteria:
  - Checkout shows shipping or payment step after address entry
fail_if:
  - Unrecoverable error overlay
```

Push → CI picks it up automatically (full suite on manual workflow run; smoke
tag on every push unless you tag the mission with `smoke`).

---

## Optional: traditional Playwright scripts

Under `tests/*.spec.ts` — useful for deterministic local debugging.  
**Prefer agentic missions for day-to-day regression** so you are not chasing
broken `data-testid`s after every UI tweak.

```bash
npm run test:smoke -w @dtc/e2e   # optional classic suite
```
