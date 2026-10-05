import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import ResponsiveCamera from './ResponsiveCamera'
import AnimatedModel from './AnimatedModel'
import DimensionalWormhole from './DimensionalWormhole'
import CameraIrisShutter from './CameraIrisShutter'
import WaterParticleRipples from './WaterParticleRipples'
import HyperspaceSpeedlines from './HyperspaceSpeedlines'
import AmbientParticles from './AmbientParticles'
import OfflineEnvironment from './OfflineEnvironment'

export default function Scene({
  progress,
  isMobile = false,
  isWarpingViaButton = false,
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
        <ResponsiveCamera progress={progress} />
        <ambientLight intensity={0.95} />
        <directionalLight position={[4, 6, 6]} intensity={3.4} color="#ffffff" />
        <directionalLight position={[-4, -3, 4]} intensity={1.6} color="#bae6fd" />
        <pointLight position={[0, 1, 4.5]} intensity={2.6} color="#ffffff" />
        <pointLight position={[-4, 2, 4]} intensity={2.2} color="#38bdf8" />
        <pointLight position={[4, -2, 3]} intensity={1.8} color="#818cf8" />
        <Suspense fallback={null}>
          <AnimatedModel progress={progress} isWarpingViaButton={isWarpingViaButton} />
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
