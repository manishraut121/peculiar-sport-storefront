#!/usr/bin/env npx tsx
/**
 * OneCurve agentic QA runner
 *
 *   npm run test:agentic -w @dtc/e2e
 *   E2E_BASE_URL=https://stage.onecurve.in npm run test:agentic -w @dtc/e2e
 *   npm run test:agentic -w @dtc/e2e -- --tag smoke
 *
 * Missions: agentic/missions/*.yaml  (natural language — no selectors)
 * Requires: XAI_API_KEY | GROQ_API_KEY | OPENAI_API_KEY
 */

import fs from "fs"
import path from "path"
import { chromium } from "@playwright/test"
import { parse as parseYaml } from "yaml"
import { resolveLlmConfig } from "./llm"
import { runMission } from "./agent"
import type { AgenticReport, Mission } from "./types"

const ROOT = path.resolve(__dirname)
const MISSIONS_DIR = path.join(ROOT, "missions")
const OUT_DIR = path.join(ROOT, "..", "test-results", "agentic")

function loadMissions(tagFilter?: string): Mission[] {
  const files = fs
    .readdirSync(MISSIONS_DIR)
    .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
  const missions: Mission[] = []
  for (const f of files) {
    const raw = fs.readFileSync(path.join(MISSIONS_DIR, f), "utf8")
    const m = parseYaml(raw) as Mission
    if (!m?.id || !m?.goal) {
      console.warn(`skip invalid mission file: ${f}`)
      continue
    }
    if (tagFilter) {
      const tags = m.tags || []
      if (!tags.includes(tagFilter) && m.id !== tagFilter) continue
    }
    missions.push(m)
  }
  return missions
}

function writeReport(report: AgenticReport) {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  const jsonPath = path.join(OUT_DIR, "report.json")
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2))

  const md: string[] = [
    `# Agentic QA report`,
    ``,
    `- **Base URL:** ${report.base_url}`,
    `- **Provider:** ${report.provider} / \`${report.model}\``,
    `- **Result:** ${report.passed ? "✅ PASSED" : "❌ FAILED"}`,
    `- **When:** ${report.started_at} → ${report.finished_at}`,
    ``,
  ]
  for (const r of report.results) {
    md.push(`## ${r.passed ? "✅" : "❌"} ${r.name} (\`${r.id}\`)`)
    md.push(``)
    md.push(`- Severity: ${r.severity}`)
    md.push(`- Steps: ${r.steps_taken} · ${r.duration_ms}ms`)
    md.push(`- ${r.summary}`)
    if (r.issues?.length) md.push(`- Issues: ${r.issues.join(", ")}`)
    if (r.final_url) md.push(`- Final URL: ${r.final_url}`)
    md.push(``)
    md.push(`<details><summary>Action log</summary>`)
    md.push(``)
    md.push("```")
    md.push(...r.log)
    md.push("```")
    md.push(``)
    md.push(`</details>`)
    md.push(``)
  }
  const mdPath = path.join(OUT_DIR, "report.md")
  fs.writeFileSync(mdPath, md.join("\n"))
  console.log(`\nReport: ${jsonPath}`)
  console.log(`Markdown: ${mdPath}`)
}

async function main() {
  const args = process.argv.slice(2)
  const tagIdx = args.indexOf("--tag")
  const tagFilter =
    tagIdx >= 0 ? args[tagIdx + 1] : process.env.AGENTIC_TAG || undefined

  const baseURL =
    process.env.E2E_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:8000"

  const llm = resolveLlmConfig()
  if (!llm) {
    console.error(
      "✗ No LLM key. Set XAI_API_KEY (preferred), GROQ_API_KEY, or OPENAI_API_KEY."
    )
    process.exit(2)
  }

  // Soft probe — fail fast if target is down
  try {
    const probe = await fetch(baseURL, { method: "GET", redirect: "follow" })
    if (probe.status >= 500) {
      console.error(`✗ Target ${baseURL} returned ${probe.status}`)
      process.exit(1)
    }
  } catch (e: any) {
    console.error(`✗ Cannot reach ${baseURL}: ${e.message}`)
    console.error("  Start the stack (./dev.sh) or set E2E_BASE_URL to stage.")
    process.exit(1)
  }

  const missions = loadMissions(tagFilter)
  if (!missions.length) {
    console.error("✗ No missions found (check --tag filter or missions/)")
    process.exit(1)
  }

  console.log(`Agentic QA → ${baseURL}`)
  console.log(`LLM: ${llm.provider} / ${llm.model}`)
  console.log(
    `Missions: ${missions.map((m) => m.id).join(", ")}${tagFilter ? ` (tag=${tagFilter})` : ""}`
  )

  const browser = await chromium.launch({
    headless: process.env.AGENTIC_HEADED !== "1",
  })
  const context = await browser.newContext({
    locale: "en-IN",
    viewport: { width: 1280, height: 800 },
  })
  const page = await context.newPage()

  const started_at = new Date().toISOString()
  const results = []

  for (const mission of missions) {
    console.log(`\n▶ ${mission.name}…`)
    const result = await runMission(page, mission, llm, baseURL)
    results.push(result)
    console.log(
      `  ${result.passed ? "PASS" : "FAIL"} — ${result.summary.slice(0, 120)}`
    )
  }

  await browser.close()

  const report: AgenticReport = {
    started_at,
    finished_at: new Date().toISOString(),
    base_url: baseURL,
    provider: llm.provider,
    model: llm.model,
    passed: results.every((r) => r.passed || r.severity === "minor"),
    results,
  }
  // critical/major failures fail the run
  report.passed = results.every(
    (r) => r.passed || (r.severity !== "critical" && r.severity !== "major")
  )

  writeReport(report)

  if (!report.passed) {
    console.error("\n✗ Agentic QA failed (see test-results/agentic/report.md)")
    process.exit(1)
  }
  console.log("\n✓ Agentic QA passed")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
