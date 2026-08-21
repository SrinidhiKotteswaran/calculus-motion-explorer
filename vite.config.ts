import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Match the TypeScript @/* alias so imports stay stable as the app grows.
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // lucide-react is excluded from dependency pre-bundling for stable client loading.
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
