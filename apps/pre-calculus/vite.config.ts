import "dotenv/config";
import vinext from "vinext";
import { defineConfig } from "vite";

async function loadPlugins(command: string) {
  const plugins = [vinext()];
  if (command === "build") {
    const { cloudflare } = await import("@cloudflare/vite-plugin");
    plugins.push(cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
    }));
  }
  return plugins;
}

export default defineConfig(async ({ command }) => ({
  plugins: await loadPlugins(command),
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('convex')) {
              return 'vendor-convex';
            }
          }
        },
      },
    },
  },
}));
