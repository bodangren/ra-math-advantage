import vinext from "vinext";
import { defineConfig } from "vite";

// vinext 1.x builds through Vite and requires a Vite config (vinext 1.4.6
// refuses to build without one). danielson has no Cloudflare deploy, so the
// config loads only the vinext plugin.
export default defineConfig({
  plugins: [vinext()],
});
