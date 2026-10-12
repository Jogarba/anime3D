import { useEffect, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'
import { EVOLUTION_STAGES } from '../../constants/evolutionStages'
import { TOTAL_SCROLL_PROGRESS } from '../../sceneSequence'

const MODEL_URL = '/models/logo_hexagonal_3d_rect.glb'

function createHexLogoGeometry() {
  const geometry = new THREE.CylinderGeometry(1.08, 1.08, 2.75, 6, 1, false)
  geometry.computeVertexNormals()
  return geometry
}

export default function ModelCore({ groupRef, progress, isInitialLoading = false, isWarpingViaButton = false, dragRotation, onModelReady }) {
  const [gltfScene, setGltfScene] = useState(null)
  const [useFallback, setUseFallback] = useState(false)

  const handlePointerDown = (event) => {
    if (isInitialLoading || isWarpingViaButton || !dragRotation?.current) return
    event.stopPropagation()
    dragRotation.current.active = true
    dragRotation.current.lastX = event.nativeEvent.clientX
    dragRotation.current.lastY = event.nativeEvent.clientY
    event.nativeEvent.target.style.cursor = 'grabbing'
    event.target.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event) => {
    if (!dragRotation?.current?.active) return
    event.stopPropagation()
    const drag = dragRotation.current
    const deltaX = event.nativeEvent.clientX - drag.lastX
    const deltaY = event.nativeEvent.clientY - drag.lastY
    drag.lastX = event.nativeEvent.clientX
    drag.lastY = event.nativeEvent.clientY
    drag.y = THREE.MathUtils.clamp(drag.y + deltaX * 0.008, -Math.PI * 2, Math.PI * 2)
    drag.x = THREE.MathUtils.clamp(drag.x + deltaY * 0.008, -Math.PI / 2, Math.PI / 2)
  }

  const finishPointerDrag = (event) => {
    if (!dragRotation?.current?.active) return
    event.stopPropagation()
    dragRotation.current.active = false
    event.nativeEvent.target.style.cursor = 'grab'
    event.target.releasePointerCapture?.(event.pointerId)
  }

  const handlePointerOver = (event) => {
    if (!isInitialLoading && !isWarpingViaButton) event.nativeEvent.target.style.cursor = 'grab'
  }

  const handlePointerOut = (event) => {
    if (!dragRotation?.current?.active) event.nativeEvent.target.style.cursor = ''
  }

  const waveUniforms = useMemo(
    () => ({
      u_waveProgress: { value: 0.0 },
      u_waveAngle: { value: 0.785 },
      u_colorA: { value: new THREE.Color('#00e5ff') },
      u_colorB: { value: new THREE.Color('#ff007f') },
      u_emissiveA: { value: new THREE.Color('#6366f1') },
      u_emissiveB: { value: new THREE.Color('#f43f5e') },
      u_waveWidth: { value: 0.42 },
      u_emissiveIntensity: { value: 0.78 },
    }),
    []
  )

  const fallbackGeometry = useMemo(() => createHexLogoGeometry(), [])

  const { coreMat } = useMemo(() => {
    const cMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#00e5ff'),
      emissive: new THREE.Color('#6366f1'),
      emissiveIntensity: 0.78,
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
        float crest = exp(-pow(waveDistE / (u_waveWidth * 0.42), 2.0));
        vec3 crestGlow = mix(currentEmissive, vec3(1.0, 1.0, 1.0), 0.15);
        totalEmissiveRadiance = currentEmissive * u_emissiveIntensity + crestGlow * (crest * 0.55);
        `
      )
    }

    return { coreMat: cMat }
  }, [waveUniforms])

  useEffect(() => {
    let cancelled = false
    const loader = new GLTFLoader()

    loader.load(
      MODEL_URL,
      (gltf) => {
        if (cancelled) return
        setGltfScene(gltf.scene)
        setUseFallback(false)
      },
      undefined,
      () => {
        if (cancelled) return
        setGltfScene(null)
        setUseFallback(true)
      }
    )

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!gltfScene) return
    gltfScene.traverse((child) => {
      if (!child.isMesh) return
      if (child.geometry) {
        if (child.geometry.index) child.geometry = child.geometry.toNonIndexed()
        child.geometry.deleteAttribute('color')
        child.geometry.center()
        child.geometry.computeVertexNormals()
      }
      child.material = coreMat
      child.castShadow = true
      child.receiveShadow = true
    })
    onModelReady?.()
  }, [gltfScene, coreMat, onModelReady])

  useEffect(() => {
    if (useFallback) onModelReady?.()
  }, [useFallback, onModelReady])

  useEffect(() => () => {
    coreMat.dispose()
    fallbackGeometry.dispose()
  }, [coreMat, fallbackGeometry])

  useFrame((state) => {
    const currentP = progress?.current || 0
    const scrollFactor = currentP / TOTAL_SCROLL_PROGRESS
    const time = state.clock.getElapsedTime()
    const globalProgress = (time * 0.26 + scrollFactor * 3.0) % EVOLUTION_STAGES.length
    const stageIndex = Math.floor(globalProgress)
    const nextIndex = (stageIndex + 1) % EVOLUTION_STAGES.length
    const localT = globalProgress - stageIndex
    const sweepProgress = -0.25 + localT * 1.5
    const stageA = EVOLUTION_STAGES[stageIndex]
    const stageB = EVOLUTION_STAGES[nextIndex]

    waveUniforms.u_waveProgress.value = sweepProgress
    waveUniforms.u_waveAngle.value = stageB.angle
    waveUniforms.u_colorA.value.copy(stageA.coreColor)
    waveUniforms.u_colorB.value.copy(stageB.coreColor)
    waveUniforms.u_emissiveA.value.copy(stageA.emissiveColor)
    waveUniforms.u_emissiveB.value.copy(stageB.emissiveColor)
    waveUniforms.u_emissiveIntensity.value = Math.sin(time * 2.2) * 0.15 + 0.85
  })

  return (
    <group
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointerDrag}
      onPointerCancel={finishPointerDrag}
      onLostPointerCapture={finishPointerDrag}
    >
      {gltfScene ? (
        <primitive object={gltfScene} scale={0.065} rotation={[0, 0, 0]} />
      ) : useFallback ? (
        <mesh geometry={fallbackGeometry} material={coreMat} castShadow receiveShadow />
      ) : null}
    </group>
  )
}
