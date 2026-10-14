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

  useEffect(() => {
    setCount(0)
    if (!text) return undefined
    if (!enabled) return undefined
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      setCount(text.length)
      return undefined
    }

    let intervalId
    const startId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        setCount((prev) => {
          if (prev + 1 >= text.length) {
            window.clearInterval(intervalId)
            return text.length
          }
          return prev + 1
        })
      }, Math.max(8, speed))
    }, Math.max(0, delay))

    return () => {
      window.clearTimeout(startId)
      if (intervalId) window.clearInterval(intervalId)
    }
  }, [text, speed, delay, enabled, restartKey])

  const done = count >= text.length

  return (
    <span className={className} aria-label={text}>
      {text.slice(0, count)}
      {showCursor && (!done || cursorWhenDone) ? (
        <span className="liquid-cursor" aria-hidden="true">
          |
        </span>
      ) : null}
    </span>
  )
}
