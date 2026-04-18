/**
 * Shared AI provider adapters for both teacher and student features.
 */

import { withRetry, EmptyResponseError } from './retry';

const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';

export interface OpenRouterProviderOptions {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  timeoutMs?: number;
}

export function createOpenRouterProvider(options: OpenRouterProviderOptions) {
  const {
    apiKey,
    model = 'openrouter/free',
    baseUrl = OPENROUTER_API_BASE,
    timeoutMs = 15000,
  } = options;

  return async function openRouterProvider(
    prompt: string,
    abortSignal?: AbortSignal
  ): Promise<string> {
    return withRetry(async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      if (abortSignal) {
        if (abortSignal.aborted) {
          controller.abort();
        } else {
          const onAbort = () => controller.abort();
          abortSignal.addEventListener('abort', onAbort, { once: true });
        }
      }

      try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://github.com/bodangren/ra-integrated-math-3',
            'X-Title': 'Integrated Math 3',
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await response.json() as any;
        const content = data.choices?.[0]?.message?.content;
        if (typeof content !== 'string' || content.trim().length === 0) {
          throw new EmptyResponseError();
        }
        return content.trim();
      } finally {
        clearTimeout(timeout);
      }
    });
  };
}

export { EmptyResponseError } from './retry';

export function isOpenRouterError(error: unknown): error is Error & { status?: number } {
  return error instanceof Error && error.message.startsWith('OpenRouter API error:');
}

export function getErrorStatus(error: Error): number | null {
  const match = error.message.match(/error:\s*(\d{3})/);
  return match ? parseInt(match[1], 10) : null;
}

let cachedProvider: ((prompt: string, abortSignal?: AbortSignal) => Promise<string>) | null = null;

export function resolveOpenRouterProviderFromEnv(): ((prompt: string, abortSignal?: AbortSignal) => Promise<string>) | null {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    return null;
  }

  if (cachedProvider) {
    return cachedProvider;
  }

  cachedProvider = createOpenRouterProvider({
    apiKey,
    model: process.env.OPENROUTER_MODEL || 'openrouter/free',
    baseUrl: process.env.OPENROUTER_API_BASE || OPENROUTER_API_BASE,
  });

  return cachedProvider;
}