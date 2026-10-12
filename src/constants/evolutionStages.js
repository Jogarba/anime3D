import * as THREE from 'three'

// Logo palette: Evolut blue and silver, with seamless circular wrapping.
export const EVOLUTION_STAGES = [
  {
    name: 'Evolut Blue',
    coreColor: new THREE.Color('#2878a8'),
    emissiveColor: new THREE.Color('#2878a8'),
    angle: 0.785, // 45° Top-Right to Bottom-Left
  },
  {
    name: 'Evolut Silver',
    coreColor: new THREE.Color('#e7e7e7'),
    emissiveColor: new THREE.Color('#e7e7e7'),
    angle: 2.356, // 135° Top-Left to Bottom-Right
  },
]
