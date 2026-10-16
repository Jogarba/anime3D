import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Avoid native realpath failures for projects stored in OneDrive on Windows.
    preserveSymlinks: true,
  },
  build: {
    // Vite checks uncompressed output; Three.js is ~180 KB over the wire (gzip).
    // Keep the warning useful for unexpectedly larger chunks without flagging this vendor bundle. jgjgjgjgjgjgjgjg
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/three/examples/')) return 'three-extras'
          if (id.includes('/node_modules/three/')) return 'three'
          if (id.includes('/node_modules/@react-three/drei/')) return 'drei'
          if (id.includes('/node_modules/@react-three/fiber/')) return 'react-three-fiber'
          if (id.includes('/node_modules/animejs/')) return 'animejs'
        },
      },
    },
  },
})
