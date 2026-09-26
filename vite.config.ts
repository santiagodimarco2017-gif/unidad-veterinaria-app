import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Acento de marca: ver assets/logo-uv-original.png (verde Unidad Veterinaria).
const THEME_COLOR = '#068136'
const BACKGROUND_COLOR = '#068136'

// https://vite.dev/config/
export default defineConfig({
  // Necesario para que los assets se resuelvan con rutas relativas dentro del WebView de Capacitor.
  base: './',
  plugins: [
    react(),
    // Tailwind sólo se usa en el módulo Carrera (src/carrera/carrera.css, sin preflight global).
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Unidad Veterinaria — Colectivos y Carrera',
        short_name: 'Unidad Vet',
        description: 'Horarios, favoritos y alertas de los colectivos entre Casilda y Rosario.',
        lang: 'es-AR',
        theme_color: THEME_COLOR,
        background_color: BACKGROUND_COLOR,
        display: 'standalone',
        start_url: './',
        scope: './',
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // woff2: fuentes de Carrera (Fraunces / Work Sans) empaquetadas para uso offline.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,woff2}'],
      },
    }),
  ],
})
