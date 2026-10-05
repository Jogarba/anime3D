import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  WARP_TRAVERSE_START,
  WARP_TRAVERSE_END,
} from '../../sceneSequence'

// Hyperspace dimensional warp particles (Sober, minimal depth streaks)
export default function HyperspaceSpeedlines({ progress }) {
  const linesRef = useRef(null)
  const lineCount = 36

  const { geom, lineData } = useMemo(() => {
    const positions = new Float32Array(lineCount * 6)
    const colors = new Float32Array(lineCount * 6)
    const lines = []

    const colorA = new THREE.Color('#38bdf8')
    const colorB = new THREE.Color('#bae6fd')

    for (let i = 0; i < lineCount; i++) {
      const radius = 0.5 + Math.random() * 2.8
      const angle = Math.random() * Math.PI * 2
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      const zBase = (Math.random() - 0.5) * 8
      const length = 0.4 + Math.random() * 0.8
      const speed = 0.6 + Math.random() * 0.9

      const chosenColor = Math.random() < 0.6 ? colorA : colorB

      lines.push({ x, y, z: zBase, length, speed, angle, radius })

      // Head vertex
      positions[i * 6] = x
      positions[i * 6 + 1] = y
      positions[i * 6 + 2] = zBase
      colors[i * 6] = chosenColor.r * 0.7
      colors[i * 6 + 1] = chosenColor.g * 0.7
      colors[i * 6 + 2] = chosenColor.b * 0.7

      // Tail vertex
      positions[i * 6 + 3] = x
      positions[i * 6 + 4] = y
      positions[i * 6 + 5] = zBase - length
      colors[i * 6 + 3] = chosenColor.r * 0.1
      colors[i * 6 + 4] = chosenColor.g * 0.1
      colors[i * 6 + 5] = chosenColor.b * 0.1
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return { geom: g, lineData: lines }
  }, [lineCount])

  useFrame((state, delta) => {
    if (!linesRef.current) return
    const p = progress.current

    if (p < WARP_TRAVERSE_START || !state.camera.userData.hasTraversedCore) {
      linesRef.current.visible = false
      return
    }

    linesRef.current.visible = true
    const warpIntensity = THREE.MathUtils.smoothstep(p, WARP_TRAVERSE_START, WARP_TRAVERSE_END)
    const pos = geom.attributes.position.array

    const warpSpeedMult = THREE.MathUtils.lerp(0.8, 2.2, warpIntensity)
    const stretchMult = THREE.MathUtils.lerp(1.0, 1.4, warpIntensity)

    for (let i = 0; i < lineCount; i++) {
      const line = lineData[i]
      line.z += delta * line.speed * warpSpeedMult

      if (line.z > 4) {
        line.z = -6 - Math.random() * 2
      }

      const curLength = line.length * stretchMult

      pos[i * 6] = line.x
      pos[i * 6 + 1] = line.y
      pos[i * 6 + 2] = line.z

      pos[i * 6 + 3] = line.x
      pos[i * 6 + 4] = line.y
      pos[i * 6 + 5] = line.z - curLength
    }

    geom.attributes.position.needsUpdate = true

    if (linesRef.current.material) {
      linesRef.current.material.opacity = THREE.MathUtils.clamp(warpIntensity * 0.35, 0, 0.35)
    }
  })

  return (
    <lineSegments ref={linesRef} geometry={geom} visible={false}>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  )
}
