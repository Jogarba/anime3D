import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import {
  WARP_TRAVERSE_START,
  WARP_TRAVERSE_END,
} from '../sceneSequence'
import { AVATAR_MOODS } from '../constants/avatarMoods'

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
      const hasTraversedCore = document.documentElement.dataset.cameraCrossedCore === 'true'
      const warpActive = currentP >= WARP_TRAVERSE_START && hasTraversedCore

      // 1. Orbital position during normal state vs Portal Warp Flight
      if (containerRef.current) {
        containerRef.current.style.pointerEvents =
          opacity > 0.3 && currentP < WARP_TRAVERSE_START ? 'auto' : 'none'
        if (!warpActive) {
          containerRef.current.style.transform = 'translate3d(-50%, 0px, 0px) scale(1)'
          containerRef.current.style.opacity = String(opacity)
        } else {
          // Traverse phase: orb accelerates and dives through the aperture into singularity ahead of camera
          const traverseT = THREE.MathUtils.smoothstep(currentP, WARP_TRAVERSE_START, WARP_TRAVERSE_END)
          const orbY = -38 - traverseT * 6 // vh
          const orbScale = Math.max(0.02, THREE.MathUtils.lerp(0.65, 0.04, traverseT))
          const orbFade = Math.max(0, 1 - traverseT * 1.6)
          containerRef.current.style.transform = `translate3d(-50%, ${orbY.toFixed(2)}vh, 0px) scale(${orbScale.toFixed(3)})`
          containerRef.current.style.opacity = (opacity * orbFade).toFixed(3)
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
          const glowScale = 1.45 + Math.sin(t * 18) * 0.35
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

  if (!isVisible) return null

  return (
    <aside
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
      role="button"
      tabIndex={0}
      title="Interactive Evolut avatar"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleOrbClick()
        }
      }}
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
    </aside>
  )
}
