import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from "vite-plugin-wasm"
import topLevelAwait from "vite-plugin-top-level-await"
import tailwindcss from '@tailwindcss/vite'

const headers = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Resource-Policy': 'cross-origin',
  'Cross-Origin-Isolation': 'enable-cross-origin-isolation',
  'Cache-Control': 'public, max-age=31536000, immutable'
};

export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),
    tailwindcss(),
    {
      name: 'configure-response-headers',
      configureServer(server) {
        server.middlewares.use((_req, res, next) => {
          Object.entries(headers).forEach(([key, value]) => {
            res.setHeader(key, value);
          });
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((_req, res, next) => {
          Object.entries(headers).forEach(([key, value]) => {
            res.setHeader(key, value);
          });
          next();
        });
      }
    }
  ],
  server: {
    headers
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
    target: 'esnext',
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('@wasmer/sdk')) {
            return 'wasmer-sdk';
          }
          if (id.includes('wasmer_js')) {
            return 'wasmer-wasm';
          }
          if (id.includes('clang.worker')) {
            return 'worker';
          }
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.wasm')) {
            return 'assets/wasm/[name].[hash][extname]';
          }
          return 'assets/[name].[hash][extname]';
        },
        chunkFileNames: 'assets/js/[name].[hash].js',
        entryFileNames: 'assets/js/[name].[hash].js',
      }
    },
    sourcemap: true
  },
  optimizeDeps: {
    exclude: ['@wasmer/sdk']
  },
  resolve: {
    alias: {
      path: 'path-browserify',
      fs: 'memfs'
    }
  },
  preview: {
    headers
  }
})
