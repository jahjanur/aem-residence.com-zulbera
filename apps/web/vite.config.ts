import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// When deployed under a path (e.g. aem-residence.com/zulbera), set VITE_BASE_PATH=/zulbera at build time
const basePath = process.env.VITE_BASE_PATH?.replace(/\/?$/, '') || '';
const base = basePath ? `/${basePath}/` : '/';

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
});
