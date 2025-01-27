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
  optimizeDeps: {
    exclude: ['@wasmer/sdk'],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  worker: {
    format: 'es',
    plugins: () => [wasm()],
    rollupOptions: {
      output: {
        format: 'es',
        inlineDynamicImports: true
      }
    }
  },
  build: {
    modulePreload: {
      polyfill: false,
    },
    target: 'esnext',
    assetsInlineLimit: 0,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@wasmer/sdk')) {
            return 'wasmer';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  }
});