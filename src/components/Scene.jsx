import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Float, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import Model from './Model'
import {
  ALIGN_DURATION,
  BLACK_FADE_DURATION,
  CYCLE_DURATION,
  FIRST_CROSS_END,
  FIRST_ALIGN_END,
  FIRST_PASSAGE_END,
  FIRST_PORTAL,
  HOME_DURATION,
  HOME_HOLD_DURATION,
  PORTAL_APPROACH_DURATION,
  PORTAL_APPROACH_Z,
  PORTAL_CONTENT_HOLD_DURATION,
  PASSAGE_ENTRY_Z,
  PORTALS,
  RETURN_DURATION,
  TURN_SCROLL_DISTANCE,
} from '../sceneSequence'

const PORTAL_LOOK_AWAY_START = 0.96

function AnimatedModel({ progress }) {
  const group = useRef(null)

  useFrame((state, delta) => {
    if (!group.current) return
    const turnProgress = THREE.MathUtils.clamp(progress.current / TURN_SCROLL_DISTANCE, 0, 1)
    const heroFactor = 1 - turnProgress
    const time = state.clock.getElapsedTime()

    // 1. Multi-frequency non-repeating organic drift (simulating natural floating in fluid/air)
    const driftY = (Math.sin(time * 0.75) * 0.09 + Math.sin(time * 1.63 + 1.2) * 0.045 + Math.sin(time * 2.87) * 0.018) * heroFactor
    const driftX = (Math.cos(time * 0.62) * 0.07 + Math.cos(time * 1.41 + 2.3) * 0.035 + Math.sin(time * 2.33) * 0.015) * heroFactor
    const driftZ = (Math.sin(time * 0.53 + 0.7) * 0.05 + Math.cos(time * 1.19) * 0.02) * heroFactor

    // 2. Subtle living "breathing" micro-pulse
    const breath = (Math.sin(time * 1.25) * 0.016 + Math.sin(time * 2.5 + 0.8) * 0.005) * heroFactor

    // 3. Subtle cursor awareness (the entity naturally gazes towards the user's mouse)
    const pointer = state.pointer || { x: 0, y: 0 }
    const mouseLookY = pointer.x * 0.26 * heroFactor
    const mouseLookX = -pointer.y * 0.20 * heroFactor
    const mouseShiftX = pointer.x * 0.12 * heroFactor
    const mouseShiftY = pointer.y * 0.08 * heroFactor

    // 4. Natural bio-organic rotational wobble (pitch, yaw, roll)
    const bioTiltX = (Math.sin(time * 0.92) * 0.07 + Math.cos(time * 1.83) * 0.03) * heroFactor
    const bioTiltY = (Math.cos(time * 0.78) * 0.10 + Math.sin(time * 1.54) * 0.035) * heroFactor
    const bioTiltZ = (Math.sin(time * 0.65) * 0.045 + Math.cos(time * 1.37) * 0.02) * heroFactor

    // 5. Dynamic scale: compact on Hero (0.42), expands to 1.0 upon scroll + breathing pulse
    const baseScale = THREE.MathUtils.lerp(0.42, 1.0, THREE.MathUtils.smoothstep(turnProgress, 0, 0.85))
    const targetScale = baseScale + breath
    const currentScale = group.current.scale.x || 0.42
    const smoothedScale = THREE.MathUtils.damp(currentScale, targetScale, 4.0, delta)
    group.current.scale.set(smoothedScale, smoothedScale, smoothedScale)

    // 6. Fluid position damping
    const targetX = driftX + mouseShiftX
    const targetY = driftY + mouseShiftY
    const targetZ = driftZ
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, targetX, 3.2, delta)
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, targetY, 3.2, delta)
    group.current.position.z = THREE.MathUtils.damp(group.current.position.z, targetZ, 3.0, delta)

    // 7. Fluid rotation damping: combines scroll spin on Z with living tilt and mouse tracking
    const scrollRotZ = -turnProgress * Math.PI * 2
    const targetRotX = mouseLookX + bioTiltX
    const targetRotY = mouseLookY + bioTiltY
    const targetRotZ = scrollRotZ + bioTiltZ

    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetRotX, 3.5, delta)
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetRotY, 3.5, delta)
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, targetRotZ, 4.5, delta)
  })

  return <Model groupRef={group} />
}




