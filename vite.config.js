import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Avoid native realpath failures for projects stored in OneDrive on Windows.
    preserveSymlinks: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/three/')) return 'three'
          if (id.includes('/node_modules/@react-three/')) return 'react-three'
          if (id.includes('/node_modules/animejs/')) return 'animejs'
        },
      },
    },
  },
})
