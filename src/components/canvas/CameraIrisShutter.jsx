import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  WARP_TRAVERSE_START,
  WARP_TRAVERSE_END,
  WARP_EXIT_TRAVEL,
} from '../../sceneSequence'

// The iris waits at the far end of the tunnel, then opens with the redirect.
export default function CameraIrisShutter({ progress }) {
  const irisGroup = useRef(null)
  const bladesGroup = useRef([])
  const ringRef = useRef(null)
  const apertureSealRef = useRef(null)

  // Geometric mechanical camera shutter blade profile (60° angled wedge)
  const bladeShape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 0)
    s.lineTo(1.85, 0.48)
    s.lineTo(2.45, 1.58)
    s.lineTo(1.15, 2.15)
    s.lineTo(-0.35, 1.05)
    s.closePath()
    return s
  }, [])

  const bladeEdgeGeom = useMemo(() => {
    const geom = new THREE.ShapeGeometry(bladeShape)
    return new THREE.EdgesGeometry(geom)
  }, [bladeShape])

  useFrame((state) => {
    if (!irisGroup.current) return
    const p = progress.current
    if (p < WARP_TRAVERSE_START || !state.camera.userData.hasTraversedCore) {
      irisGroup.current.visible = false
      return
    }

    irisGroup.current.visible = true
    const t = state.clock.getElapsedTime()

    // Finish opening as the camera travels through the shutter on its way out.
    const scrollOpen = state.camera.userData.hasTraversedCore
      ? THREE.MathUtils.smoothstep(
          p,
          WARP_TRAVERSE_START,
          WARP_TRAVERSE_END + WARP_EXIT_TRAVEL,
        )
      : 0
    const irisOpen = scrollOpen

    if (apertureSealRef.current?.material) {
      apertureSealRef.current.material.opacity = 1 - irisOpen
    }

    // Slow mechanical rotation
    const baseRot = t * 0.06
    irisGroup.current.rotation.z = baseRot

    if (ringRef.current) {
      ringRef.current.rotation.z = -baseRot * 1.4 - irisOpen * 0.35
    }

    bladesGroup.current.forEach((blade, i) => {
      if (!blade) return
      const baseAngle = (i * Math.PI) / 3
      // Mechanical aperture twist & radial sliding expansion
      const twistAngle = baseAngle + irisOpen * 0.88 // ~50° mechanical rotation
      const radius = THREE.MathUtils.lerp(0.28, 3.8, irisOpen) // radial dilation

      blade.position.x = Math.cos(twistAngle) * radius
      blade.position.y = Math.sin(twistAngle) * radius
      blade.rotation.z = twistAngle + Math.PI / 2 + irisOpen * 0.38

      const alpha = THREE.MathUtils.clamp(1.0 - (irisOpen - 0.68) * 3.0, 0.0, 1.0)
      blade.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.opacity = alpha * 0.92
        } else if (child.isLineSegments && child.material) {
          child.material.opacity = alpha * 0.98
        }
      })
    })
  })

  return (
    <group ref={irisGroup} position={[0, 0, -11.65]} scale={0.28} visible={false}>
      {/* Opaque seal hides the space beyond the closed aperture. */}
      <mesh ref={apertureSealRef} position={[0, 0, -0.08]}>
        <circleGeometry args={[2.6, 48]} />
        <meshBasicMaterial
          color="#02050c"
          transparent
          opacity={1}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outer Hexagonal Aperture Guide Collar Housing */}
      <group ref={ringRef}>
        <mesh rotation={[0, 0, 0]}>
          <ringGeometry args={[2.2, 2.45, 6]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.65}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 6]}>
          <ringGeometry args={[2.48, 2.52, 6]} />
          <meshBasicMaterial
            color="#7dd3fc"
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* 6 Mechanical Pivot Bolts on Housing Collar */}
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i * Math.PI) / 3
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 2.34, Math.sin(angle) * 2.34, 0.02]}
            >
              <ringGeometry args={[0.02, 0.08, 6]} />
              <meshBasicMaterial
                color="#38bdf8"
                transparent
                opacity={0.9}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          )
        })}
      </group>

      {/* 6 Overlapping Mechanical Shutter Blades */}
      {Array.from({ length: 6 }).map((_, i) => (
        <group
          key={i}
          ref={(el) => {
            bladesGroup.current[i] = el
          }}
        >
          {/* Shutter Blade Body */}
          <mesh>
            <shapeGeometry args={[bladeShape]} />
            <meshBasicMaterial
              color="#040a18"
              transparent
              opacity={0.92}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Laser Edge Highlight */}
          <lineSegments geometry={bladeEdgeGeom}>
            <lineBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.98}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </lineSegments>
        </group>
      ))}

      {/* Radiant Horizon Glow Disk at Aperture Center */}
      <mesh position={[0, 0, -0.05]}>
          <ringGeometry args={[0.02, 1.8, 48]} />
        <meshBasicMaterial
          color="#7dd3fc"
          transparent
          opacity={0.16}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
