import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { viteSingleFile } from 'vite-plugin-singlefile';

// "npm run build"        -> PWA instalável (manifest + service worker), para hospedar na Vercel/Netlify.
// "npm run build:single" -> um único index.html, usado só para pré-visualização.
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'single'
      ? viteSingleFile()
      : VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['icon-192.png', 'icon-512.png', 'apple-touch-icon.png'],
          manifest: {
            name: 'meuPet',
            short_name: 'meuPet',
            description: 'Agende banho e tosa, veterinário e mais perto de você em Alphaville.',
            lang: 'pt-BR',
            theme_color: '#0f766e',
            background_color: '#ffffff',
            display: 'standalone',
            start_url: '/',
            icons: [
              { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
              { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
              { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            ],
          },
          workbox: {
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/,
                handler: 'CacheFirst',
                options: { cacheName: 'osm-tiles', expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 14 } },
              },
            ],
          },
        }),
  ],
  build: mode === 'single' ? { outDir: 'dist-single' } : {},
}));
