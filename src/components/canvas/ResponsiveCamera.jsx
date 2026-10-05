import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  INITIAL_ZOOM_DISTANCE,
  OVERVIEW_ZOOM_OUT_START,
  OVERVIEW_ZOOM_OUT_END,
  WARP_APPROACH_START,
  WARP_APPROACH_END,
  WARP_TRAVERSE_START,
  WARP_TRAVERSE_END,
  WARP_EXIT_TRAVEL,
} from '../../sceneSequence'

export default function ResponsiveCamera({ progress }) {
  const { camera, size } = useThree()
  const initialDistance = useRef(6)
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0))
  const wasPastCore = useRef(false)

  useEffect(() => {
    const aspect = size.width / Math.max(size.height, 1)
    const distance = Math.max(6, 4.2 / (Math.max(aspect, 0.45) * 2 * Math.tan(THREE.MathUtils.degToRad(17.5))))
    initialDistance.current = distance
    camera.position.set(0, 0, distance)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    camera.userData.hasTraversedCore = false
    wasPastCore.current = false
    document.documentElement.dataset.cameraCrossedCore = 'false'
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
      // Zoom starts following the initial turn
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
      // Phase 1: Camera pulls back smoothly to full model overview (identical to start)
      const zoomOutFactor = THREE.MathUtils.smoothstep(p, OVERVIEW_ZOOM_OUT_START, OVERVIEW_ZOOM_OUT_END)
      targetX = 0
      targetY = THREE.MathUtils.lerp(1.35, 0, zoomOutFactor)
      targetZ = THREE.MathUtils.lerp(1.85, homeZ, zoomOutFactor)
      lookAtX = 0
      lookAtY = THREE.MathUtils.lerp(1.35, 0, zoomOutFactor)
      lookAtZ = 0
    } else if (p < WARP_APPROACH_START) {
      // Hold overview view: full 3D model visible in initial state at distance homeZ
      targetX = 0
      targetY = 0
      targetZ = homeZ
      lookAtX = 0
      lookAtY = 0
      lookAtZ = 0
    } else if (p < WARP_APPROACH_END) {
      // Phase 2: Dramatic camera plunge from full distance (homeZ) straight into the center core of the 3D model
      const approachFactor = THREE.MathUtils.smoothstep(p, WARP_APPROACH_START, WARP_APPROACH_END)
      targetX = 0
      targetY = 0
      targetZ = THREE.MathUtils.lerp(homeZ, 1.0, approachFactor)
      lookAtX = 0
      lookAtY = 0
      lookAtZ = THREE.MathUtils.lerp(0, -4.0, approachFactor)
    } else {
      // One uninterrupted traversal, continuing through the shutter during redirect.
      const traverseFactor = THREE.MathUtils.smoothstep(
        p,
        WARP_TRAVERSE_START,
        WARP_TRAVERSE_END + WARP_EXIT_TRAVEL,
      )
      targetX = 0
      targetY = 0
      targetZ = THREE.MathUtils.lerp(1.0, -14.0, traverseFactor)
      lookAtX = 0
      lookAtY = 0
      lookAtZ = THREE.MathUtils.lerp(-4.0, -21.0, traverseFactor)
    }

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, ease)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, ease)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, ease)

    currentLookAt.current.x = THREE.MathUtils.lerp(currentLookAt.current.x, lookAtX, ease)
    currentLookAt.current.y = THREE.MathUtils.lerp(currentLookAt.current.y, lookAtY, ease)
    currentLookAt.current.z = THREE.MathUtils.lerp(currentLookAt.current.z, lookAtZ, ease)
    camera.lookAt(currentLookAt.current.x, currentLookAt.current.y, currentLookAt.current.z)

    const hasTraversedCore = camera.position.z <= -0.15
    camera.userData.hasTraversedCore = hasTraversedCore
    if (hasTraversedCore !== wasPastCore.current) {
      wasPastCore.current = hasTraversedCore
      document.documentElement.dataset.cameraCrossedCore = String(hasTraversedCore)
    }
  })

  return null
}
