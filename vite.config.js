import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  root: '.',
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'assets',
          dest: '.'
        }
      ]
    })
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'lab-page.html',
        scoreboard: 'scoreboard-page-new.html',
      },
    },
  },
  server: {
    open: '/index.html',
    allowedHosts: ['sunny-weasel-grossly.ngrok-free.app', 'localhost'],
    host: true,
    strictPort: true,
    port: 5173,
    hmr: { host: 'sunny-weasel-grossly.ngrok-free.app', clientPort: 443 },
  },
  resolve: {
    alias: {
      '@js': '/js',
      '@assets': '/assets',
    },
  },
});
