# Classic Playwright specs (optional)

These are **legacy/optional**. Prefer agentic missions:

→ [`../agentic/missions/`](../agentic/missions/)

Keep a classic test only when you need a fully deterministic assertion that
must not involve an LLM (e.g. a pure API contract). Day-to-day UI regression
belongs in agentic YAML so refactors do not break selectors.
