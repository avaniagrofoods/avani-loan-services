import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/hubspot/callback': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace('/hubspot/callback', '/api/auth/hubspot/callback')
      }
    }
  },
  build: {
    // Increase the warning limit so the current bundle size (≈800KB) does not raise a warning
    chunkSizeWarningLimit: 1000, // in KB
    // Manual chunking to split large vendor libraries into separate files
    rollupOptions: {
      output: {
        manualChunks: {
          // Split core React libs
          reactVendor: ['react', 'react-dom', 'react-router-dom'],
          // UI icons and utilities
          uiVendor: ['lucide-react'],
          // Crypto & auth
          authVendor: ['jsonwebtoken'],
          // HTTP & other helpers
          utilsVendor: ['axios', 'lodash']
        }
      }
    }
  }
});
