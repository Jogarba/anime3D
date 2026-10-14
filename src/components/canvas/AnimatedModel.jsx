import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import ModelCore from './ModelCore'
import {
  SECTION_COUNT,
  PORTAL_COUNT,
  INITIAL_ZOOM_DISTANCE,
  SECTION_HOLD_DISTANCE,
  SECTION_TRANSITION_DISTANCE,
  SECTION_CYCLE,
  OVERVIEW_ZOOM_OUT_START,
  OVERVIEW_ZOOM_OUT_END,
  WARP_APPROACH_START,
  WARP_APPROACH_END,
  WARP_TRAVERSE_START,
} from '../../sceneSequence'

function lerpShortestAngle(from, to, progress) {
  const delta = THREE.MathUtils.euclideanModulo(
    to - from + Math.PI,
    Math.PI * 2,
  ) - Math.PI
  return from + delta * progress
}

export default function AnimatedModel({ progress, navigationAnimation, isWarpingViaButton = false, isInitialLoading = false, onModelReady }) {
  const group = useRef(null)
  const clickWave = useRef({ active: false, time: 0 })
  const frozenRotation = useMemo(() => new THREE.Euler(), [])
  const navigationPose = useMemo(() => ({
    id: -1,
    rotation: new THREE.Euler(),
    position: new THREE.Vector3(),
    scale: 0.92,
  }), [])
  const wasWarpingViaButton = useRef(false)
  const dragRotation = useRef({ active: false, x: 0, y: 0, lastX: 0, lastY: 0 })

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
    const time = state.clock.elapsedTime

    // Keep the model visible until the camera physically crosses its core.
    // Hiding it at the progress boundary leaves a blank frame while the camera
    // is still approaching the core and the tunnel is correctly hidden.
    const navigation = navigationAnimation?.current
    const returningHome = navigation?.active && navigation.direction === 'to-home'
    if (p >= WARP_TRAVERSE_START && state.camera.userData.hasTraversedCore && !returningHome) {
      group.current.visible = false
      return
    }
    group.current.visible = true

    if (isInitialLoading) {
      group.current.position.set(0, 0, 0)
      group.current.rotation.set(0, 0, 0)
      group.current.scale.setScalar(0.92)
      return
    }

    if (isWarpingViaButton && !wasWarpingViaButton.current) {
      frozenRotation.copy(group.current.rotation)
    }
    wasWarpingViaButton.current = isWarpingViaButton

    if (navigation?.active) {
      if (navigationPose.id !== navigation.id) {
        navigationPose.id = navigation.id
        navigationPose.rotation.copy(group.current.rotation)
        navigationPose.position.copy(group.current.position)
        navigationPose.scale = group.current.scale.x || 0.92
      }
      const t = THREE.MathUtils.smoothstep(navigation.progress, 0, 1)
      const returningHome = navigation.direction === 'to-home'
      const betweenSections = navigation.direction === 'between-sections'
      const start = navigationPose
      const turnDirection = -Math.sign(navigation.targetIndex - navigation.sourceIndex)
      const targetRotationX = betweenSections ? start.rotation.x : 0
      const targetRotationY = betweenSections ? start.rotation.y : returningHome ? 0 : Math.PI
      const targetRotationZ = betweenSections
        ? start.rotation.z + turnDirection * (Math.PI / 3)
        : returningHome || navigation.direction === 'from-initial'
          ? 0
          : -navigation.targetIndex * (Math.PI / 3)
      // The model has six-fold symmetry around Z. Remove the accumulated
      // section turns before returning so every section starts the same
      // short home rotation instead of unwinding a different number of faces.
      const homeStartRotationZ = returningHome
        ? start.rotation.z - Math.round(start.rotation.z / (Math.PI / 3)) * (Math.PI / 3)
        : start.rotation.z
      const targetPositionX = betweenSections ? start.position.x : 0
      const targetPositionY = betweenSections ? start.position.y : 0
      const targetPositionZ = betweenSections ? start.position.z : 0
      const targetScale = betweenSections ? start.scale : returningHome ? 0.92 : 1
      group.current.position.set(
        THREE.MathUtils.lerp(start.position.x, targetPositionX, t),
        THREE.MathUtils.lerp(start.position.y, targetPositionY, t),
        THREE.MathUtils.lerp(start.position.z, targetPositionZ, t),
      )
      group.current.scale.setScalar(THREE.MathUtils.lerp(start.scale, targetScale, t))
      group.current.rotation.set(
        returningHome
          ? lerpShortestAngle(start.rotation.x, targetRotationX, t)
          : THREE.MathUtils.lerp(start.rotation.x, targetRotationX, t),
        returningHome
          ? lerpShortestAngle(start.rotation.y, targetRotationY, t)
          : THREE.MathUtils.lerp(start.rotation.y, targetRotationY, t),
        returningHome
          ? lerpShortestAngle(homeStartRotationZ, targetRotationZ, t)
          : THREE.MathUtils.lerp(start.rotation.z, targetRotationZ, t),
      )
      return
    }

    // heroFactor: 1 on initial Hero view AND on full overview return, 0 during section stations
    let heroFactor = 0
    if (p < INITIAL_ZOOM_DISTANCE) {
      heroFactor = 1 - THREE.MathUtils.clamp(p / (INITIAL_ZOOM_DISTANCE * 0.7), 0, 1)
    } else if (p >= OVERVIEW_ZOOM_OUT_START) {
      heroFactor = THREE.MathUtils.smoothstep(p, OVERVIEW_ZOOM_OUT_START, OVERVIEW_ZOOM_OUT_END)
    }

    // Motion factor during camera plunge: stabilizes to 0 as camera enters aperture dead-center
    let motionFactor = 1.0
    if (p >= WARP_APPROACH_START) {
      const warpProgress = THREE.MathUtils.smoothstep(p, WARP_APPROACH_START, WARP_APPROACH_END)
      motionFactor = THREE.MathUtils.lerp(1.0, 0.0, warpProgress)
    }

    const activeMotion = isWarpingViaButton ? 0 : heroFactor * motionFactor

    // 1. Water wave impulse on click (active on Hero and Overview)
    let waterBobY = 0
    let waterBobRotX = 0
    let waterBobScale = 0
    if (clickWave.current.active) {
      clickWave.current.time += delta
      const t = clickWave.current.time
      const decay = Math.exp(-t * 1.8)
      waterBobY = Math.sin(t * 4.2) * 0.04 * decay * activeMotion
      waterBobRotX = Math.cos(t * 3.8) * 0.025 * decay * activeMotion
      waterBobScale = Math.sin(t * 4.5) * 0.015 * decay * activeMotion
      if (t > 2.2) {
        clickWave.current.active = false
      }
    }

    // 2. Multi-frequency organic Lissajous floating drift
    const driftY = (Math.sin(time * 0.72) * 0.045 + Math.sin(time * 1.54 + 1.2) * 0.02) * activeMotion
    const driftX = (Math.cos(time * 0.58) * 0.035 + Math.cos(time * 1.32 + 2.1) * 0.015) * activeMotion
    const driftZ = Math.sin(time * 0.48 + 0.9) * 0.025 * activeMotion

    // 3. Living breathing pulse
    const breath = (Math.sin(time * 1.2) * 0.012 + Math.sin(time * 2.4 + 0.8) * 0.004) * Math.max(activeMotion, 0.15)
    const pulseScale = breath + waterBobScale

    // 4. Harmonic bio-rotational wobble
    const bioTiltX = (Math.sin(time * 0.85) * 0.025 + Math.cos(time * 1.6) * 0.01) * activeMotion
    const bioTiltY = (Math.cos(time * 0.72) * 0.03 + Math.sin(time * 1.42) * 0.012) * activeMotion
    const bioTiltZ = Math.sin(time * 0.62) * 0.018 * activeMotion

    // 5. Dynamic scale (0.92 on Hero & Overview, 1.0 during sections)
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

    // 6. The model only responds to a deliberate click-and-drag gesture.
    if (!dragRotation.current.active) {
      dragRotation.current.x = THREE.MathUtils.damp(dragRotation.current.x, 0, 3.5, delta)
      dragRotation.current.y = THREE.MathUtils.damp(dragRotation.current.y, 0, 3.5, delta)
    }

    // 7. Fluid position damping, independent from cursor position.
    const targetX = driftX
    const targetY = driftY + waterBobY
    const targetZ = driftZ
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, targetX, 2.8, delta)
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, targetY, 2.8, delta)
    group.current.position.z = THREE.MathUtils.damp(group.current.position.z, targetZ, 2.8, delta)

    // 8. Exact rotation on Z per hexagon station & turn on Y
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

      if (cycleIndex >= PORTAL_COUNT - 1) {
        // Business Case arrives after one full turn; keep that same face
        // aligned while the content fades and the camera pulls back.
        scrollRotZ = -SECTION_COUNT * (Math.PI / 3)
      } else if (inCycle <= SECTION_HOLD_DISTANCE) {
        scrollRotZ = -cycleIndex * (Math.PI / 3)
      } else {
        const transT = (inCycle - SECTION_HOLD_DISTANCE) / SECTION_TRANSITION_DISTANCE
        const smoothedT = THREE.MathUtils.smoothstep(transT, 0, 1)
        scrollRotZ = -(cycleIndex + smoothedT) * (Math.PI / 3)
      }
    } else if (p < OVERVIEW_ZOOM_OUT_END) {
      const zoomOutFactor = THREE.MathUtils.smoothstep(p, OVERVIEW_ZOOM_OUT_START, OVERVIEW_ZOOM_OUT_END)
      initialTurnY = THREE.MathUtils.lerp(Math.PI, Math.PI * 2, zoomOutFactor)
      scrollRotZ = -Math.PI * 2
    } else {
      initialTurnY = Math.PI * 2
      scrollRotZ = -Math.PI * 2
    }

    const targetRotX = bioTiltX + waterBobRotX + dragRotation.current.x
    const targetRotY = initialTurnY + bioTiltY + dragRotation.current.y + (navigationAnimation?.current?.rotationOffsetY ?? 0)
    const targetRotZ = scrollRotZ + bioTiltZ + (navigationAnimation?.current?.rotationOffsetZ ?? 0)

    if (isWarpingViaButton) {
      group.current.rotation.copy(frozenRotation)
    } else {
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetRotX, 3.2, delta)
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetRotY, 3.6, delta)
      group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, targetRotZ, 2.6, delta)
    }
  })

  return (
    <ModelCore
      groupRef={group}
      isInitialLoading={isInitialLoading}
      isWarpingViaButton={isWarpingViaButton}
      dragRotation={dragRotation}
      onModelReady={onModelReady}
    />
  )
}
