import { defineConfig } from "vitest/config";
export default defineConfig({
  root: "/home/daniebo/Desktop/ra-math-advantage/scripts",
  resolve: { alias: [{ find: /^\.\/openrouter-scan-shared$/, replacement: "/home/daniebo/Desktop/ra-math-advantage/measure/runs/openrouter-sdk-ai-layer_20261114/acceptance3-mutation/helper-m1-old-skip.ts" }] },
  test: { globals: true, environment: "node", include: ["__tests__/openrouter-only.test.ts", "__tests__/openrouter-s4-adversarial.test.ts"] },
});
