import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

// Read from .env.local
dotenv.config({ path: fileURLToPath(new URL(".env.local", import.meta.url)) });

const baseURL = process.env.BM2_E2E_BASE_URL ?? "http://localhost:3030";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  timeout: 60000,
  use: {
    baseURL,
    ignoreHTTPSErrors: process.env.BM2_E2E_LOCAL_HTTPS === "1",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(process.env.BM2_E2E_BROWSER_CHANNEL
          ? { channel: process.env.BM2_E2E_BROWSER_CHANNEL }
          : {}),
      },
    },
  ],
  webServer: process.env.BM2_E2E_BASE_URL
    ? undefined
    : {
        command: "BM2_DEV_RUNTIME=node npm run dev -- --port 3030",
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120 * 1000,
      },
});
