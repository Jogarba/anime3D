import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  WARP_TRAVERSE_START,
  WARP_TRAVERSE_END,
} from '../../sceneSequence'

const LINE_COUNT = 36

// Hyperspace streaks use vertex shader motion so frame updates stay on the GPU.
export default function HyperspaceSpeedlines({ progress }) {
  const linesRef = useRef(null)
  const { geometry, uniforms } = useMemo(() => {
    const positions = new Float32Array(LINE_COUNT * 6)
    const colors = new Float32Array(LINE_COUNT * 6)
    const headZ = new Float32Array(LINE_COUNT * 2)
    const lengths = new Float32Array(LINE_COUNT * 2)
    const speeds = new Float32Array(LINE_COUNT * 2)
    const tails = new Float32Array(LINE_COUNT * 2)
    const colorA = new THREE.Color('#38bdf8')
    const colorB = new THREE.Color('#bae6fd')

    for (let i = 0; i < LINE_COUNT; i++) {
      const radius = 0.5 + Math.random() * 2.8
      const angle = Math.random() * Math.PI * 2
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      const z = (Math.random() - 0.5) * 8
      const length = 0.4 + Math.random() * 0.8
      const speed = 0.6 + Math.random() * 0.9
      const chosenColor = Math.random() < 0.6 ? colorA : colorB

      for (let vertex = 0; vertex < 2; vertex++) {
        const index = i * 2 + vertex
        const offset = index * 3
        positions[offset] = x
        positions[offset + 1] = y
        colors[offset] = chosenColor.r * (vertex === 0 ? 0.7 : 0.1)
        colors[offset + 1] = chosenColor.g * (vertex === 0 ? 0.7 : 0.1)
        colors[offset + 2] = chosenColor.b * (vertex === 0 ? 0.7 : 0.1)
        headZ[index] = z
        lengths[index] = length
        speeds[index] = speed
        tails[index] = vertex
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('aHeadZ', new THREE.BufferAttribute(headZ, 1))
    geometry.setAttribute('aLength', new THREE.BufferAttribute(lengths, 1))
    geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    geometry.setAttribute('aTail', new THREE.BufferAttribute(tails, 1))

    return {
      geometry,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 0.8 },
        uStretch: { value: 1 },
        uOpacity: { value: 0 },
      },
    }
  }, [])
  const materialRef = useRef(null)

  useFrame((state, delta) => {
    const material = materialRef.current
    if (!material) return
    const p = progress.current

    if (p < WARP_TRAVERSE_START || !state.camera.userData.hasTraversedCore) {
      linesRef.current.visible = false
      return
    }

    linesRef.current.visible = true
    const warpIntensity = THREE.MathUtils.smoothstep(p, WARP_TRAVERSE_START, WARP_TRAVERSE_END)
    material.uniforms.uTime.value += delta
    material.uniforms.uSpeed.value = THREE.MathUtils.lerp(0.8, 2.2, warpIntensity)
    material.uniforms.uStretch.value = THREE.MathUtils.lerp(1, 1.4, warpIntensity)
    material.uniforms.uOpacity.value = THREE.MathUtils.clamp(warpIntensity * 0.35, 0, 0.35)
  })

  return (
    <lineSegments ref={linesRef} geometry={geometry} visible={false}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          attribute float aHeadZ;
          attribute float aLength;
          attribute float aSpeed;
          attribute float aTail;
          varying vec3 vColor;
          uniform float uTime;
          uniform float uSpeed;
          uniform float uStretch;
          void main() {
            vColor = color;
            vec3 transformed = position;
            float head = mod(aHeadZ + 8.0 + uTime * aSpeed * uSpeed, 12.0) - 8.0;
            transformed.z = head - aTail * aLength * uStretch;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
          }
        `}
        fragmentShader={`
          varying vec3 vColor;
          uniform float uOpacity;
          void main() {
            gl_FragColor = vec4(vColor, uOpacity);
          }
        `}
        vertexColors
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </lineSegments>
  )
}
