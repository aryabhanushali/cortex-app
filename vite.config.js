import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ngrok } from 'vite-plugin-ngrok'


export default defineConfig({
  root: '.', // Set the project root as the current folder
  plugins: [react(),
    ngrok({
      authtoken: '2nIjs8LjcTSjRMWmQr8vFcrhxkP_6evRhqLBj5HgRjdSfNoyV',
      domain: 'sunny-weasel-grossly.ngrok-free.app',
    }),
  ],
  build: {
    outDir: 'dist', // Output directory for the production build
    rollupOptions: {
      input: {
        main: 'index.html', // Define the main entry HTML
      },
    },
  },
  server: {
    open: '/index.html', 
    allowedHosts: ['sunny-weasel-grossly.ngrok-free.app', 'localhost'],
    host: true,
    strictPort: true,
    port: 5173,
    hmr: { host: 'localhost' },
  },
  resolve: {
    alias: {
      '@js': '/js', 
      '@assets': '/assets',
    },
  },
});
