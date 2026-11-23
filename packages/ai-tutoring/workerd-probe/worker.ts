/**
 * Test worker: runs the package provider inside workerd against the local mock server.
 */

import { createOpenRouterProvider } from "../src/providers";

export interface Env {
  OPENROUTER_API_KEY: string;
  OPENROUTER_API_BASE: string;
}

export default {
  async fetch(_request: Request, env: Env): Promise<Response> {
    const provider = createOpenRouterProvider({
      apiKey: env.OPENROUTER_API_KEY,
      baseUrl: env.OPENROUTER_API_BASE,
      role: "studentTutor",
      model: "probe/model",
    });
    const text = await provider("probe");
    return new Response(text, { headers: { "content-type": "text/plain" } });
  },
};
