/**
 * OpenAI-compatible chat client for agentic QA.
 * Prefers SpaceXAI / xAI (XAI_API_KEY), then Groq free tier (GROQ_API_KEY).
 */

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string }

export type LlmConfig = {
  apiKey: string
  baseUrl: string
  model: string
  provider: string
}

export function resolveLlmConfig(): LlmConfig | null {
  if (process.env.XAI_API_KEY) {
    return {
      apiKey: process.env.XAI_API_KEY,
      baseUrl: process.env.XAI_BASE_URL || "https://api.x.ai/v1",
      model: process.env.AGENTIC_MODEL || "grok-4-1-fast-non-reasoning",
      provider: "xai",
    }
  }
  if (process.env.GROQ_API_KEY) {
    return {
      apiKey: process.env.GROQ_API_KEY,
      baseUrl: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
      model: process.env.AGENTIC_MODEL || "llama-3.3-70b-versatile",
      provider: "groq",
    }
  }
  if (process.env.OPENAI_API_KEY) {
    return {
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      model: process.env.AGENTIC_MODEL || "gpt-4o-mini",
      provider: "openai",
    }
  }
  return null
}

export async function chatJson<T>(
  cfg: LlmConfig,
  messages: ChatMessage[],
  opts?: { temperature?: number }
): Promise<T> {
  const res = await fetch(`${cfg.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: cfg.model,
      temperature: opts?.temperature ?? 0.1,
      response_format: { type: "json_object" },
      messages,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`LLM ${cfg.provider} ${res.status}: ${body.slice(0, 500)}`)
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error("LLM returned empty content")

  try {
    return JSON.parse(content) as T
  } catch {
    // Some models wrap JSON in fences
    const m = content.match(/\{[\s\S]*\}/)
    if (!m) throw new Error(`LLM non-JSON: ${content.slice(0, 300)}`)
    return JSON.parse(m[0]) as T
  }
}
