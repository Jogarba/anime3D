import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'

const WORD = 'EVOLUT'
const MINIMUM_LOADER_TIME = 1400
const EXIT_HOLD_TIME = 500
const SAFETY_TIMEOUT = 4000

export default function Loader() {
  const { active, progress, errors } = useProgress()
  const [typedCount, setTypedCount] = useState(0)
  const [minTimeElapsed, setMinTimeElapsed] = useState(false)
  const [isRemoved, setIsRemoved] = useState(false)
  const [forceReady, setForceReady] = useState(false)

  const assetsReady = forceReady || errors.length > 0 || (!active && progress >= 100)

  useEffect(() => {
    let index = 0
    let interval
    const startTimeout = window.setTimeout(() => {
      interval = window.setInterval(() => {
        index += 1
        setTypedCount(index)
        if (index >= WORD.length) {
          window.clearInterval(interval)
        }
      }, 110)
    }, 200)

    return () => {
      window.clearTimeout(startTimeout)
      if (interval) window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const minTimer = window.setTimeout(() => setMinTimeElapsed(true), MINIMUM_LOADER_TIME)
    const safetyTimer = window.setTimeout(() => {
      setMinTimeElapsed(true)
      setForceReady(true)
    }, SAFETY_TIMEOUT)

    return () => {
      window.clearTimeout(minTimer)
      window.clearTimeout(safetyTimer)
    }
  }, [])

  useEffect(() => {
    if (!minTimeElapsed || !assetsReady) return undefined
    const exitTimer = window.setTimeout(() => {
      setIsRemoved(true)
    }, EXIT_HOLD_TIME)
    return () => window.clearTimeout(exitTimer)
  }, [minTimeElapsed, assetsReady])

  if (isRemoved) return null

  const isExiting = minTimeElapsed && assetsReady
  const isTypingDone = typedCount >= WORD.length

  return (
    <div
      className={`minimal-loader ${isExiting ? 'minimal-loader--done' : ''}`}
      role="status"
      aria-label="Loading Evolut"
      aria-live="polite"
    >
      <div className="minimal-loader__content">
        <div className="minimal-loader__logo-wrap">
          <img
            src="/assets/logo-white.png"
            alt="Evolut"
            className="minimal-loader__logo"
          />
          <div className="minimal-loader__glow" aria-hidden="true" />
        </div>

        <div className="minimal-loader__wordmark" aria-label={WORD}>
          {WORD.slice(0, typedCount).split('').map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className="minimal-loader__letter"
            >
              {letter}
            </span>
          ))}
          <span
            className={`minimal-loader__cursor ${isTypingDone ? 'minimal-loader__cursor--idle' : ''}`}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  )
}