function ResponsiveCamera({ progress }) {
  const { camera, size } = useThree()
  const initialDistance = useRef(6)

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
    const firstCrossEnd = PORTAL_APPROACH_DURATION + BLACK_FADE_DURATION
    let targetX = 0
    let targetY = 0
    let targetZ = homeZ
    let lookAtX = 0
    let lookAtY = 0
    let lookAtZ = 0

    if (p < FIRST_ALIGN_END) {
      const align = THREE.MathUtils.smoothstep(p, TURN_SCROLL_DISTANCE, FIRST_ALIGN_END)
      targetX = FIRST_PORTAL.x * align
      targetY = FIRST_PORTAL.y * align
      lookAtX = targetX
      lookAtY = targetY
    } else if (p < FIRST_CROSS_END) {
      const passageProgress = p - FIRST_ALIGN_END
      targetX = FIRST_PORTAL.x
      targetY = FIRST_PORTAL.y
      lookAtX = targetX
      lookAtY = targetY

      if (passageProgress < PORTAL_APPROACH_DURATION) {
        const approach = THREE.MathUtils.smoothstep(passageProgress, 0, PORTAL_APPROACH_DURATION)
        targetZ = THREE.MathUtils.lerp(homeZ, PORTAL_APPROACH_Z, approach)
      } else {
        const crossingProgress = passageProgress - PORTAL_APPROACH_DURATION
        const crossing = THREE.MathUtils.smoothstep(crossingProgress, 0, BLACK_FADE_DURATION)
        const lookAway = THREE.MathUtils.smoothstep(crossing, PORTAL_LOOK_AWAY_START, 1)
        targetZ = THREE.MathUtils.lerp(PORTAL_APPROACH_Z, PASSAGE_ENTRY_Z, crossing)
        lookAtZ = THREE.MathUtils.lerp(0, -5.5, lookAway)
      }
    } else if (p < FIRST_PASSAGE_END) {
      targetX = FIRST_PORTAL.x
      targetY = FIRST_PORTAL.y
      targetZ = PASSAGE_ENTRY_Z
      lookAtX = FIRST_PORTAL.x
      lookAtY = FIRST_PORTAL.y
      lookAtZ = -5.5
    } else {
      const cycleIndex = Math.min(PORTALS.length - 1, Math.floor((p - FIRST_PASSAGE_END) / CYCLE_DURATION))
      const cycleStart = FIRST_PASSAGE_END + cycleIndex * CYCLE_DURATION
      const cycleProgress = p - cycleStart
      const previousPortal = cycleIndex === 0 ? FIRST_PORTAL : PORTALS[cycleIndex - 1]
      const portal = PORTALS[cycleIndex]
      const homeEnd = RETURN_DURATION + HOME_DURATION
      const holdEnd = homeEnd + HOME_HOLD_DURATION
      const alignEnd = holdEnd + ALIGN_DURATION

      if (cycleProgress < RETURN_DURATION) {
        const retreat = THREE.MathUtils.smoothstep(cycleProgress, 0, RETURN_DURATION)
        targetX = previousPortal.x
        targetY = previousPortal.y
        targetZ = THREE.MathUtils.lerp(PASSAGE_ENTRY_Z, homeZ, retreat)
        lookAtX = targetX
        lookAtY = targetY
        lookAtZ = THREE.MathUtils.lerp(-5.5, 0, retreat)
      } else if (cycleProgress < homeEnd) {
        const home = THREE.MathUtils.smoothstep(cycleProgress, RETURN_DURATION, homeEnd)
        targetX = THREE.MathUtils.lerp(previousPortal.x, 0, home)
        targetY = THREE.MathUtils.lerp(previousPortal.y, 0, home)
        lookAtX = targetX
        lookAtY = targetY
      } else if (cycleProgress < holdEnd) {
        targetX = 0
        targetY = 0
        lookAtX = 0
        lookAtY = 0
      } else if (cycleProgress < alignEnd) {
        const align = THREE.MathUtils.smoothstep(cycleProgress, holdEnd, alignEnd)
        targetX = portal.x * align
        targetY = portal.y * align
        lookAtX = targetX
        lookAtY = targetY
      } else if (cycleProgress < CYCLE_DURATION - PORTAL_CONTENT_HOLD_DURATION) {
        const passageProgress = cycleProgress - alignEnd
        targetX = portal.x
        targetY = portal.y
        lookAtX = targetX
        lookAtY = targetY

        if (passageProgress < PORTAL_APPROACH_DURATION) {
          const approach = THREE.MathUtils.smoothstep(passageProgress, 0, PORTAL_APPROACH_DURATION)
          targetZ = THREE.MathUtils.lerp(homeZ, PORTAL_APPROACH_Z, approach)
        } else {
          const crossingProgress = passageProgress - PORTAL_APPROACH_DURATION
          const crossing = THREE.MathUtils.smoothstep(crossingProgress, 0, BLACK_FADE_DURATION)
          const lookAway = THREE.MathUtils.smoothstep(crossing, PORTAL_LOOK_AWAY_START, 1)
          targetZ = THREE.MathUtils.lerp(PORTAL_APPROACH_Z, PASSAGE_ENTRY_Z, crossing)
          lookAtZ = THREE.MathUtils.lerp(0, -5.5, lookAway)
        }
      } else {
        targetX = portal.x
        targetY = portal.y
        targetZ = PASSAGE_ENTRY_Z
        lookAtX = portal.x
        lookAtY = portal.y
        lookAtZ = -5.5
      }
    }

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, ease)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, ease)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, ease)
    camera.lookAt(lookAtX, lookAtY, lookAtZ)
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
        <Suspense fallback={null}>
          <AnimatedModel progress={progress} />
          <OfflineEnvironment />
          <ContactShadows position={[0, -2.2, 0]} opacity={0.24} scale={8} blur={2.8} far={5} />
        </Suspense>
      </Canvas>
    </div>
  )
}
