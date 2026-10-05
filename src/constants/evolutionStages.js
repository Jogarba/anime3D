import * as THREE from 'three'

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
