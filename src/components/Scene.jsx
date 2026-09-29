import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Float, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import Model from './Model'
import {
  SECTION_COUNT,
  INITIAL_ZOOM_DISTANCE,
  SECTION_HOLD_DISTANCE,
  SECTION_TRANSITION_DISTANCE,
  SECTION_CYCLE,
  SECTIONS_END,
  OVERVIEW_ZOOM_OUT_START,
  OVERVIEW_ZOOM_OUT_END,
  OVERVIEW_HOLD_END,
  LOGIN_ZOOM_START,
  LOGIN_ZOOM_END,
} from '../sceneSequence'

const PORTAL_LOOK_AWAY_START = 0.96

function AmbientParticles({ count = 130 }) {
  const points = useRef(null)
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8.5
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6.5
      arr[i * 3 + 2] = (Math.random() - 0.5) * 5.5
    }
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    return g
  }, [count])

  useFrame((state) => {
    if (!points.current) return
    const t = state.clock.getElapsedTime() * 0.16
    points.current.rotation.y = t * 0.35
    points.current.rotation.x = Math.sin(t * 0.25) * 0.12
  })

  return (
    <points ref={points} geometry={geom}>
      <pointsMaterial
        size={0.042}
        color="#bae6fd"
        transparent
        opacity={0.55}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

function WaterParticleRipples() {
  const pointsRef = useRef(null)
  const particleCount = 120

  const particleData = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    const waves = []

    for (let ring = 0; ring < 3; ring++) {
      const countPerRing = 40
      for (let i = 0; i < countPerRing; i++) {
        const idx = ring * countPerRing + i
        const angle = (i / countPerRing) * Math.PI * 2 + (Math.random() - 0.5) * 0.15
        waves.push({
          ring,
          angle,
          radius: 0,
          speed: 1.15 - ring * 0.18,
          delay: ring * 0.25,
          zBase: (Math.random() - 0.5) * 0.2,
          active: false,
        })
        pos[idx * 3] = 0
        pos[idx * 3 + 1] = 0
        pos[idx * 3 + 2] = 0
      }
    }

    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return { geom, pos, waves }
  }, [particleCount])

  const anim = useRef({ active: false, time: 0, opacity: 0 })

  useEffect(() => {
    const onWindowClick = () => {
      anim.current = { active: true, time: 0, opacity: 0.55 }
      particleData.waves.forEach((w) => {
        w.radius = 0.15 + (Math.random() - 0.5) * 0.05
        w.active = true
      })
    }

    window.addEventListener('click', onWindowClick)
    return () => window.removeEventListener('click', onWindowClick)
  }, [particleData])

  useFrame((state, delta) => {
    if (!pointsRef.current) return
    if (!anim.current.active) return

    anim.current.time += delta
    anim.current.opacity -= delta * 0.22

    if (anim.current.opacity <= 0.005) {
      anim.current.active = false
      pointsRef.current.visible = false
      return
    }

    pointsRef.current.visible = true
    const { pos, waves, geom } = particleData
    const t = anim.current.time

    waves.forEach((w, i) => {
      if (t < w.delay) {
        pos[i * 3] = 0
        pos[i * 3 + 1] = 0
        pos[i * 3 + 2] = 0
        return
      }

      const activeTime = t - w.delay
      w.radius += delta * w.speed
      const undulation = Math.sin(activeTime * 3.5 + w.angle * 2) * 0.04

      pos[i * 3] = Math.cos(w.angle) * w.radius
      pos[i * 3 + 1] = Math.sin(w.angle) * w.radius
      pos[i * 3 + 2] = w.zBase + undulation
    })

    geom.attributes.position.needsUpdate = true

    if (pointsRef.current.material) {
      pointsRef.current.material.opacity = Math.max(0, anim.current.opacity)
    }
  })

  return (
    <points ref={pointsRef} geometry={particleData.geom} visible={false}>
      <pointsMaterial
        size={0.038}
        color="#7dd3fc"
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

function CursorLight({ progress }) {
  const lightRef = useRef(null)

  useFrame((state) => {
    if (!lightRef.current) return
    const pointer = state.pointer || { x: 0, y: 0 }
    lightRef.current.position.x = THREE.MathUtils.damp(lightRef.current.position.x, pointer.x * 5, 3.5, 0.016)
    lightRef.current.position.y = THREE.MathUtils.damp(lightRef.current.position.y, pointer.y * 3.8, 3.5, 0.016)
    lightRef.current.intensity = 2.6
  })

  return <pointLight ref={lightRef} position={[0, 0, 3.8]} color="#60a5fa" distance={12} decay={1.8} />
}

function AnimatedModel({ progress }) {
  const group = useRef(null)
  const clickWave = useRef({ active: false, time: 0 })
  const prevPointer = useRef({ x: 0, y: 0 })
  const pointerVelocity = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onWindowClick = () => {
      clickWave.current = { active: true, time: 0 }
    }
    window.addEventListener('click', onWindowClick)
    return () => window.removeEventListener('click', onWindowClick)
  }, [])

  useFrame((state, delta) => {
    if (!group.current) return
    const p = progress.current
    const time = state.clock.getElapsedTime()

    // heroFactor: 1 on Hero and Overview, 0 during sections
    let heroFactor = 0
    if (p < INITIAL_ZOOM_DISTANCE) {
      heroFactor = 1 - THREE.MathUtils.clamp(p / (INITIAL_ZOOM_DISTANCE * 0.7), 0, 1)
    } else if (p >= OVERVIEW_ZOOM_OUT_START) {
      heroFactor = THREE.MathUtils.smoothstep(p, OVERVIEW_ZOOM_OUT_START, OVERVIEW_ZOOM_OUT_END)
    }

    // Motion factor: 1.0 everywhere, but smoothly limits motion to ~0.06 only during the login form
    let motionFactor = 1.0
    if (p >= LOGIN_ZOOM_START) {
      const loginProgress = THREE.MathUtils.smoothstep(p, LOGIN_ZOOM_START, LOGIN_ZOOM_END)
      motionFactor = THREE.MathUtils.lerp(1.0, 0.06, loginProgress)
    }

    const activeMotion = heroFactor * motionFactor

    // 1. Cursor velocity momentum
    const pointer = state.pointer || { x: 0, y: 0 }
    const vx = (pointer.x - prevPointer.current.x) / Math.max(delta, 0.001)
    const vy = (pointer.y - prevPointer.current.y) / Math.max(delta, 0.001)
    prevPointer.current.x = pointer.x
    prevPointer.current.y = pointer.y

    pointerVelocity.current.x = THREE.MathUtils.damp(pointerVelocity.current.x, vx, 4.0, delta)
    pointerVelocity.current.y = THREE.MathUtils.damp(pointerVelocity.current.y, vy, 4.0, delta)

    // 2. Water wave impulse on click
    let waterBobY = 0
    let waterBobRotX = 0
    let waterBobScale = 0
    if (clickWave.current.active) {
      clickWave.current.time += delta
      const t = clickWave.current.time
      const decay = Math.exp(-t * 1.6)
      waterBobY = Math.sin(t * 4.8) * 0.07 * decay * activeMotion
      waterBobRotX = Math.cos(t * 4.2) * 0.05 * decay * activeMotion
      waterBobScale = Math.sin(t * 5.0) * 0.025 * decay * activeMotion
      if (t > 2.8) {
        clickWave.current.active = false
      }
    }

    // 3. Multi-frequency organic Lissajous float
    const driftY = (Math.sin(time * 0.82) * 0.085 + Math.sin(time * 1.74 + 1.2) * 0.042) * activeMotion
    const driftX = (Math.cos(time * 0.68) * 0.065 + Math.cos(time * 1.52 + 2.1) * 0.032) * activeMotion
    const driftZ = Math.sin(time * 0.58 + 0.9) * 0.045 * activeMotion

    // 4. Living breathing pulse
    const breath = (Math.sin(time * 1.35) * 0.018 + Math.sin(time * 2.7 + 0.8) * 0.006) * Math.max(activeMotion, 0.15)
    const pulseScale = breath + waterBobScale

    // 5. Cursor gaze & velocity tilt
    const mouseLookY = (pointer.x * 0.22 + pointerVelocity.current.x * 0.010) * activeMotion
    const mouseLookX = (-pointer.y * 0.16 - pointerVelocity.current.y * 0.008) * activeMotion
    const mouseShiftX = pointer.x * 0.12 * activeMotion
    const mouseShiftY = pointer.y * 0.08 * activeMotion

    // 6. Harmonic bio-rotational wobble
    const bioTiltX = (Math.sin(time * 0.95) * 0.05 + Math.cos(time * 1.9) * 0.02) * activeMotion
    const bioTiltY = (Math.cos(time * 0.82) * 0.06 + Math.sin(time * 1.62) * 0.025) * activeMotion
    const bioTiltZ = (Math.sin(time * 0.72) * 0.035 + pointerVelocity.current.x * 0.012) * activeMotion

    // 7. Dynamic scale: 0.92 on Hero / Overview / Login, expands to 1.0 during sections
    let baseScale = 0.92
    if (p < INITIAL_ZOOM_DISTANCE) {
      baseScale = THREE.MathUtils.lerp(0.92, 1.0, THREE.MathUtils.smoothstep(p, 0, INITIAL_ZOOM_DISTANCE))
    } else if (p < OVERVIEW_ZOOM_OUT_START) {
      baseScale = 1.0
    } else if (p < OVERVIEW_ZOOM_OUT_END) {
      const zt = THREE.MathUtils.smoothstep(p, OVERVIEW_ZOOM_OUT_START, OVERVIEW_ZOOM_OUT_END)
      baseScale = THREE.MathUtils.lerp(1.0, 0.92, zt)
    } else {
      baseScale = 0.92
    }

    const targetScale = Math.max(0.2, baseScale + pulseScale)
    const currentScale = group.current.scale.x || 0.92
    const smoothedScale = THREE.MathUtils.damp(currentScale, targetScale, 4.5, delta)
    group.current.scale.set(smoothedScale, smoothedScale, smoothedScale)

    // 8. Fluid position damping with buoyant water bob
    const targetX = driftX + mouseShiftX
    const targetY = driftY + mouseShiftY + waterBobY
    const targetZ = driftZ
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, targetX, 3.4, delta)
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, targetY, 3.4, delta)
    group.current.position.z = THREE.MathUtils.damp(group.current.position.z, targetZ, 3.2, delta)

    // 9. Exact rotation on Z per hexagon station & initial turn on Y
    let scrollRotZ = 0
    let initialTurnY = 0

    if (p < INITIAL_ZOOM_DISTANCE) {
      const initialTurnFactor = THREE.MathUtils.smoothstep(p, 0, INITIAL_ZOOM_DISTANCE * 0.7)
      initialTurnY = initialTurnFactor * Math.PI
      scrollRotZ = 0
    } else if (p < OVERVIEW_ZOOM_OUT_START) {
      initialTurnY = Math.PI
      const sectionOffset = p - INITIAL_ZOOM_DISTANCE
      const cycleIndex = Math.floor(sectionOffset / SECTION_CYCLE)
      const inCycle = sectionOffset - cycleIndex * SECTION_CYCLE

      if (cycleIndex >= SECTION_COUNT - 1) {
        // Last section station (Section 06 / -300deg)
        scrollRotZ = -(SECTION_COUNT - 1) * (Math.PI / 3)
      } else if (inCycle <= SECTION_HOLD_DISTANCE) {
        // Centered on active hexagon
        scrollRotZ = -cycleIndex * (Math.PI / 3)
      } else {
        // Smooth rotation to next hexagon
        const transT = (inCycle - SECTION_HOLD_DISTANCE) / SECTION_TRANSITION_DISTANCE
        const smoothedT = THREE.MathUtils.smoothstep(transT, 0, 1)
        scrollRotZ = -(cycleIndex + smoothedT) * (Math.PI / 3)
      }
    } else if (p < OVERVIEW_ZOOM_OUT_END) {
      const zoomOutFactor = THREE.MathUtils.smoothstep(p, OVERVIEW_ZOOM_OUT_START, OVERVIEW_ZOOM_OUT_END)
      // Smoothly completes rotation back to front-facing upright position
      initialTurnY = THREE.MathUtils.lerp(Math.PI, Math.PI * 2, zoomOutFactor)
      scrollRotZ = THREE.MathUtils.lerp(-(SECTION_COUNT - 1) * (Math.PI / 3), -Math.PI * 2, zoomOutFactor)
    } else {
      initialTurnY = Math.PI * 2
      scrollRotZ = -Math.PI * 2
    }

    const targetRotX = mouseLookX + bioTiltX + waterBobRotX
    const targetRotY = initialTurnY + mouseLookY + bioTiltY
    const targetRotZ = scrollRotZ + bioTiltZ

    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetRotX, 3.8, delta)
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetRotY, 4.5, delta)
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, targetRotZ, 3.0, delta)
  })

  return <Model groupRef={group} progress={progress} />
}

