import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from "vite-plugin-wasm"
import topLevelAwait from "vite-plugin-top-level-await"
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),tailwindcss()
  ],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cache-Control': 'max-age=31536000, immutable'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
        assetFileNames: 'assets/[name].[hash].[ext]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
      }
    },
    assetsInlineLimit: 0, 
    target: 'esnext',
  },
  optimizeDeps: {
    exclude: ['@wasmer/sdk']
  }
})
