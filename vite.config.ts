import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['lift.png'],
          manifest: {
            name: 'LIFT',
            short_name: 'LIFT',
            start_url: '/',
            display: 'standalone',
            background_color: '#000000',
            theme_color: '#000000',
            orientation: 'portrait',
            icons: [
              {
                src: '/lift.png',
                sizes: '192x192',
                type: 'image/png',
              },
              {
                src: '/lift.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable',
              },
            ],
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
            // lift.png is 3.8MB — above Workbox's 2MB precache limit.
            // Excluded from precache and served via runtime CacheFirst instead.
            globIgnores: ['**/lift*.png'],
            runtimeCaching: [
              {
                urlPattern: /\/lift.*\.png$/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'assets-cache',
                  expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 30 },
                },
              },
            ],
          },
        }),
      ],
      test: {
        environment: 'jsdom',
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
