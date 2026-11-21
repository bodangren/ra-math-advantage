/**
 * Shared AI provider adapters for both teacher and student features.
 *
 * Requests go through the typed OpenRouter SDK client in `openrouter-client.ts`.
 * The SDK retry layer is off; `withRetry` stays the only retry layer.
 */

import { withRetry, EmptyResponseError } from "./retry";
import { createOpenRouterClient, type OpenRouterClientOptions } from "./openrouter-client";

const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";

type OpenRouterClient = ReturnType<typeof createOpenRouterClient>;
type SdkMessages = Parameters<OpenRouterClient["chat"]["send"]>[0]["chatRequest"]["messages"];

export interface OpenRouterProviderOptions {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  timeoutMs?: number;
}

/**
 * Replaces every occurrence of the configured API key with a redaction marker.
 */
function redactApiKey(text: string, apiKey: string): string {
  if (apiKey.length === 0 || !text.includes(apiKey)) {
    return text;
  }
  return text.split(apiKey).join("[redacted]");
}

/**
 * Maps an SDK error to the error shapes that `withRetry` already understands.
 * HTTP errors keep the `OpenRouter API error:` prefix, connection errors start
 * with `fetch failed:`, and abort errors become an `AbortError`. Upstream text
 * never carries the configured API key into the thrown error.
 */
function mapSdkError(error: unknown, apiKey: string): Error {
  if (!(error instanceof Error)) {
    return new Error(String(error));
  }

  const status = (error as Error & { statusCode?: unknown }).statusCode;
  if (typeof status === "number") {
    const mapped = new Error(
      `OpenRouter API error: ${status} ${redactApiKey(error.message, apiKey)}`,
    ) as Error & { status: number };
    mapped.status = status;
    return mapped;
  }

  if (error.name === "AbortError" || error.name === "RequestAbortedError") {
    return new DOMException("Aborted", "AbortError");
  }

  if (
    error.name === "ConnectionError" ||
    error.name === "RequestTimeoutError" ||
    error.name === "UnexpectedClientError" ||
    error.message.includes("fetch failed")
  ) {
    return new Error(`fetch failed: ${redactApiKey(error.message, apiKey)}`);
  }

  return error;
}

/**
 * Reads the text of the first choice. The SDK returns a string or content blocks.
 */
function extractContent(content: unknown): string | null {
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (item && typeof item === "object" && "text" in item) {
          return String((item as { text: unknown }).text);
        }
        return "";
      })
      .join("");
  }
  return null;
}

/**
 * Sends one chat request through the SDK inside the existing retry wrapper.
 */
async function sendChat(
  client: OpenRouterClient,
  apiKey: string,
  model: string,
  messages: SdkMessages,
  timeoutMs: number,
  abortSignal?: AbortSignal,
): Promise<string> {
  return withRetry(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    if (abortSignal) {
      if (abortSignal.aborted) {
        controller.abort();
      } else {
        const onAbort = () => controller.abort();
        abortSignal.addEventListener("abort", onAbort, { once: true });
      }
    }

    try {
      const result = await client.chat.send(
        { chatRequest: { stream: false as const, model, messages } },
        { signal: controller.signal },
      );
      const content = extractContent(result.choices?.[0]?.message?.content);
      if (content === null || content.trim().length === 0) {
        throw new EmptyResponseError();
      }
      return content.trim();
    } catch (error) {
      throw mapSdkError(error, apiKey);
    } finally {
      clearTimeout(timeout);
    }
  });
}

function clientOptions(options: OpenRouterProviderOptions): OpenRouterClientOptions {
  const { apiKey, baseUrl = OPENROUTER_API_BASE, timeoutMs = 15000 } = options;
  return { apiKey, baseUrl, timeoutMs };
}

/**
 * Creates an OpenRouter provider function for single-prompt chat completion.
 */
export function createOpenRouterProvider(options: OpenRouterProviderOptions) {
  const { model = "openrouter/free", timeoutMs = 15000 } = options;
  const client = createOpenRouterClient(clientOptions(options));

  return async function openRouterProvider(
    prompt: string,
    abortSignal?: AbortSignal,
  ): Promise<string> {
    return sendChat(
      client,
      options.apiKey,
      model,
      [{ role: "user", content: prompt }] as SdkMessages,
      timeoutMs,
      abortSignal,
    );
  };
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Creates an OpenRouter provider function for multi-message chat completion.
 */
export function createOpenRouterProviderWithMessages(options: OpenRouterProviderOptions) {
  const { model = "openrouter/free", timeoutMs = 15000 } = options;
  const client = createOpenRouterClient(clientOptions(options));

  return async function openRouterProviderWithMessages(
    messages: ChatMessage[],
    abortSignal?: AbortSignal,
  ): Promise<string> {
    return sendChat(client, options.apiKey, model, messages as SdkMessages, timeoutMs, abortSignal);
  };
}

export { EmptyResponseError } from "./retry";

/**
 * Type guard to check if an error is an OpenRouter API error.
 */
export function isOpenRouterError(error: unknown): error is Error & { status?: number } {
  return error instanceof Error && error.message.startsWith("OpenRouter API error:");
}

/**
 * Extracts HTTP status code from an OpenRouter error message.
 */
export function getErrorStatus(error: Error): number | null {
  const match = error.message.match(/error:\s*(\d{3})/);
  return match ? parseInt(match[1], 10) : null;
}

let cachedProvider: ((prompt: string, abortSignal?: AbortSignal) => Promise<string>) | null = null;

let cachedMessagesProvider:
  | ((messages: ChatMessage[], abortSignal?: AbortSignal) => Promise<string>)
  | null = null;

/**
 * Clears the cached OpenRouter providers (prompt and messages variants).
 */
export function clearProviderCache(): void {
  cachedProvider = null;
  cachedMessagesProvider = null;
}

/**
 * Resolves OpenRouter provider from environment variables (single-prompt variant).
 */
export function resolveOpenRouterProviderFromEnv():
  | ((prompt: string, abortSignal?: AbortSignal) => Promise<string>)
  | null {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    return null;
  }

  if (cachedProvider) {
    return cachedProvider;
  }

  cachedProvider = createOpenRouterProvider({
    apiKey,
    model: process.env.OPENROUTER_MODEL || "openrouter/free",
    baseUrl: process.env.OPENROUTER_API_BASE || OPENROUTER_API_BASE,
  });

  return cachedProvider;
}

/**
 * Resolve OpenRouter multi-message provider from environment variables.
 */
export function resolveOpenRouterProviderWithMessagesFromEnv():
  | ((messages: ChatMessage[], abortSignal?: AbortSignal) => Promise<string>)
  | null {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    return null;
  }

  if (cachedMessagesProvider) {
    return cachedMessagesProvider;
  }

  cachedMessagesProvider = createOpenRouterProviderWithMessages({
    apiKey,
    model: process.env.OPENROUTER_MODEL || "openrouter/free",
    baseUrl: process.env.OPENROUTER_API_BASE || OPENROUTER_API_BASE,
  });

  return cachedMessagesProvider;
}
