import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.svg', 'icons/icon-512.svg'],
      manifest: {
        name: 'Stage Reader', short_name: 'Stage Reader',
        description: 'Lokaler Offline-Reader für Noten, Tabs und Setlisten.',
        start_url: './', scope: './', display: 'standalone',
        theme_color: '#f7f7f2', background_color: '#f7f7f2',
        icons: [
          { src: 'icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
        ]
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,woff,woff2,eot,otf,mjs}'], maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, skipWaiting: true, clientsClaim: true, cleanupOutdatedCaches: true }
    })
  ]
});
