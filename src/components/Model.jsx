import { useEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { TOTAL_SCROLL_PROGRESS } from '../sceneSequence'

// Evolutionary chromatic palettes that smoothly morph the 3D model as you scroll
export const EVOLUTION_STAGES = [
  {
    name: 'Cyber Sapphire',
    pos: 0.0,
    coreColor: new THREE.Color('#e8ecf8'),
    circuitColor: new THREE.Color('#2563eb'),
    emissiveColor: new THREE.Color('#1d4ed8'),
    emissiveIntensity: 0.55,
    metalness: 0.86,
    roughness: 0.16,
    clearcoatRoughness: 0.06,
  },
  {
    name: 'Quantum Cyan',
    pos: 0.16,
    coreColor: new THREE.Color('#0369a1'),
    circuitColor: new THREE.Color('#38bdf8'),
    emissiveColor: new THREE.Color('#0284c7'),
    emissiveIntensity: 1.05,
    metalness: 0.92,
    roughness: 0.11,
    clearcoatRoughness: 0.04,
  },
  {
    name: 'Matrix Emerald',
    pos: 0.33,
    coreColor: new THREE.Color('#064e3b'),
    circuitColor: new THREE.Color('#34d399'),
    emissiveColor: new THREE.Color('#10b981'),
    emissiveIntensity: 1.15,
    metalness: 0.90,
    roughness: 0.12,
    clearcoatRoughness: 0.04,
  },
  {
    name: 'Solar Gold',
    pos: 0.50,
    coreColor: new THREE.Color('#78350f'),
    circuitColor: new THREE.Color('#fbbf24'),
    emissiveColor: new THREE.Color('#f59e0b'),
    emissiveIntensity: 1.25,
    metalness: 0.94,
    roughness: 0.09,
    clearcoatRoughness: 0.03,
  },
  {
    name: 'Laser Crimson',
    pos: 0.66,
    coreColor: new THREE.Color('#831843'),
    circuitColor: new THREE.Color('#f43f5e'),
    emissiveColor: new THREE.Color('#e11d48'),
    emissiveIntensity: 1.35,
    metalness: 0.93,
    roughness: 0.10,
    clearcoatRoughness: 0.03,
  },
  {
    name: 'Cosmic Violet',
    pos: 0.83,
    coreColor: new THREE.Color('#3b0764'),
    circuitColor: new THREE.Color('#c084fc'),
    emissiveColor: new THREE.Color('#9333ea'),
    emissiveIntensity: 1.28,
    metalness: 0.91,
    roughness: 0.11,
    clearcoatRoughness: 0.04,
  },
  {
    name: 'Prismatic Diamond',
    pos: 1.0,
    coreColor: new THREE.Color('#f8fafc'),
    circuitColor: new THREE.Color('#60a5fa'),
    emissiveColor: new THREE.Color('#38bdf8'),
    emissiveIntensity: 1.05,
    metalness: 0.96,
    roughness: 0.07,
    clearcoatRoughness: 0.02,
  },
]

export default function Model({ groupRef, progress }) {
  const { scene } = useGLTF('/models/model.glb')

  const { coreMat, circuitMat } = useMemo(() => {
    const cMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#e8ecf8'),
      emissive: new THREE.Color('#1d4ed8'),
      emissiveIntensity: 0.45,
      metalness: 0.86,
      roughness: 0.16,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      reflectivity: 0.95,
      envMapIntensity: 1.8,
    })

    const circMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#2563eb'),
      emissive: new THREE.Color('#1d4ed8'),
      emissiveIntensity: 0.75,
      metalness: 0.90,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 1.0,
      envMapIntensity: 2.2,
    })

    return { coreMat: cMat, circuitMat: circMat }
  }, [])

  useEffect(() => {
    if (!scene) return
    let meshIndex = 0
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = meshIndex === 0 ? coreMat : circuitMat
        child.castShadow = true
        child.receiveShadow = true
        meshIndex++
      }
    })
  }, [scene, coreMat, circuitMat])

  // Working color caches
  const currentCoreColor = useRef(new THREE.Color('#e8ecf8'))
  const currentCircuitColor = useRef(new THREE.Color('#2563eb'))
  const currentEmissiveColor = useRef(new THREE.Color('#1d4ed8'))
  const targetCoreColor = useMemo(() => new THREE.Color(), [])
  const targetCircuitColor = useMemo(() => new THREE.Color(), [])
  const targetEmissiveColor = useMemo(() => new THREE.Color(), [])

  useFrame((state, delta) => {
    if (!coreMat || !circuitMat) return

    const currentP = progress?.current || 0
    const norm = THREE.MathUtils.clamp(currentP / TOTAL_SCROLL_PROGRESS, 0, 1)

    // Find enclosing evolution stages
    let stageA = EVOLUTION_STAGES[0]
    let stageB = EVOLUTION_STAGES[EVOLUTION_STAGES.length - 1]

    for (let i = 0; i < EVOLUTION_STAGES.length - 1; i++) {
      if (norm >= EVOLUTION_STAGES[i].pos && norm <= EVOLUTION_STAGES[i + 1].pos) {
        stageA = EVOLUTION_STAGES[i]
        stageB = EVOLUTION_STAGES[i + 1]
        break
      }
    }

    const range = Math.max(0.0001, stageB.pos - stageA.pos)
    const rawFactor = (norm - stageA.pos) / range
    const factor = THREE.MathUtils.smoothstep(rawFactor, 0, 1)

    targetCoreColor.lerpColors(stageA.coreColor, stageB.coreColor, factor)
    targetCircuitColor.lerpColors(stageA.circuitColor, stageB.circuitColor, factor)
    targetEmissiveColor.lerpColors(stageA.emissiveColor, stageB.emissiveColor, factor)

    const targetEmissiveIntensity = THREE.MathUtils.lerp(stageA.emissiveIntensity, stageB.emissiveIntensity, factor)
    const targetMetalness = THREE.MathUtils.lerp(stageA.metalness, stageB.metalness, factor)
    const targetRoughness = THREE.MathUtils.lerp(stageA.roughness, stageB.roughness, factor)
    const targetClearcoatRoughness = THREE.MathUtils.lerp(stageA.clearcoatRoughness, stageB.clearcoatRoughness, factor)

    const time = state.clock.getElapsedTime()
    const pulse = Math.sin(time * 2.2) * 0.12 + 1.0

    const lerpSpeed = Math.min(1, delta * 6.5)
    currentCoreColor.current.lerp(targetCoreColor, lerpSpeed)
    currentCircuitColor.current.lerp(targetCircuitColor, lerpSpeed)
    currentEmissiveColor.current.lerp(targetEmissiveColor, lerpSpeed)

    coreMat.color.copy(currentCoreColor.current)
    coreMat.emissive.copy(currentEmissiveColor.current)
    coreMat.emissiveIntensity = THREE.MathUtils.lerp(coreMat.emissiveIntensity, targetEmissiveIntensity * 0.45 * pulse, lerpSpeed)
    coreMat.metalness = THREE.MathUtils.lerp(coreMat.metalness, targetMetalness, lerpSpeed)
    coreMat.roughness = THREE.MathUtils.lerp(coreMat.roughness, targetRoughness, lerpSpeed)
    coreMat.clearcoatRoughness = THREE.MathUtils.lerp(coreMat.clearcoatRoughness, targetClearcoatRoughness, lerpSpeed)

    circuitMat.color.copy(currentCircuitColor.current)
    circuitMat.emissive.copy(currentEmissiveColor.current)
    circuitMat.emissiveIntensity = THREE.MathUtils.lerp(circuitMat.emissiveIntensity, targetEmissiveIntensity * pulse, lerpSpeed)
    circuitMat.metalness = THREE.MathUtils.lerp(circuitMat.metalness, targetMetalness, lerpSpeed)
    circuitMat.roughness = THREE.MathUtils.lerp(circuitMat.roughness, targetRoughness, lerpSpeed)
    circuitMat.clearcoatRoughness = THREE.MathUtils.lerp(circuitMat.clearcoatRoughness, targetClearcoatRoughness, lerpSpeed)
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={0.05} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  )
}

useGLTF.preload('/models/model.glb')
