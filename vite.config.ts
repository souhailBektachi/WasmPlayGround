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
        entryFileNames: 'assets/[name].mjs'
      }
    }
  },
  build: {
    target: 'esnext',
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: {
          wasmer: ['@wasmer/sdk']
        },
        format: 'es',
        assetFileNames: 'assets/[name].[ext]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name].js',
      }
    },
    sourcemap: true
  },
  optimizeDeps: {
    exclude: ['@wasmer/sdk'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      plugins: [
        {
          name: 'wasm-loader',
          setup(build) {
            build.onResolve({ filter: /\.wasm$/ }, args => {
              return { path: args.path, namespace: 'wasm-binary' }
            })
          }
        }
      ]
    }
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
