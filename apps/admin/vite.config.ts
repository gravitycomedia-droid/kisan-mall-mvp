import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3001,
  },
  // Load .env from the monorepo root (two levels up from apps/admin)
  envDir: resolve(__dirname, '../../'),
  resolve: {
    dedupe: ['firebase', '@firebase/app', '@firebase/firestore', '@firebase/auth', '@firebase/storage'],
    alias: {
      '@shared': resolve(__dirname, '../../shared'),
      '@': resolve(__dirname, './src'),
    },
  },
})
