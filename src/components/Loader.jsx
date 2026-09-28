import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'

const WORD = 'EVLOUT'
const MINIMUM_LOADER_TIME = 1000
const EXIT_HOLD_TIME = 220

export default function Loader() {
  const { active, progress, errors } = useProgress()
  const [hidden, setHidden] = useState(false)
  const [minimumTimeElapsed, setMinimumTimeElapsed] = useState(false)
  const mountedAt = useRef(Date.now())
  const failed = errors.length > 0
  const ready = (!active && progress >= 100) || failed

  useEffect(() => {
    const remaining = Math.max(0, MINIMUM_LOADER_TIME - (Date.now() - mountedAt.current))
    const id = window.setTimeout(() => setMinimumTimeElapsed(true), remaining)
    return () => window.clearTimeout(id)
  }, [])

  useEffect(() => {
    if (!ready || !minimumTimeElapsed) return undefined

    const id = window.setTimeout(() => setHidden(true), EXIT_HOLD_TIME)
    return () => window.clearTimeout(id)
  }, [minimumTimeElapsed, ready])

  return (
    <div className={`loader${hidden ? ' loader--done' : ''}`} role="status" aria-live="polite">
      <span className="loader__word" aria-label={WORD}>
        {WORD.split('').map((letter, index) => (
          <span
            className="loader__letter"
            key={`${letter}-${index}`}
            style={{ animationDelay: `${index * 116}ms` }}
            aria-hidden="true"
          >
            {letter}
          </span>
        ))}
      </span>
    </div>
  )
}
