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
    tailwindcss()
  ],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Access-Control-Allow-Origin': '*'
    },
    middlewareMode: false,
    fs: {
      strict: false
    }
  },
  worker: {
    format: 'es',
    plugins: () => [wasm()],
    rollupOptions: {
      output: {
        format: 'es',
        inlineDynamicImports: true,
        chunkFileNames: 'assets/worker-[hash].js'
      }
    }
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
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
});