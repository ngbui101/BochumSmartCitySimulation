import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  envDir: '..',
  envPrefix: ['VITE_', 'CARTO_'],
  build: {
    rollupOptions: {
      output: {
        // Keep framework/map libraries cacheable across game-rule changes.
        manualChunks: {
          vendor: ['react', 'react-dom', 'leaflet', 'react-leaflet']
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/e2e/**']
  }
});
