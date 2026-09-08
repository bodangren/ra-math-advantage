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
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './') },
      {
        find: /^@math-platform\/practice-core$/,
        replacement: path.resolve(__dirname, '../../packages/practice-core/src/index.ts'),
      },
    ],
  }
});
