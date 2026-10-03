import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'

const WORD = 'EVOLUT'
const MINIMUM_LOADER_TIME = 1400
const EXIT_HOLD_TIME = 500

export default function Loader() {
  const { active, progress, errors } = useProgress()
  const [typedCount, setTypedCount] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [isRemoved, setIsRemoved] = useState(false)
  
  const mountedAt = useRef(Date.now())
  const ready = (!active && progress >= 100) || errors.length > 0

  // Typewriter effect: reveal letter by letter
  useEffect(() => {
    let index = 0
    // Start typing shortly after mount
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        index++
        setTypedCount(index)
        if (index >= WORD.length) {
          clearInterval(interval)
        }
      }, 110) // 110ms per letter

      return () => clearInterval(interval)
    }, 200)

    return () => clearTimeout(startTimeout)
  }, [])

  // Minimum loader time
  useEffect(() => {
    const elapsed = Date.now() - mountedAt.current
    const remaining = Math.max(0, MINIMUM_LOADER_TIME - elapsed)

    const timer = setTimeout(() => {
      setIsReady(true)
    }, remaining)

    return () => clearTimeout(timer)
  }, [])

  // Smooth exit when both ready and minimum time elapsed
  useEffect(() => {
    if (isReady && ready) {
      const exitTimer = setTimeout(() => {
        setIsRemoved(true)
      }, EXIT_HOLD_TIME)
      return () => clearTimeout(exitTimer)
    }
  }, [isReady, ready])

  if (isRemoved) return null

  const isExiting = isReady && ready
  const isTypingDone = typedCount >= WORD.length

  return (
    <div
      className={`minimal-loader ${isExiting ? 'minimal-loader--done' : ''}`}
      role="status"
      aria-label="Cargando Evolut"
      aria-live="polite"
    >
      <div className="minimal-loader__content">
        {/* Logo */}
        <div className="minimal-loader__logo-wrap">
          <img
            src="/assets/logo-white.png"
            alt="Evolut"
            className="minimal-loader__logo"
          />
          <div className="minimal-loader__glow" aria-hidden="true" />
        </div>

        {/* Pure Letter-by-Letter Typewriter Wordmark (No containers, boxes or borders) */}
        <div className="minimal-loader__wordmark" aria-label={WORD}>
          {WORD.slice(0, typedCount).split('').map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className="minimal-loader__letter"
            >
              {letter}
            </span>
          ))}
          {/* Subtle glowing blinking typing cursor */}
          <span
            className={`minimal-loader__cursor ${isTypingDone ? 'minimal-loader__cursor--idle' : ''}`}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  )
}
