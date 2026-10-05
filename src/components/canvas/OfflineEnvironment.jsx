import { Environment, Lightformer } from '@react-three/drei'

export default function OfflineEnvironment({ isMobile }) {
  return (
    <Environment resolution={isMobile ? 32 : 64} frames={1} environmentIntensity={1.35}>
      <Lightformer intensity={4.5} position={[0, 6, -6]} scale={[14, 14, 1]} color="#ffffff" />
      <Lightformer intensity={3.0} position={[-6, 3, 4]} scale={[10, 10, 1]} color="#7dd3fc" />
      <Lightformer intensity={3.0} position={[6, 3, 4]} scale={[10, 10, 1]} color="#a78bfa" />
      <Lightformer
        intensity={2.2}
        position={[0, -4, 4]}
        scale={[14, 4, 1]}
        rotation-x={Math.PI / 2}
        color="#e0f2fe"
      />
    </Environment>
  )
}