function ResponsiveCamera({ progress }) {
  const { camera, size } = useThree()
  const initialDistance = useRef(6)
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0))

  useEffect(() => {
    const aspect = size.width / Math.max(size.height, 1)
    const distance = Math.max(6, 4.2 / (Math.max(aspect, 0.45) * 2 * Math.tan(THREE.MathUtils.degToRad(17.5))))
    initialDistance.current = distance
    camera.position.set(0, 0, distance)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera, size.width, size.height])

  useFrame((_, delta) => {
    const p = progress.current
    const ease = 1 - Math.pow(0.001, delta)
    const homeZ = initialDistance.current

    let targetX = 0
    let targetY = 0
    let targetZ = homeZ
    let lookAtX = 0
    let lookAtY = 0
    let lookAtZ = 0

    if (p < INITIAL_ZOOM_DISTANCE) {
      // Zoom starts following the initial 180-degree flip
      const zoomFactor = THREE.MathUtils.smoothstep(p, INITIAL_ZOOM_DISTANCE * 0.3, INITIAL_ZOOM_DISTANCE)
      targetX = 0
      targetY = THREE.MathUtils.lerp(0, 1.35, zoomFactor)
      targetZ = THREE.MathUtils.lerp(homeZ, 1.85, zoomFactor)
      lookAtX = 0
      lookAtY = THREE.MathUtils.lerp(0, 1.35, zoomFactor)
      lookAtZ = 0
    } else if (p < OVERVIEW_ZOOM_OUT_START) {
      // Steady camera view framing the top hexagon as model spins through sections
      targetX = 0
      targetY = 1.35
      targetZ = 1.85
      lookAtX = 0
      lookAtY = 1.35
      lookAtZ = 0
    } else if (p < OVERVIEW_ZOOM_OUT_END) {
      // Zoom out to overview: camera pulls back to initial full model position
      const zoomOutFactor = THREE.MathUtils.smoothstep(p, OVERVIEW_ZOOM_OUT_START, OVERVIEW_ZOOM_OUT_END)
      targetX = 0
      targetY = THREE.MathUtils.lerp(1.35, 0, zoomOutFactor)
      targetZ = THREE.MathUtils.lerp(1.85, homeZ, zoomOutFactor)
      lookAtX = 0
      lookAtY = THREE.MathUtils.lerp(1.35, 0, zoomOutFactor)
      lookAtZ = 0
    } else if (p < LOGIN_ZOOM_START) {
      // Hold overview view: full model visible in initial state
      targetX = 0
      targetY = 0
      targetZ = homeZ
      lookAtX = 0
      lookAtY = 0
      lookAtZ = 0
    } else if (p < LOGIN_ZOOM_END) {
      // Zoom deeply into the CENTER core of the 3D model
      const loginZoomFactor = THREE.MathUtils.smoothstep(p, LOGIN_ZOOM_START, LOGIN_ZOOM_END)
      targetX = 0
      targetY = 0
      targetZ = THREE.MathUtils.lerp(homeZ, 1.35, loginZoomFactor)
      lookAtX = 0
      lookAtY = 0
      lookAtZ = 0
    } else {
      // Login section: close-up immersive center of the 3D model
      targetX = 0
      targetY = 0
      targetZ = 1.35
      lookAtX = 0
      lookAtY = 0
      lookAtZ = 0
    }

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, ease)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, ease)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, ease)

    currentLookAt.current.x = THREE.MathUtils.lerp(currentLookAt.current.x, lookAtX, ease)
    currentLookAt.current.y = THREE.MathUtils.lerp(currentLookAt.current.y, lookAtY, ease)
    currentLookAt.current.z = THREE.MathUtils.lerp(currentLookAt.current.z, lookAtZ, ease)
    camera.lookAt(currentLookAt.current.x, currentLookAt.current.y, currentLookAt.current.z)
  })

  return null
}

