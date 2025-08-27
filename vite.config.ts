import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,gif}'],
      },
      manifest: {
        name: 'PosB1 App',
        short_name: 'PosB1',
        description: 'Point of Sale Application',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png', // Placeholder icon
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png', // Placeholder icon
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      devOptions: {
        enabled: true // Enable PWA in development mode
      }
    })
  ],
  server: {
    host: true
  }
})
