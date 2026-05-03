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
        // Stubs for Convex generated types — not present until `npx convex dev` is run.
        // Regex aliases match both absolute (@/convex/_generated/api) and relative
        // (./_generated/api) import forms used inside convex/*.ts source files.
        { find: /^.*\/_generated\/api$/, replacement: path.resolve(__dirname, './__stubs__/convex-generated-api.ts') },
        { find: /^.*\/_generated\/server$/, replacement: path.resolve(__dirname, './__stubs__/convex-generated-server.ts') },
        { find: '@', replacement: path.resolve(__dirname, './') },
        { find: '@math-platform/rate-limiter', replacement: path.resolve(__dirname, '../../packages/rate-limiter/src/index.ts') },
      ]
  }
});
