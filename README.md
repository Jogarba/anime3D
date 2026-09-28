# Orbit — 3D Scroll Experience

React + Vite + React Three Fiber + Three.js + Anime.js.

## Run

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Your model

The supplied `.glb` is already included at:

`public/models/model.glb`

The model contains 2 meshes, 1 material and no embedded animation clips. The scroll animation is therefore driven by the Three.js transform (position, rotation and scale), not by a baked animation inside the GLB.

## Animation

Anime.js v4 drives the animation:

- `src/App.jsx` builds a `createTimeline()` for the blackout keyframes and `seek()`s it from the scroll position (throttled with `requestAnimationFrame`).
- `src/components/Scene.jsx` uses the Anime.js Three.js adapter (`animejs/adapters/three`) to tween the model's `rotateZ` on scroll and an idle `y` float loop.

## Main files

- `src/App.jsx` — scroll progress, blackout timeline and page shell.
- `src/sceneSequence.js` — scroll choreography constants (edit these to retime the piece).
- `src/components/Scene.jsx` — Three.js scene, camera and model animation.
- `src/components/Model.jsx` — GLB loader.
- `src/components/Loader.jsx` — loading / error overlay.
- `src/components/ErrorBoundary.jsx` — scene error fallback.
- `src/styles.css` — visual design.
- `public/models/model.glb` — your 3D model.

The environment lighting is generated locally with `Lightformer`s, so the scene does not depend on a remote HDRI CDN.

## Customize the model motion

Edit the durations in `src/sceneSequence.js` and the tweens inside `AnimatedModel` / the blackout timeline to change the choreography.
