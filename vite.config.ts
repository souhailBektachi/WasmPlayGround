import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),
    tailwindcss(),
  ],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  optimizeDeps: {
    exclude: ['@wasmer/sdk'], 
  },
  build: {
    modulePreload: {
      polyfill: false,
    },
    target: 'esnext',
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: 'assets/[name].mjs',
        chunkFileNames: 'assets/[name]-[hash].mjs',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
});
