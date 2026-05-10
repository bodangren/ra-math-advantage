import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000, // problem-families data (~2100 lines) takes ~13s to transform on cold start
  },
});
