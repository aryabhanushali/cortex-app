import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: '.', // Set the project root as the current folder
  plugins: [react()],
  build: {
    outDir: 'dist', // Output directory for the production build
    rollupOptions: {
      input: {
        main: 'index.html', // Define the main entry HTML
      },
    },
  },
  server: {
    open: '/index.html', // Ensure Vite opens the correct HTML file
  },
  resolve: {
    alias: {
      '@js': '/js', // Alias to reference files inside the js folder
      '@assets': '/assets',
    },
  },
});
