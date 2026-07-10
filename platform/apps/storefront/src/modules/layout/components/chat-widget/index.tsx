"use client"

import { useEffect, useRef, useState } from "react"

/* OneCurve virtual customer care — floating chat, 24/7.
 * Talks to the backend /store/assistant route (open-source LLM or built-in
 * answers). Publishable key is public by design. */

type Msg = { role: "user" | "assistant"; content: string }

const BACKEND =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PK = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

const SUGGESTIONS = [
  "Which bat should a beginner buy?",
  "How long does delivery take?",
  "What is your return policy?",
]

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hi! I'm the OneCurve assistant — ask me about our bats, pads and gloves, or about shipping, returns and payments. 🏏",
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([GREETING])
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages, open, busy])

  const send = async (text: string) => {
    const content = text.trim()
    if (!content || busy) return
    const next: Msg[] = [...messages, { role: "user", content }]
    setMessages(next)
    setInput("")
    setBusy(true)
    try {
      const r = await fetch(`${BACKEND}/store/assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": PK,
        },
        body: JSON.stringify({
          // greeting is UI-only; send the real conversation
          messages: next.slice(1).slice(-10),
        }),
      })
      const d = await r.json()
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            d.reply ||
            "Sorry, I hit a snag. Please email support@onecurve.in and we'll help right away.",
        },
      ])
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "I couldn't reach the store just now. Please try again in a moment, or email support@onecurve.in.",
        },
      ])
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close customer care chat" : "Open customer care chat"}
        data-testid="chat-launcher"
        className="fixed bottom-5 right-5 z-[60] w-14 h-14 rounded-full bg-gold text-ink shadow-xl shadow-black/30 flex items-center justify-center hover:bg-gold-hover transition-colors"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M21 12a8 8 0 0 1-8 8H5l-2 2V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8Z" />
            <path d="M9 11h.01M13 11h.01M17 11h.01" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-5 z-[60] w-[min(92vw,380px)] rounded-2xl overflow-hidden border border-ui-border-base bg-ui-bg-base shadow-2xl shadow-black/40 flex flex-col"
          role="dialog"
          aria-label="OneCurve customer care"
          data-testid="chat-panel"
        >
          <div className="bg-ink px-5 py-4">
            <div className="font-display text-xl tracking-wide text-cream">
              One<span className="text-gold">Curve</span> Assistant
            </div>
            <div className="text-xs text-cream/60 mt-0.5">
              24×7 customer care · usually replies in seconds
            </div>
          </div>

          <div
            ref={listRef}
            className="flex-1 max-h-[46vh] min-h-[220px] overflow-y-auto px-4 py-4 flex flex-col gap-3"
            data-testid="chat-messages"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "self-end max-w-[85%] rounded-2xl rounded-br-sm bg-gold text-ink px-4 py-2.5 text-sm whitespace-pre-line"
                    : "self-start max-w-[85%] rounded-2xl rounded-bl-sm bg-ui-bg-subtle border border-ui-border-base text-ui-fg-base px-4 py-2.5 text-sm whitespace-pre-line"
                }
              >
                {m.content}
              </div>
            ))}
            {busy && (
              <div className="self-start rounded-2xl bg-ui-bg-subtle border border-ui-border-base px-4 py-2.5 text-sm text-ui-fg-muted">
                typing…
              </div>
            )}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs px-3 py-1.5 rounded-full border border-ui-border-base text-ui-fg-subtle hover:border-gold hover:text-gold transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex items-center gap-2 border-t border-ui-border-base px-3 py-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products, delivery, returns…"
              maxLength={500}
              data-testid="chat-input"
              className="flex-1 h-10 px-3 rounded-full bg-ui-bg-subtle border border-ui-border-base text-sm text-ui-fg-base placeholder:text-ui-fg-muted outline-none focus:border-gold/60"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send message"
              data-testid="chat-send"
              className="w-10 h-10 rounded-full bg-gold text-ink flex items-center justify-center disabled:opacity-40 hover:bg-gold-hover transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                <path d="M5 12h13M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  )
}
