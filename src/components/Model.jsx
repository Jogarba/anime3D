import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { TOTAL_SCROLL_PROGRESS } from '../sceneSequence'

// High-gloss mirror metal chromatic palettes with seamless circular wrapping
export const EVOLUTION_STAGES = [
  {
    name: 'Electric Aurora Titanium',
    coreColor: new THREE.Color('#00e5ff'),
    emissiveColor: new THREE.Color('#6366f1'),
    angle: 0.785, // 45° Top-Right to Bottom-Left
  },
  {
    name: 'Hyper-Neon Cyber Magenta',
    coreColor: new THREE.Color('#ff007f'),
    emissiveColor: new THREE.Color('#f43f5e'),
    angle: 2.356, // 135° Top-Left to Bottom-Right
  },
  {
    name: 'Toxic Venom Emerald Chrome',
    coreColor: new THREE.Color('#00ff88'),
    emissiveColor: new THREE.Color('#10b981'),
    angle: -0.85, // Diagonal Bottom-Left
  },
  {
    name: 'Imperial Molten 24K Gold',
    coreColor: new THREE.Color('#ffb703'),
    emissiveColor: new THREE.Color('#fb5607'),
    angle: 1.57, // 90° Top to Bottom
  },
  {
    name: 'Ultra-Violet Cosmic Nebula',
    coreColor: new THREE.Color('#9d4edd'),
    emissiveColor: new THREE.Color('#c77dff'),
    angle: -2.356, // Opposite Diagonal
  },
  {
    name: 'Chameleon Prismatic Shock',
    coreColor: new THREE.Color('#06d6a0'),
    emissiveColor: new THREE.Color('#ff006e'),
    angle: 0.0, // Horizontal Left to Right
  },
]

export default function Model({ groupRef, progress }) {
  const { scene } = useGLTF('/models/logo_hexagonal_3d_rect.glb')

  const waveUniforms = useMemo(
    () => ({
      u_waveProgress: { value: 0.0 },
      u_waveAngle: { value: 0.785 },
      u_colorA: { value: new THREE.Color('#00e5ff') },
      u_colorB: { value: new THREE.Color('#ff007f') },
      u_emissiveA: { value: new THREE.Color('#6366f1') },
      u_emissiveB: { value: new THREE.Color('#f43f5e') },
      u_waveWidth: { value: 0.32 },
      u_emissiveIntensity: { value: 0.85 },
    }),
    []
  )

  const { coreMat } = useMemo(() => {
    const cMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#00e5ff'),
      emissive: new THREE.Color('#6366f1'),
      emissiveIntensity: 0.85,
      metalness: 1.0,
      roughness: 0.015,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      reflectivity: 1.0,
      envMapIntensity: 4.8,
      ior: 2.4,
    })

    cMat.onBeforeCompile = (shader) => {
      shader.uniforms.u_waveProgress = waveUniforms.u_waveProgress
      shader.uniforms.u_waveAngle = waveUniforms.u_waveAngle
      shader.uniforms.u_colorA = waveUniforms.u_colorA
      shader.uniforms.u_colorB = waveUniforms.u_colorB
      shader.uniforms.u_emissiveA = waveUniforms.u_emissiveA
      shader.uniforms.u_emissiveB = waveUniforms.u_emissiveB
      shader.uniforms.u_waveWidth = waveUniforms.u_waveWidth
      shader.uniforms.u_emissiveIntensity = waveUniforms.u_emissiveIntensity

      shader.vertexShader = `
        varying vec3 vModelPos;
        ${shader.vertexShader}
      `.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        vModelPos = position;
        `
      )

      shader.fragmentShader = `
        varying vec3 vModelPos;
        uniform float u_waveProgress;
        uniform float u_waveAngle;
        uniform vec3 u_colorA;
        uniform vec3 u_colorB;
        uniform vec3 u_emissiveA;
        uniform vec3 u_emissiveB;
        uniform float u_waveWidth;
        uniform float u_emissiveIntensity;
        ${shader.fragmentShader}
      `.replace(
        '#include <color_fragment>',
        `
        #include <color_fragment>
        float waveCoord = vModelPos.x * cos(u_waveAngle) + vModelPos.y * sin(u_waveAngle);
        float normCoord = clamp((waveCoord + 35.0) / 70.0, 0.0, 1.0);
        float waveDist = normCoord - u_waveProgress;
        float waveT = smoothstep(-u_waveWidth, u_waveWidth, -waveDist);
        diffuseColor.rgb = mix(u_colorA, u_colorB, waveT);
        `
      ).replace(
        '#include <emissivemap_fragment>',
        `
        #include <emissivemap_fragment>
        float waveCoordE = vModelPos.x * cos(u_waveAngle) + vModelPos.y * sin(u_waveAngle);
        float normCoordE = clamp((waveCoordE + 35.0) / 70.0, 0.0, 1.0);
        float waveDistE = normCoordE - u_waveProgress;
        float waveTE = smoothstep(-u_waveWidth, u_waveWidth, -waveDistE);
        
        vec3 currentEmissive = mix(u_emissiveA, u_emissiveB, waveTE);
        
        // Radiant energetic wave front crest beam
        float crest = exp(-pow(waveDistE / (u_waveWidth * 0.35), 2.0));
        vec3 crestGlow = mix(vec3(1.0, 1.0, 1.0), currentEmissive, 0.35);
        
        totalEmissiveRadiance = currentEmissive * u_emissiveIntensity + crestGlow * (crest * 2.4);
        `
      )
    }

    return { coreMat: cMat }
  }, [waveUniforms])

  useEffect(() => {
    if (!scene) return
    scene.traverse((child) => {
      if (child.isMesh) {
        if (child.geometry) {
          if (child.geometry.index) {
            child.geometry = child.geometry.toNonIndexed()
          }
          child.geometry.deleteAttribute('color')
          child.geometry.center()
          child.geometry.computeVertexNormals()
        }
        child.material = coreMat
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [scene, coreMat])

  useFrame((state) => {
    if (!coreMat) return

    const currentP = progress?.current || 0
    const scrollFactor = currentP / TOTAL_SCROLL_PROGRESS
    const time = state.clock.getElapsedTime()

    // Continuous wave progression (one sweeping wave every 3.8s)
    const waveSpeed = 0.26
    const globalProgress = (time * waveSpeed + scrollFactor * 3.0) % EVOLUTION_STAGES.length
    
    const stageIndex = Math.floor(globalProgress)
    const nextIndex = (stageIndex + 1) % EVOLUTION_STAGES.length
    const localT = globalProgress - stageIndex

    // Map local 0..1 to sweeping range -0.25 to 1.25 so the wave completely starts outside and exits the model
    const sweepProgress = -0.25 + localT * 1.5

    const stageA = EVOLUTION_STAGES[stageIndex]
    const stageB = EVOLUTION_STAGES[nextIndex]

    // Update wave shader uniforms
    waveUniforms.u_waveProgress.value = sweepProgress
    waveUniforms.u_waveAngle.value = stageB.angle
    waveUniforms.u_colorA.value.copy(stageA.coreColor)
    waveUniforms.u_colorB.value.copy(stageB.coreColor)
    waveUniforms.u_emissiveA.value.copy(stageA.emissiveColor)
    waveUniforms.u_emissiveB.value.copy(stageB.emissiveColor)

    // Living breathing light pulse
    const pulse = Math.sin(time * 2.2) * 0.15 + 0.85
    waveUniforms.u_emissiveIntensity.value = pulse
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={0.065} rotation={[0, 0, 0]} />
    </group>
  )
}

useGLTF.preload('/models/logo_hexagonal_3d_rect.glb')
