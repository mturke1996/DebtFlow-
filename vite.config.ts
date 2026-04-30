import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['logo.png'],
      manifest: {
        name: 'DebtFlow Pro - نظام إدارة الديون والفواتير',
        short_name: 'DebtFlow',
        description: 'نظام احترافي لإدارة الديون والفواتير والعملاء والمصروفات',
        theme_color: '#0f766e',
        background_color: '#0c0f0f',
        display: 'standalone',
        orientation: 'portrait-primary',
        lang: 'ar',
        dir: 'rtl',
        start_url: '/',
        scope: '/',
        categories: ['business', 'finance'],
        icons: [
          { src: '/logo.png', sizes: '192x192', type: 'image/png' },
          { src: '/logo.png', sizes: '512x512', type: 'image/png' },
          { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        shortcuts: [
          { name: 'العملاء', url: '/clients', icons: [{ src: '/logo.png', sizes: '96x96' }] },
          { name: 'الفواتير', url: '/invoices', icons: [{ src: '/logo.png', sizes: '96x96' }] },
        ],
      },
      /** في التطوير: تعطيل SW يمنع ضجيج Workbox في الـ console. للاختبار مع PWA فعّل enabled: true */
      devOptions: {
        enabled: false,
        type: 'module',
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-css', expiration: { maxEntries: 10, maxAgeSeconds: 31536000 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-woff', expiration: { maxEntries: 30, maxAgeSeconds: 31536000 }, cacheableResponse: { statuses: [0, 200] } },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'CacheFirst',
            options: { cacheName: 'images', expiration: { maxEntries: 60, maxAgeSeconds: 2592000 } },
          },
        ],
      },
    }),
  ],
  resolve: { alias: { '@': path.resolve(__dirname, './src'), buffer: 'buffer' } },
  define: { 'process.env': {} },
  optimizeDeps: { include: ['buffer'] },
  server: { port: 3000 },
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material'],
          'vendor-motion': ['framer-motion'],
        },
      },
    },
  },
});
