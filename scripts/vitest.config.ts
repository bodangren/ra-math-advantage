import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Vite sets `root` from the working folder. The `include` entries below are relative to
  // this folder, so the root comes from the config file, not from `process.cwd()`.
  root: fileURLToPath(new URL('.', import.meta.url)),
  test: {
    globals: true,
    environment: 'node',
    include: [
      '__tests__/remediate-concept-blueprints.test.ts',
      '__tests__/oxc-toolchain-gates.test.ts',
      '__tests__/vinext-oxc-gates-script.test.ts',
    ],
  },
});
