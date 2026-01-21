import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    // Ensure only one React instance
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5176, // Change port to bypass cache
    strictPort: true,
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: http: https: http://localhost:* http://127.0.0.1:* http://localhost:5000 http://127.0.0.1:5000; font-src 'self' data: https:; connect-src 'self' https: ws: wss: http://localhost:* http://127.0.0.1:* http://localhost:5000 http://127.0.0.1:5000; frame-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self';",
      // Force no caching in development
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    }
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Keep React together - CRITICAL for avoiding duplication
          if (id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/scheduler')) {
            return 'react-vendor';
          }

          if (id.includes('node_modules/react-router-dom') ||
            id.includes('node_modules/@remix-run')) {
            return 'router';
          }

          // Icons and animations - bundled with vendor-libs to prevent initialization issues
          // if (id.includes('node_modules/react-icons')) {
          //   return 'icons';
          // }

          // if (id.includes('node_modules/framer-motion')) {
          //   return 'framer-motion';
          // }

          if (id.includes('node_modules/gsap')) {
            return 'gsap-lazy';
          }

          if (id.includes('node_modules/react-hot-toast')) {
            return 'toast';
          }

          if (id.includes('node_modules/socket.io-client') ||
            id.includes('node_modules/engine.io-client')) {
            return 'socket';
          }

          if (id.includes('node_modules/recharts') ||
            id.includes('node_modules/recharts-scale')) {
            return 'charts';
          }

          if (id.includes('node_modules/firebase') ||
            id.includes('node_modules/@firebase')) {
            return 'firebase';
          }

          if (id.includes('node_modules/leaflet') ||
            id.includes('node_modules/react-leaflet') ||
            id.includes('node_modules/@react-google-maps')) {
            return 'maps';
          }

          if (id.includes('node_modules')) {
            return 'vendor-libs';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 600,
    sourcemap: false,
    cssCodeSplit: true,
    target: 'es2020',
    assetsInlineLimit: 4096,
  },
  optimizeDeps: {
    include: [
      'react',
      'react/jsx-runtime',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
    ],
  },
})