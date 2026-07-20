"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Result = {
  title: string
  handle: string
  thumbnail: string | null
  category: string | null
  price: number | null
  mrp: number | null
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n)

export default function SearchOverlay() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const close = useCallback(() => {
    setOpen(false)
    setQ("")
    setResults([])
  }, [])

  // Cmd/Ctrl+K opens, Escape closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [close])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
        const d = await r.json()
        setResults(d.results || [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [q])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Search products"
        data-testid="nav-search-button"
        className="inline-flex items-center justify-center gap-2 min-h-11 min-w-11 px-2 text-fog hover:text-ink tracking-wide font-semibold text-sm"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="hidden small:inline">Search</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-start justify-center pt-[12vh] px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Search products"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={close}
            data-testid="search-backdrop"
          />
          <div className="relative w-full max-w-xl rounded-2xl bg-ui-bg-base border border-ui-border-base shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 border-b border-ui-border-base">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gold shrink-0"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search bats, pads, gloves…"
                data-testid="search-input"
                className="w-full h-14 bg-transparent outline-none text-ui-fg-base placeholder:text-ui-fg-muted"
              />
              <button
                onClick={close}
                aria-label="Close search"
                className="text-ui-fg-muted hover:text-ui-fg-base text-xs uppercase tracking-wide"
              >
                Esc
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto" data-testid="search-results">
              {loading && (
                <div className="px-5 py-4 text-sm text-ui-fg-muted">
                  Searching…
                </div>
              )}
              {!loading && q.trim().length >= 2 && results.length === 0 && (
                <div className="px-5 py-4 text-sm text-ui-fg-muted">
                  No matches for “{q}”. Try “bat”, “pads” or “gloves”.
                </div>
              )}
              {results.map((r) => (
                <LocalizedClientLink
                  key={r.handle}
                  href={`/products/${r.handle}`}
                  onClick={close}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-ui-bg-subtle transition-colors"
                  data-testid={`search-result-${r.handle}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {r.thumbnail ? (
                    <img
                      src={r.thumbnail}
                      alt={r.title}
                      className="w-12 h-12 rounded-lg object-cover border border-ui-border-base shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-ui-bg-subtle border border-ui-border-base shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-ui-fg-base truncate">
                      {r.title}
                    </div>
                    {r.category && (
                      <div className="text-xs text-ui-fg-muted uppercase tracking-wide">
                        {r.category}
                      </div>
                    )}
                  </div>
                  {r.price != null && (
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold text-ui-fg-base">
                        {fmt(r.price)}
                      </div>
                      {r.mrp && r.mrp > r.price && (
                        <div className="text-xs text-ui-fg-muted line-through">
                          {fmt(r.mrp)}
                        </div>
                      )}
                    </div>
                  )}
                </LocalizedClientLink>
              ))}
              {q.trim().length < 2 && (
                <div className="px-5 py-4 text-xs text-ui-fg-muted">
                  Type at least 2 letters — try “english willow”, “keeping”,
                  “limited edition”…
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
