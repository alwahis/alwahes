import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Base URL for production
  base: '/',
  
  // Define global constants
  define: {
    'process.env': process.env,
    'process.env.NODE_ENV': JSON.stringify(mode)
  },
  plugins: [
    react({
      // Add React Refresh
      fastRefresh: true,
      // Use the new JSX runtime
      jsxRuntime: 'automatic',
      // Add Babel plugins for better browser compatibility
      babel: {
        plugins: [
          ['@babel/plugin-transform-runtime', {
            regenerator: true,
          }],
        ],
      },
    }),
    VitePWA({
      // Enable in development for testing
      registerType: 'autoUpdate',
      // Enable in development for testing
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      },
      // Basic PWA configuration
      registerType: 'prompt',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.svg', 'icons/*.png'],
      manifest: {
        name: 'عالواهس - منصة مشاركة الرحلات',
        short_name: 'عالواهس',
        description: 'منصة عراقية لمشاركة الرحلات بين المدن',
        theme_color: '#ff9800',
        background_color: '#ffffff',
        display: 'standalone',
        lang: 'ar',
        dir: 'rtl',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      // Workbox configuration
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}'],
        runtimeCaching: [
          // Cache API calls to Airtable
          {
            urlPattern: /^https?:\/\/api\.airtable\.com\/v0\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Cache static assets
          {
            urlPattern: /^https?:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp|woff2?|ttf|eot)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Cache API responses
          {
            urlPattern: /^https?:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-responses',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      // Development options
      devOptions: {
        enabled: mode === 'development',
        type: 'module',
        navigateFallback: 'index.html'
      },
      // Self-destroying service worker for development
      selfDestroying: mode === 'development',
      // Enable in all environments
      disable: false,
      // Don't register the service worker automatically - we'll do it manually
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}']
      },
      // Disable workbox logging in production
      mode: mode === 'production' ? 'production' : 'development'
    })
  ],
  envPrefix: 'VITE_',
  // Base URL for production
  base: mode === 'production' ? '/' : '/',
  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    // Minification and compatibility settings
    target: 'es2015',
    cssCodeSplit: true,
    minify: mode === 'production' ? 'terser' : false,
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          vendor: ['date-fns', 'jotai', 'react-hot-toast']
        }
      }
    },
    // Add a threshold for chunk size warnings
    chunkSizeWarningLimit: 1000
  },
  // Server configuration
  server: {
    port: 3000,
    open: mode === 'development',
    cors: true,
    host: true,
    // Enable HMR
    hmr: {
      overlay: true,
    },
    // Handle SPA fallback
    historyApiFallback: true,
  },
  // Preview server configuration
  preview: {
    port: 4173,
    open: true
  }
}));
