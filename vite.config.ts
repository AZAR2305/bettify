import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: './vaultos',
  publicDir: 'public',
  server: {
    port: 5173,
    strictPort: true,  // Fail if port is already in use
    hmr: {
      port: 5173,  // Use same port for HMR websocket
      host: 'localhost'
    },
    proxy: {
      '/api': {
        target: 'https://bettify-33d9.onrender.com',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../dist-client',
  },
});
