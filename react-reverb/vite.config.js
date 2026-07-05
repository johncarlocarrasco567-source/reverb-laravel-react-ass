import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy all API requests to Laravel
      '/api': 'http://localhost:8000',
      // Proxy the broadcasting auth endpoint too
      '/broadcasting': 'http://localhost:8000',
    },
  },
});