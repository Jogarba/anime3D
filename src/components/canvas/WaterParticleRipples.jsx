import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function WaterParticleRipples() {
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