function OfflineEnvironment() {
  return (
    <Environment resolution={64} frames={1} environmentIntensity={0.55}>
      <Lightformer intensity={2.4} position={[0, 4, -6]} scale={[10, 10, 1]} />
      <Lightformer intensity={1.4} position={[-5, 1, 2]} scale={[6, 6, 1]} />
      <Lightformer intensity={1.4} position={[5, 1, 2]} scale={[6, 6, 1]} />
      <Lightformer
        intensity={0.8}
        position={[0, -4, 2]}
        scale={[10, 2, 1]}
        rotation-x={Math.PI / 2}
      />
    </Environment>
  )
}

export default function Scene({ progress }) {
  return (
    <div className="canvas-wrap" aria-hidden="true">
      <Canvas
        dpr={[1, 1.8]}
        camera={{ position: [0, 0, 7], fov: 35 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ResponsiveCamera progress={progress} />
        <ambientLight intensity={0.65} />
        <directionalLight position={[4, 5, 6]} intensity={2.2} />
        <pointLight position={[-4, 1, 3]} intensity={1.4} />
        <CursorLight progress={progress} />
        <Suspense fallback={null}>
          <AnimatedModel progress={progress} />
          <WaterParticleRipples />
          <AmbientParticles />
          <OfflineEnvironment />
          <ContactShadows position={[0, -2.2, 0]} opacity={0.24} scale={8} blur={2.8} far={5} />
        </Suspense>
      </Canvas>
    </div>
  )
}
