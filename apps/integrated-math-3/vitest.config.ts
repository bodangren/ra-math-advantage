import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    include: [
      '__tests__/**/*.test.{ts,tsx}',
      'curriculum/skill-graph/**/__tests__/**/*.test.{ts,tsx}',
      'convex/migrations/**/*.test.{ts,tsx}',
      'lib/srs/**/*.test.{ts,tsx}',
    ],
    reporters: 'default'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    }
  }
});
