import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Une seule copie de React, même si npm en installe deux dans le monorepo (voir 125a53a).
  resolve: { dedupe: ['react', 'react-dom'] },
})
