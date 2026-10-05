import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  WARP_TRAVERSE_START,
  WARP_TRAVERSE_END,
} from '../../sceneSequence'

// 3D Hexagonal Dimensional Wormhole (Subtle concentric 6-sided laser rings and wireframe tunnel)
export default function DimensionalWormhole({ progress }) {
  const tunnelGroup = useRef(null)
  const cylinderRef = useRef(null)
  const ringCount = 15

  const ringsData = useMemo(() => {
    return Array.from({ length: ringCount }, (_, i) => {
      const z = -i * 0.85 // from 0 to -11.9
      const radius = 1.6 + i * 0.05
      const color = i % 3 === 0 ? '#38bdf8' : '#7dd3fc'
      return { z, radius, color }
    })
  }, [ringCount])

  useFrame((state) => {
    if (!tunnelGroup.current) return
    const p = progress.current
    if (p < WARP_TRAVERSE_START || !state.camera.userData.hasTraversedCore) {
      tunnelGroup.current.visible = false
      return
    }

    tunnelGroup.current.visible = true
    const warpProgress = THREE.MathUtils.smoothstep(p, WARP_TRAVERSE_START, WARP_TRAVERSE_END)
    const t = state.clock.getElapsedTime()

    // Stately hexagonal drift
    tunnelGroup.current.rotation.z = t * 0.08
    if (cylinderRef.current) {
      cylinderRef.current.rotation.y = t * 0.04
    }

    // Gentle depth expansion
    const s = THREE.MathUtils.lerp(0.85, 1.15, warpProgress)
    tunnelGroup.current.scale.set(s, s, s)

    const op = THREE.MathUtils.clamp(warpProgress, 0, 0.55)
    tunnelGroup.current.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.opacity = op * (child.userData.baseOp || 0.4)
      }
    })
  })

  return (
    <group ref={tunnelGroup} position={[0, 0, 0]} visible={false}>
      {/* 10 Crisp Hexagonal Blueprint Rings */}
      {ringsData.map((ring, idx) => (
        <group key={idx} position={[0, 0, ring.z]}>
          <mesh userData={{ baseOp: 0.45 - idx * 0.025 }}>
            <ringGeometry args={[ring.radius * 0.985, ring.radius, 6]} />
            <meshBasicMaterial
              color={ring.color}
              transparent
              opacity={0}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      {/* Outer 6-Sided Hexagonal Cyber Tunnel Prism (Subtle Wireframe) */}
      <mesh
        ref={cylinderRef}
        position={[0, 0, -5.8]}
        rotation={[Math.PI / 2, 0, 0]}
        userData={{ baseOp: 0.18 }}
      >
          <cylinderGeometry args={[2.2, 1.4, 12.4, 6, 12, true]} />
        <meshBasicMaterial
          color="#38bdf8"
          wireframe
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Hexagonal Horizon Singularity at Tunnel Exit */}
      <mesh position={[0, 0, -12.1]} userData={{ baseOp: 0.35 }}>
        <ringGeometry args={[0.02, 1.2, 6]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
