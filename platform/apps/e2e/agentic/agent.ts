import type { Page } from "@playwright/test"
import { chatJson, type LlmConfig } from "./llm"
import type { AgentAction, Mission, MissionResult } from "./types"

const SYSTEM = `You are an autonomous QA agent testing a live e-commerce website (OneCurve Sports — cricket gear, India).
You receive:
- mission goal + success/fail criteria
- current URL
- a compact accessibility/text snapshot of the page (not CSS selectors)

Respond ONLY with JSON matching one of:
{"type":"click","target":"<visible text or accessible name>","reason":"..."}
{"type":"fill","target":"<label or placeholder>","value":"...","reason":"..."}
{"type":"press","key":"Enter|Tab|Escape","reason":"..."}
{"type":"scroll","direction":"down"|"up","reason":"..."}
{"type":"wait","ms":500-3000,"reason":"..."}
{"type":"navigate","path":"/in/...","reason":"..."}
{"type":"done","passed":true|false,"summary":"...","issues":["..."]}

Rules:
- Prefer click targets that are short visible labels (Shop, Cart, product names).
- Never attempt real payment or enter real card numbers.
- If the page is an error/crash, immediately done with passed=false.
- When success criteria are met, done with passed=true.
- If stuck after trying alternatives, done with passed=false and explain.
- Be decisive; avoid repeating the same failed click more than twice.
`

async function snapshot(page: Page): Promise<string> {
  const url = page.url()
  const title = await page.title().catch(() => "")
  // Prefer Playwright aria snapshot when available; fall back to text content.
  let aria = ""
  try {
    const body = page.locator("body") as any
    if (typeof body.ariaSnapshot === "function") {
      aria = await body.ariaSnapshot({ timeout: 5000 })
    }
  } catch {
    /* ignore */
  }
  if (!aria) {
    aria = await page.locator("body").innerText().catch(() => "")
  }
  // Cap size for token budget
  if (aria.length > 8000) aria = aria.slice(0, 8000) + "\n…[truncated]"
  return `URL: ${url}\nTitle: ${title}\n\nPage snapshot:\n${aria}`
}

