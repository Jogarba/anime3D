import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import ResponsiveCamera from './ResponsiveCamera'
import AnimatedModel from './AnimatedModel'
import DimensionalWormhole from './DimensionalWormhole'
import CameraIrisShutter from './CameraIrisShutter'
import WaterParticleRipples from './WaterParticleRipples'
import HyperspaceSpeedlines from './HyperspaceSpeedlines'
import AmbientParticles from './AmbientParticles'
import OfflineEnvironment from './OfflineEnvironment'

function RevealLighting({ revealProgress }) {
  const lights = useRef([])
  const targetIntensities = [0.95, 3.4, 1.6, 2.6, 2.2, 1.8]
  const startingIntensities = [0.12, 0.24, 0.1, 0.16, 0.14, 0.12]

  useFrame(() => {
    const progress = THREE.MathUtils.clamp(revealProgress?.current ?? 1, 0, 1)
    const eased = THREE.MathUtils.smoothstep(progress, 0, 1)
    lights.current.forEach((light, index) => {
      if (light) light.intensity = THREE.MathUtils.lerp(startingIntensities[index], targetIntensities[index], eased)
    })
  })

  return (
    <>
      <ambientLight ref={(light) => { lights.current[0] = light }} intensity={startingIntensities[0]} />
      <directionalLight ref={(light) => { lights.current[1] = light }} position={[4, 6, 6]} intensity={startingIntensities[1]} color="#ffffff" />
      <directionalLight ref={(light) => { lights.current[2] = light }} position={[-4, -3, 4]} intensity={startingIntensities[2]} color="#bae6fd" />
      <pointLight ref={(light) => { lights.current[3] = light }} position={[0, 1, 4.5]} intensity={startingIntensities[3]} color="#ffffff" />
      <pointLight ref={(light) => { lights.current[4] = light }} position={[-4, 2, 4]} intensity={startingIntensities[4]} color="#38bdf8" />
      <pointLight ref={(light) => { lights.current[5] = light }} position={[4, -2, 3]} intensity={startingIntensities[5]} color="#818cf8" />
    </>
  )
}

export default function Scene({
  progress,
  isMobile = false,
  isWarpingViaButton = false,
  isInitialLoading = false,
  initialRevealProgress,
  onModelReady,
}) {
  return (
    <div className="canvas-wrap" aria-hidden="true">
      <Canvas
        dpr={isMobile ? 1 : [1, 1.75]}
        camera={{ position: [0, 0, 7], fov: 35 }}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
      >
        <ResponsiveCamera progress={progress} initialRevealProgress={initialRevealProgress} />
        <RevealLighting revealProgress={initialRevealProgress} />
        <Suspense fallback={null}>
          <AnimatedModel
            progress={progress}
            isWarpingViaButton={isWarpingViaButton}
            isInitialLoading={isInitialLoading}
            onModelReady={onModelReady}
          />
          <DimensionalWormhole progress={progress} />
          <CameraIrisShutter progress={progress} />
          <WaterParticleRipples />
          <HyperspaceSpeedlines progress={progress} />
          <AmbientParticles count={isMobile ? 35 : 130} />
          <OfflineEnvironment isMobile={isMobile} />
          <ContactShadows
            position={[0, -2.2, 0]}
            opacity={0.24}
            scale={8}
            blur={2.5}
            far={5}
            frames={1}
            resolution={isMobile ? 128 : 256}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}