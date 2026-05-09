import { defineConfig } from 'vitest/config';

// Pilot test suite for IM3 Module 1 Skill Graph.
// Run from monorepo root: npx vitest run apps/integrated-math-3/curriculum/skill-graph/__tests__/
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
});