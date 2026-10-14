import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function AmbientParticles({ count = 130 }) {
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
