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
  const identity = `${text}\u0000${speed}\u0000${delay}\u0000${enabled}\u0000${restartKey}`
  const [typing, setTyping] = useState({ identity: '', count: 0 })
  const [reducedMotion, setReducedMotion] = useState(false)
  const count = reducedMotion && enabled
    ? text.length
    : typing.identity === identity ? typing.count : 0

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mediaQuery) return undefined

    const updatePreference = () => setReducedMotion(mediaQuery.matches)
    updatePreference()
    mediaQuery.addEventListener?.('change', updatePreference)
    return () => mediaQuery.removeEventListener?.('change', updatePreference)
  }, [])

  useEffect(() => {
    if (!text) return undefined
    if (!enabled) return undefined
    if (reducedMotion) return undefined

    let intervalId
    const startId = window.setTimeout(() => {
      let visibleCharacters = 0
      intervalId = window.setInterval(() => {
        visibleCharacters += 1
        setTyping({ identity, count: Math.min(visibleCharacters, text.length) })
        if (visibleCharacters >= text.length) window.clearInterval(intervalId)
      }, Math.max(8, speed))
    }, Math.max(0, delay))

    return () => {
      window.clearTimeout(startId)
      if (intervalId) window.clearInterval(intervalId)
    }
  }, [text, speed, delay, enabled, restartKey, identity, reducedMotion])

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
