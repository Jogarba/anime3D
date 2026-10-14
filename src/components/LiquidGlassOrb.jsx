import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import {
  WARP_APPROACH_START,
  WARP_TRAVERSE_START,
  WARP_TRAVERSE_END,
  WARP_EXIT_TRAVEL,
} from '../sceneSequence'
import { AVATAR_MOODS } from '../constants/avatarMoods'

const ORB_FLIGHT_START = WARP_APPROACH_START + 0.25
const ORB_PORTAL_EXIT_PROGRESS = WARP_TRAVERSE_END + WARP_EXIT_TRAVEL
const ORB_HOP_LEAD_IN = 0.45

export default function LiquidGlassOrb({ progress, isVisible = true }) {
  const containerRef = useRef(null)
  const [mood, setMood] = useState('attentif')
  const moodRef = useRef('attentif')
  const [isHovered, setIsHovered] = useState(false)

  // Fluid physics animation state references (running in 60fps rAF loop)
  const physicsRef = useRef({
    targetTiltX: 0,
    targetTiltY: 0,
    currentTiltX: 0,
    currentTiltY: 0,
    floatY: 0,
    floatX: 0,
    rotation: 0,
    squashX: 1,
    squashY: 1,
    clickRippleTime: -999,
  })

  const avatarWrapperRef = useRef(null)
  const glowRingRef = useRef(null)
  const rippleRingRef = useRef(null)
  const idleTimerRef = useRef(null)
  const moodTimeoutRef = useRef(null)
  const orbIsInteractive = isVisible && progress?.current < ORB_PORTAL_EXIT_PROGRESS

  const changeMood = useCallback((newMood) => {
    if (moodRef.current !== newMood && AVATAR_MOODS[newMood]) {
      moodRef.current = newMood
      setMood(newMood)
    }
  }, [])

  // Preload all mood SVGs
  useEffect(() => {
    Object.values(AVATAR_MOODS).forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [])

  // Reset idle sleepy timer
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => {
      changeMood('somnolent')
    }, 16000)
  }, [changeMood])

  // Continuous organic living physics loop (Floating, Breathing, Spring Lerp, Elastic Bounce + Portal Warp Flight)
  useEffect(() => {
    let frameId = 0
    let startTime = performance.now()

    const loop = (now) => {
      const t = (now - startTime) * 0.001
      const p = physicsRef.current
      const currentP = (progress && typeof progress.current === 'number') ? progress.current : 0
      const opacity = Number(document.documentElement.style.getPropertyValue('--login-opacity')) || 0
      // Begin the orb's flight with the camera's approach so it leads the camera
      // through the model core instead of appearing after the core crossing.
      const warpActive = currentP >= ORB_FLIGHT_START
      let portalHopPulse = 0

      // 1. Orbital position during normal state vs Portal Warp Flight
      if (containerRef.current) {
        containerRef.current.style.pointerEvents =
          opacity > 0.3 && currentP < ORB_FLIGHT_START ? 'auto' : 'none'
        if (!warpActive) {
          containerRef.current.style.transition = ''
          containerRef.current.style.transform = 'translate3d(-50%, 0px, 0px) scale(1)'
          containerRef.current.style.opacity = String(opacity)
        } else {
          // The path is updated every frame, so avoid CSS transition lag behind the camera.
          containerRef.current.style.transition = 'none'
          // The orb enters ahead of the camera, then stays alongside the user
          // throughout the tunnel instead of fading away at the portal.
          const entryT = THREE.MathUtils.smoothstep(
            currentP,
            ORB_FLIGHT_START,
            WARP_TRAVERSE_START,
          )
          const tunnelT = THREE.MathUtils.smoothstep(
            currentP,
            WARP_TRAVERSE_START,
            ORB_PORTAL_EXIT_PROGRESS,
          )
          const fadeIn = THREE.MathUtils.smoothstep(
            currentP,
            ORB_FLIGHT_START,
            ORB_FLIGHT_START + 0.14,
          )
          // Begin the orb's final arc slightly before the redirect so its
          // movement has enough screen time to read clearly. Other transition
          // elements remain driven by their original progress ranges.
          const hopProgress = THREE.MathUtils.clamp(
            (currentP - (WARP_TRAVERSE_END - ORB_HOP_LEAD_IN)) /
              (WARP_EXIT_TRAVEL + ORB_HOP_LEAD_IN),
            0,
            1,
          )
          // A symmetric quintic curve avoids the abrupt upward snap of the
          // previous ease-out and keeps the orb's full arc visibly fluid.
          const hopT = hopProgress * hopProgress * hopProgress *
            (hopProgress * (hopProgress * 6 - 15) + 10)
          portalHopPulse = Math.sin(Math.PI * hopT)
          const entryScale = THREE.MathUtils.lerp(0.95, 0.82, entryT)
          const tunnelScale = entryScale - 0.05 * tunnelT
          const orbScale = tunnelScale + 0.2 * portalHopPulse + 0.18 * hopT
          // Keep the orb anchored near the bottom throughout the closed-shutter
          // portion of the transition. It rises toward the portal only during
          // the final hop, once the shutter starts opening.
          const companionY = -2 * entryT
          const orbY = THREE.MathUtils.lerp(companionY, -49, hopT) - 8 * portalHopPulse
          const orbX = THREE.MathUtils.lerp(24 * tunnelT, -12, hopT)
          containerRef.current.style.transform = `translate3d(calc(-50% + ${orbX.toFixed(2)}vw), ${orbY.toFixed(2)}vh, 0px) scale(${orbScale.toFixed(3)})`
          containerRef.current.style.opacity = fadeIn.toFixed(3)
          if (moodRef.current !== 'excite') {
            changeMood('excite')
          }
        }
      }

      // 2. Organic multi-frequency levitation & breathing
      const isSomnolent = moodRef.current === 'somnolent'
      const floatSpeed = isSomnolent ? 0.9 : warpActive ? 3.8 : 1.7
      const floatAmp = isSomnolent ? 3.5 : warpActive ? 1.8 : 5.5

      p.floatY = Math.sin(t * floatSpeed) * floatAmp + Math.cos(t * floatSpeed * 0.5) * (floatAmp * 0.3)
      p.floatX = Math.cos(t * (floatSpeed * 0.7)) * 2.2
      p.rotation = Math.sin(t * (floatSpeed * 0.8)) * 1.8

      // Natural rhythmic breathing (squash & stretch)
      const breathFreq = isSomnolent ? 1.2 : warpActive ? 4.5 : 2.0
      const breathAmp = isSomnolent ? 0.015 : warpActive ? 0.04 : 0.024
      const baseSquashY = 1 + Math.sin(t * breathFreq) * breathAmp
      const baseSquashX = 1 - Math.sin(t * breathFreq) * (breathAmp * 0.7)

      // 3. Smooth spring interpolation for cursor gaze tracking
      p.currentTiltX += (p.targetTiltX - p.currentTiltX) * 0.09
      p.currentTiltY += (p.targetTiltY - p.currentTiltY) * 0.09

      // 4. Elastic click bounce physics
      const clickAge = t - p.clickRippleTime
      let bounceScaleX = 1
      let bounceScaleY = 1
      if (clickAge >= 0 && clickAge < 1.2) {
        const decay = Math.exp(-clickAge * 4.5)
        const osc = Math.cos(clickAge * 14.0)
        bounceScaleX = 1 - decay * osc * 0.16
        bounceScaleY = 1 + decay * osc * 0.22
      }

      const finalScaleX = baseSquashX * bounceScaleX
      const finalScaleY = baseSquashY * bounceScaleY

      // Apply 3D matrix transform to the avatar wrapper
      if (avatarWrapperRef.current) {
        avatarWrapperRef.current.style.transform = `
          translate3d(${p.floatX.toFixed(2)}px, ${p.floatY.toFixed(2)}px, 0px)
          perspective(700px)
          rotateY(${p.currentTiltX.toFixed(2)}deg)
          rotateX(${p.currentTiltY.toFixed(2)}deg)
          rotateZ(${p.rotation.toFixed(2)}deg)
          scale(${finalScaleX.toFixed(3)}, ${finalScaleY.toFixed(3)})
        `
      }

      // Aura glow breathing & propulsion
      if (glowRingRef.current) {
        if (warpActive) {
          const glowScale = 1.45 + Math.sin(t * 18) * 0.35 + portalHopPulse * 0.38
          glowRingRef.current.style.transform = `scale(${glowScale.toFixed(2)})`
          glowRingRef.current.style.opacity = '0.98'
        } else {
          const glowScale = 1 + Math.sin(t * floatSpeed) * 0.08
          glowRingRef.current.style.transform = `scale(${glowScale.toFixed(3)})`
          glowRingRef.current.style.opacity = '0.75'
        }
      }

      // Expanding click ripple
      if (rippleRingRef.current && clickAge >= 0 && clickAge < 0.9) {
        const rippleScale = 0.8 + clickAge * 1.6
        const rippleOpacity = Math.max(0, 1 - clickAge / 0.9) * 0.75
        rippleRingRef.current.style.transform = `scale(${rippleScale.toFixed(3)})`
        rippleRingRef.current.style.opacity = rippleOpacity.toFixed(3)
      } else if (rippleRingRef.current) {
        rippleRingRef.current.style.opacity = '0'
      }

      frameId = requestAnimationFrame(loop)
    }

    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [changeMood, progress])

  // Click on Avatar: Pure visual micro-reaction (Surprised -> Happy)
  const handleOrbClick = () => {
    resetIdleTimer()

    // Trigger elastic bounce and ripple
    physicsRef.current.clickRippleTime = (performance.now() - 0) * 0.001

    // Micro-reaction: Surprised -> Happy
    if (moodTimeoutRef.current) clearTimeout(moodTimeoutRef.current)
    setMood('surpris')

    moodTimeoutRef.current = setTimeout(() => {
      setMood('heureux')
      moodTimeoutRef.current = setTimeout(() => {
        setMood('attentif')
        resetIdleTimer()
      }, 2600)
    }, 280)
  }

  // Smooth mouse move parallax tilt
  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)

    physicsRef.current.targetTiltX = Math.max(-20, Math.min(20, x * 22))
    physicsRef.current.targetTiltY = Math.max(-20, Math.min(20, -y * 22))
    resetIdleTimer()

    if (mood !== 'surpris' && mood !== 'heureux') {
      setMood('curieux')
    }
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
    resetIdleTimer()
    if (mood !== 'surpris' && mood !== 'heureux') {
      setMood('curieux')
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    physicsRef.current.targetTiltX = 0
    physicsRef.current.targetTiltY = 0
    resetIdleTimer()
    if (mood !== 'surpris') {
      setMood('attentif')
    }
  }

  useEffect(() => {
    resetIdleTimer()
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      if (moodTimeoutRef.current) clearTimeout(moodTimeoutRef.current)
    }
  }, [resetIdleTimer])

  return (
    <button
      type="button"
      ref={containerRef}
      className={`liquid-orb-container bloub-avatar-root ${
        isHovered ? 'bloub-avatar--hovered' : ''
      }`}
      style={{
        opacity: 'var(--login-opacity, 0)',
        pointerEvents: 'none',
        '--orb-scale': '0.95',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleOrbClick}
      aria-label="Evolut AI Assistant Avatar"
      title="Interactive Evolut avatar"
      aria-hidden={!orbIsInteractive}
      tabIndex={orbIsInteractive ? 0 : -1}
    >
      {/* Dynamic Ambient Aura Glow */}
      <div ref={glowRingRef} className="siri-glow-ring bloub-aura-glow" aria-hidden="true" />

      {/* Elastic Click Pulse Wave */}
      <div ref={rippleRingRef} className="bloub-click-ripple" aria-hidden="true" />

      {/* Hexagonal Animated SVG Avatar with real-time 60fps 3D Physics */}
      <div ref={avatarWrapperRef} className="bloub-avatar-wrapper">
        {Object.entries(AVATAR_MOODS).map(([mKey, svgSrc]) => {
          const isActive = mood === mKey
          return (
            <img
              key={mKey}
              src={svgSrc}
              alt={`Evolut Avatar (${mKey})`}
              className={`bloub-avatar-svg ${isActive ? 'bloub-avatar-svg--active' : 'bloub-avatar-svg--inactive'}`}
              draggable="false"
              aria-hidden={!isActive}
            />
          )
        })}
      </div>
    </button>
  )
}
