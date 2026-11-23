/**
 * Builds the typed OpenRouter SDK client used by the provider adapters.
 *
 * The SDK retry layer is off. `withRetry` in `retry.ts` is the only retry layer.
 */

import { OpenRouter } from "@openrouter/sdk";

export interface OpenRouterClientOptions {
  apiKey: string;
  baseUrl?: string;
  timeoutMs?: number;
  debugLogger?: {
    group(label?: string): void;
    groupEnd(): void;
    log(message: unknown, ...args: unknown[]): void;
  };
}

/**
 * Creates an SDK client from the API key and the optional base URL.
 */
export function createOpenRouterClient(options: OpenRouterClientOptions): OpenRouter {
  return new OpenRouter({
    apiKey: options.apiKey,
    serverURL: options.baseUrl,
    httpReferer: "https://github.com/bodangren/ra-integrated-math-3",
    appTitle: "Integrated Math 3",
    retryConfig: { strategy: "none" },
    timeoutMs: options.timeoutMs,
    debugLogger: options.debugLogger,
  });
}
