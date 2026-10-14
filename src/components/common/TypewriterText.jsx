import { useEffect, useState } from 'react'

export default function TypewriterText({
  text,
  className = '',
  speed = 28,
  delay = 0,
  showCursor = true,
  cursorWhenDone = false,
  enabled = true,
  restartKey = 0,
}) {
  const [count, setCount] = useState(0)
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

  useEffect(() => {
    setCount(0)
    if (!text) return undefined
    if (!enabled) return undefined
    if (prefersReducedMotion) return undefined

    let intervalId
    let currentCount = 0
    const startId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        currentCount = Math.min(currentCount + 1, text.length)
        setCount(currentCount)
        if (currentCount >= text.length) window.clearInterval(intervalId)
      }, Math.max(8, speed))
    }, Math.max(0, delay))

    return () => {
      window.clearTimeout(startId)
      if (intervalId) window.clearInterval(intervalId)
    }
  }, [text, speed, delay, enabled, restartKey, prefersReducedMotion])

  const visibleCount = enabled && prefersReducedMotion ? text.length : count
  const done = visibleCount >= text.length

  return (
    <span className={className} aria-label={text}>
      {text.slice(0, visibleCount)}
      {showCursor && (!done || cursorWhenDone) ? (
        <span className="liquid-cursor" aria-hidden="true">
          |
        </span>
      ) : null}
    </span>
  )
}
