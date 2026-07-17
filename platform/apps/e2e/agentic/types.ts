export type Mission = {
  id: string
  name: string
  severity: "critical" | "major" | "minor"
  tags?: string[]
  max_steps?: number
  start_path: string
  goal: string
  success_criteria: string[]
  steps?: string[]
  fail_if?: string[]
}

export type AgentAction =
  | { type: "click"; target: string; reason?: string }
  | { type: "fill"; target: string; value: string; reason?: string }
  | { type: "press"; key: string; reason?: string }
  | { type: "scroll"; direction: "down" | "up"; reason?: string }
  | { type: "wait"; ms: number; reason?: string }
  | { type: "navigate"; path: string; reason?: string }
  | { type: "done"; passed: boolean; summary: string; issues?: string[] }

export type MissionResult = {
  id: string
  name: string
  severity: string
  passed: boolean
  summary: string
  issues: string[]
  steps_taken: number
  duration_ms: number
  log: string[]
  final_url?: string
}

export type AgenticReport = {
  started_at: string
  finished_at: string
  base_url: string
  provider: string
  model: string
  passed: boolean
  results: MissionResult[]
}
