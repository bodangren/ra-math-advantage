import "dotenv/config";
import vinext from "vinext";
import { defineConfig } from "vite";

async function loadPlugins() {
  const plugins = [vinext()];
  try {
    const { cloudflare } = await import("@cloudflare/vite-plugin");
    plugins.push(cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
    }));
  } catch {
    // @cloudflare/vite-plugin not installed — skip for local builds
  }
  return plugins;
}

export default defineConfig(async () => ({
  plugins: await loadPlugins(),
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts';
            }
            if (id.includes('katex')) {
              return 'vendor-katex';
            }
            if (id.includes('@hello-pangea/dnd')) {
              return 'vendor-dnd';
            }
            if (id.includes('react-markdown') || id.includes('remark-gfm') || id.includes('rehype-') || id.includes('mdast-') || id.includes('unified')) {
              return 'vendor-markdown';
            }
            if (id.includes('convex')) {
              return 'vendor-convex';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('zod')) {
              return 'vendor-zod';
            }
            if (id.includes('@radix-ui/')) {
              return 'vendor-radix';
            }
            if (id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'vendor-utils';
            }
          }
          if (id.includes('/packages/')) {
            if (id.includes('srs-engine')) return 'vendor-srs';
            if (id.includes('practice-core')) return 'vendor-practice';
            if (id.includes('teacher-reporting')) return 'vendor-teacher';
            if (id.includes('study-hub')) return 'vendor-study';
            if (id.includes('graphing-core')) return 'vendor-graphing';
            if (id.includes('activity-runtime')) return 'vendor-activity';
            if (id.includes('ai-tutoring')) return 'vendor-ai';
            if (id.includes('workbook-pipeline')) return 'vendor-workbook';
            if (id.includes('component-approval')) return 'vendor-approval';
            if (id.includes('core-auth')) return 'vendor-auth';
            if (id.includes('core-convex')) return 'vendor-convex-core';
            return 'vendor-monorepo';
          }
        },
      },
    },
  },
}));
