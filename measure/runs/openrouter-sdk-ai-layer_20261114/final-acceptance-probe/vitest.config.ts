// Final acceptance probe config. Audit script. It runs only the probe test in this folder.
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: __dirname,
  test: {
    globals: true,
    environment: "node",
    include: ["*.test.ts"],
    testTimeout: 90000,
  },
});
