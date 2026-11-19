import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: [
      "__tests__/**/*.test.{ts,tsx}",
      "curriculum/skill-graph/**/__tests__/**/*.test.{ts,tsx}",
      "convex/migrations/**/*.test.{ts,tsx}",
      "lib/srs/**/*.test.{ts,tsx}",
    ],
    reporters: "default",
  },
  resolve: {
    alias: {
      // vinext 1.x replaces the next package: tests resolve next/* through the vinext
      // runtime shims, the same mapping that vinext build uses
      // (vinext/shims/public-shim-map.json).
      "next/link": "vinext/shims/link",
      "next/head": "vinext/shims/head",
      "next/compat/router": "vinext/shims/compat-router",
      "next/router": "vinext/shims/router",
      "next/legacy/image": "vinext/shims/legacy-image",
      "next/image": "vinext/shims/image",
      "next/dynamic": "vinext/shims/dynamic",
      "next/app": "vinext/shims/app",
      "next/document": "vinext/shims/document",
      "next/config": "vinext/shims/config",
      "next/script": "vinext/shims/script",
      "next/server": "vinext/shims/server",
      "next/navigation": "vinext/shims/navigation",
      "next/headers": "vinext/shims/headers",
      "next/font/google": "vinext/shims/font-google",
      "next/font/local": "vinext/shims/font-local",
      "next/cache": "vinext/shims/cache",
      "next/form": "vinext/shims/form",
      "next/og": "vinext/shims/og",
      "next/web-vitals": "vinext/shims/web-vitals",
      "next/amp": "vinext/shims/amp",
      "next/offline": "vinext/shims/offline",
      "next/error": "vinext/shims/error",
      "next/constants": "vinext/shims/constants",
      "@": path.resolve(__dirname, "./"),
    },
  },
});
