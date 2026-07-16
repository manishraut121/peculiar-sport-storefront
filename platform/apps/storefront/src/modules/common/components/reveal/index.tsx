"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

/* Accessible subtle scroll-reveal (opacity + 12px rise, ~350ms).
 * SEO-safe: content renders VISIBLE by default (server HTML). Only JS hides it
 * then reveals on scroll, so crawlers and no-JS users always see it. Fully
 * skipped when the user prefers reduced motion. */
export default function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className = "",
}: {
  children: ReactNode
  as?: any
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLElement>(null)
  const [armed, setArmed] = useState(false) // JS took over → we may animate
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches
    if (reduce) return // leave content as-is (visible)

    setArmed(true)
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true)
            io.unobserve(e.target)
          }
        })
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const style = armed
    ? {
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(12px)",
        transition: `opacity 350ms ease-out ${delay}ms, transform 350ms ease-out ${delay}ms`,
        willChange: "opacity, transform",
      }
    : undefined

  return (
    <Tag ref={ref as any} style={style} className={className}>
      {children}
    </Tag>
  )
}
