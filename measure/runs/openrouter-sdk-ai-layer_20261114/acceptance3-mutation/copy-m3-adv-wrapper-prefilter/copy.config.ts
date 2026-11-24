import { defineConfig } from "vitest/config";
export default defineConfig({
  root: "/home/daniebo/Desktop/ra-math-advantage/measure/runs/openrouter-sdk-ai-layer_20261114/acceptance3-mutation/copy-m3-adv-wrapper-prefilter",
  test: { globals: true, environment: "node", include: ["*.test.ts"] },
});