async function executeAction(page: Page, action: AgentAction, log: string[]): Promise<void> {
  switch (action.type) {
    case "click": {
      const t = action.target.trim()
      log.push(`click: ${t}`)
      const candidates = [
        page.getByRole("link", { name: new RegExp(escapeRe(t), "i") }),
        page.getByRole("button", { name: new RegExp(escapeRe(t), "i") }),
        page.getByText(t, { exact: false }),
      ]
      let clicked = false
      for (const loc of candidates) {
        const first = loc.first()
        if (await first.count().catch(() => 0)) {
          try {
            await first.click({ timeout: 5000 })
            clicked = true
            break
          } catch {
            /* try next */
          }
        }
      }
      if (!clicked) {
        // Last resort: any element with matching text
        try {
          await page.locator(`text=${t}`).first().click({ timeout: 4000 })
          clicked = true
        } catch {
          log.push(`  (click missed: ${t})`)
        }
      }
      await page.waitForLoadState("domcontentloaded").catch(() => {})
      await page.waitForTimeout(400)
      break
    }
    case "fill": {
      log.push(`fill: ${action.target} = ${action.value}`)
      const field = page
        .getByLabel(new RegExp(escapeRe(action.target), "i"))
        .or(page.getByPlaceholder(new RegExp(escapeRe(action.target), "i")))
        .first()
      await field.fill(action.value, { timeout: 5000 }).catch(async () => {
        await page.locator("input, textarea").first().fill(action.value)
      })
      break
    }
    case "press": {
      log.push(`press: ${action.key}`)
      await page.keyboard.press(action.key)
      break
    }
    case "scroll": {
      log.push(`scroll: ${action.direction}`)
      await page.mouse.wheel(0, action.direction === "down" ? 900 : -900)
      await page.waitForTimeout(300)
      break
    }
    case "wait": {
      const ms = Math.min(Math.max(action.ms || 1000, 200), 5000)
      log.push(`wait: ${ms}ms`)
      await page.waitForTimeout(ms)
      break
    }
    case "navigate": {
      let path = action.path.startsWith("http")
        ? action.path
        : action.path.startsWith("/")
          ? action.path
          : `/${action.path}`
      log.push(`navigate: ${path}`)
      await page.goto(path, { waitUntil: "domcontentloaded", timeout: 30000 })
      await page.waitForTimeout(500)
      break
    }
    case "done":
      break
  }
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function parseAction(raw: unknown): AgentAction {
  const a = raw as AgentAction
  if (!a || typeof a !== "object" || !("type" in a)) {
    return {
      type: "done",
      passed: false,
      summary: "Agent returned invalid action JSON",
      issues: ["invalid_action"],
    }
  }
  return a
}

export async function runMission(
  page: Page,
  mission: Mission,
  llm: LlmConfig,
  baseURL: string
): Promise<MissionResult> {
  const started = Date.now()
  const log: string[] = []
  const maxSteps = mission.max_steps ?? 15
  const start = mission.start_path.startsWith("http")
    ? mission.start_path
    : new URL(mission.start_path, baseURL).toString()

  log.push(`start → ${start}`)
  await page.goto(start, { waitUntil: "domcontentloaded", timeout: 45000 })
  await page.waitForTimeout(800)

  let lastActionKey = ""
  let repeatCount = 0

  for (let step = 1; step <= maxSteps; step++) {
    const snap = await snapshot(page)
    const user = [
      `Mission: ${mission.name} (${mission.id})`,
      `Goal:\n${mission.goal}`,
      `Success criteria:\n- ${mission.success_criteria.join("\n- ")}`,
      mission.fail_if?.length
        ? `Fail if:\n- ${mission.fail_if.join("\n- ")}`
        : "",
      mission.steps?.length
        ? `Suggested flow:\n- ${mission.steps.join("\n- ")}`
        : "",
      `Step ${step}/${maxSteps}`,
      snap,
      `Return the next single action as JSON.`,
    ]
      .filter(Boolean)
      .join("\n\n")

    let action: AgentAction
    try {
      const raw = await chatJson<AgentAction>(
        llm,
        [
          { role: "system", content: SYSTEM },
          { role: "user", content: user },
        ],
        { temperature: 0.1 }
      )
      action = parseAction(raw)
    } catch (e: any) {
      log.push(`LLM error: ${e.message}`)
      return {
        id: mission.id,
        name: mission.name,
        severity: mission.severity,
        passed: false,
        summary: `LLM failure: ${e.message}`,
        issues: ["llm_error"],
        steps_taken: step,
        duration_ms: Date.now() - started,
        log,
        final_url: page.url(),
      }
    }

    const key = JSON.stringify(action)
    if (key === lastActionKey) {
      repeatCount++
      if (repeatCount >= 3) {
        log.push("stuck: same action repeated — failing")
        return {
          id: mission.id,
          name: mission.name,
          severity: mission.severity,
          passed: false,
          summary: "Agent stuck repeating the same action",
          issues: ["stuck"],
          steps_taken: step,
          duration_ms: Date.now() - started,
          log,
          final_url: page.url(),
        }
      }
    } else {
      lastActionKey = key
      repeatCount = 0
    }

    if (action.type === "done") {
      log.push(`done: passed=${action.passed} — ${action.summary}`)
      return {
        id: mission.id,
        name: mission.name,
        severity: mission.severity,
        passed: Boolean(action.passed),
        summary: action.summary || (action.passed ? "OK" : "Failed"),
        issues: action.issues || [],
        steps_taken: step,
        duration_ms: Date.now() - started,
        log,
        final_url: page.url(),
      }
    }

    await executeAction(page, action, log)
  }

  return {
    id: mission.id,
    name: mission.name,
    severity: mission.severity,
    passed: false,
    summary: `Exceeded max_steps (${maxSteps}) without completing mission`,
    issues: ["max_steps"],
    steps_taken: maxSteps,
    duration_ms: Date.now() - started,
    log,
    final_url: page.url(),
  }
}
