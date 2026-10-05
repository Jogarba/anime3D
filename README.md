# Evolut — 3D Scroll Experience

An interactive product landing page built with React 19, Vite, React Three Fiber, Three.js, and Anime.js v4.

## Run locally

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. To create a production build, run `npm run build`; to preview it locally, run `npm run preview`.

## 3D model

The GLB asset is `public/models/logo_hexagonal_3d_rect.glb`. `ModelCore` loads it and applies a custom shader for the animated color sweep. A procedural hexagonal mesh is used if the GLB cannot be loaded.

## Source layout

```text
src/
├── App.jsx                     # Page composition and app-level navigation
├── landingContent.js           # Copy and data for the six portal sections
├── sceneSequence.js            # Scroll and camera choreography timings
├── styles.css                  # Global styles and responsive layouts
├── constants/                  # Navigation, breakpoints, colors, avatar moods
├── hooks/                      # Scroll choreography, viewport and transitions
├── utils/                      # Math and mobile scroll-region helpers
└── components/
    ├── canvas/                 # Three.js scene, camera, model and effects
    ├── common/                 # Typewriter text components
    ├── layout/                 # Hero, navigation and ambient background
    ├── portal/                 # Scroll sections, widgets and warp overlay
    ├── ErrorBoundary.jsx       # Scene error fallback
    ├── KineticGrid.jsx         # Canvas particle background
    ├── LiquidGlassOrb.jsx      # Interactive assistant avatar
    ├── Loader.jsx              # Initial loading screen
    ├── Model.jsx               # Compatibility export for ModelCore
    └── Scene.jsx               # Compatibility export for the canvas scene

public/
├── assets/                     # Logos and animated avatar SVGs
└── models/                     # GLB model
```

The old `Model.jsx` and `Scene.jsx` entry points remain as thin re-exports for compatibility; the active implementations live under `components/canvas/`.
