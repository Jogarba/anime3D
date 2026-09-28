import { useGLTF } from '@react-three/drei'

export default function Model({ groupRef }) {
  const { scene } = useGLTF('/models/model.glb')

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={0.05} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  )
}

useGLTF.preload('/models/model.glb')
