import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    include: [
      '__tests__/**/*.test.{ts,tsx}',
    ],
    reporters: 'default'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@math-platform/rate-limiter': path.resolve(__dirname, '../../packages/rate-limiter/src/index.ts'),
    }
  }
});
