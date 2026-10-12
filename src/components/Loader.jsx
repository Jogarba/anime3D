import { useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'

const LOADER_DURATION = 6800
const EXIT_HOLD_TIME = 650
const SAFETY_TIMEOUT = 9000
const SCENE_REVEAL_START = 0.46
const CROSSFADE_START = 0.82

export default function Loader({ modelReady, initialRevealProgress, onSceneReveal, onReveal }) {
  const { active, progress, errors } = useProgress()
  const [sceneRevealElapsed, setSceneRevealElapsed] = useState(false)
  const [crossfadeReached, setCrossfadeReached] = useState(false)
  const [isRemoved, setIsRemoved] = useState(false)
  const [forceReady, setForceReady] = useState(false)

  const assetsReady = forceReady || (modelReady && (errors.length > 0 || !active || progress >= 100))
  const isExiting = crossfadeReached && assetsReady

  useEffect(() => {
    const safetyTimer = window.setTimeout(() => setForceReady(true), SAFETY_TIMEOUT)
    const startTime = performance.now()
    let frameId
    let sceneRevealSent = false
    let crossfadeSent = false

    const updateRevealProgress = () => {
      const elapsed = Math.min((performance.now() - startTime) / LOADER_DURATION, 1)
      const phaseProgress = Math.max(0, Math.min(1, (elapsed - SCENE_REVEAL_START) / (1 - SCENE_REVEAL_START)))
      const revealProgress = phaseProgress * phaseProgress * phaseProgress * (phaseProgress * (phaseProgress * 6 - 15) + 10)
      initialRevealProgress.current = revealProgress
      const nav = document.querySelector('.site-nav')
      if (nav) {
        nav.style.opacity = String(revealProgress)
        nav.style.transform = `translate3d(0, ${(1 - revealProgress) * -12}px, 0)`
      }
      const canvas = document.querySelector('.canvas-wrap')
      if (canvas) canvas.style.opacity = String(revealProgress)

      if (!sceneRevealSent && elapsed >= SCENE_REVEAL_START) {
        sceneRevealSent = true
        setSceneRevealElapsed(true)
      }
      if (!crossfadeSent && phaseProgress >= CROSSFADE_START) {
        crossfadeSent = true
        setCrossfadeReached(true)
      }
      if (elapsed < 1) frameId = window.requestAnimationFrame(updateRevealProgress)
    }
    frameId = window.requestAnimationFrame(updateRevealProgress)

    return () => {
      window.clearTimeout(safetyTimer)
      window.cancelAnimationFrame(frameId)
    }
  }, [initialRevealProgress])

  useEffect(() => {
    if (sceneRevealElapsed && (modelReady || forceReady)) onSceneReveal?.()
  }, [sceneRevealElapsed, modelReady, forceReady, onSceneReveal])

  useEffect(() => {
    if (!isExiting) return undefined
    const exitTimer = window.setTimeout(() => {
      onReveal?.()
      setIsRemoved(true)
    }, EXIT_HOLD_TIME)
    return () => window.clearTimeout(exitTimer)
  }, [isExiting, onReveal])

  if (isRemoved) return null

  return (
    <div
      className={`minimal-loader ${isExiting ? 'minimal-loader--done' : ''}`}
      role="status"
      aria-label="Cargando Evolut"
      aria-live="polite"
    >
      <div className="minimal-loader__darkness" aria-hidden="true" />
      <div className="minimal-loader__wordmark" aria-hidden="true">EVOLUT</div>
      <div className="minimal-loader__wheel" aria-hidden="true">
        <img
          src="/assets/logo_hexagonal_gris.svg"
          alt=""
          className="minimal-loader__wheel-logo"
        />
      </div>
    </div>
  )
}