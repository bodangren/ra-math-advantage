/**
 * Shared AI provider adapters for both teacher and student features.
 *
 * Requests go through the typed OpenRouter SDK client in `openrouter-client.ts`.
 * The SDK retry layer is off; `withRetry` stays the only retry layer.
 * Each role resolves its own model. Each request writes one usage record.
 */

import { withRetry, EmptyResponseError } from "./retry";
import { createOpenRouterClient, type OpenRouterClientOptions } from "./openrouter-client";
import {
  AI_ROLES,
  resolveRoleModel,
  buildProviderPreferences,
  type AiRole,
  type ProviderPreferences,
} from "./roles";
import { logAiRequest, logRoleNotConfigured } from "./usage-log";

const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";

type OpenRouterClient = ReturnType<typeof createOpenRouterClient>;
type SdkMessages = Parameters<OpenRouterClient["chat"]["send"]>[0]["chatRequest"]["messages"];
type PromptProvider = (prompt: string, abortSignal?: AbortSignal) => Promise<string>;
type MessagesProvider = (messages: ChatMessage[], abortSignal?: AbortSignal) => Promise<string>;

export interface OpenRouterProviderOptions {
  apiKey: string;
  model: string;
  role: AiRole;
  baseUrl?: string;
  timeoutMs?: number;
}

const MIN_REDACT_KEY_LENGTH = 8;
const BEARER_SCHEME = /^bearer\s+/i;

/**
 * Lists the configured key forms that an upstream error may echo.
 * A short key is never redacted, so ordinary text stays unchanged.
 * The bearer scheme is removed without case sensitivity and with any
 * following whitespace.
 */
function redactionTargets(apiKey: string): string[] {
  if (apiKey.length === 0) {
    return [];
  }
  const trimmed = apiKey.trim();
  if (trimmed.length < MIN_REDACT_KEY_LENGTH) {
    return [];
  }
  const scheme = BEARER_SCHEME.exec(trimmed);
  const token = scheme ? trimmed.slice(scheme[0].length) : trimmed;
  const targets = [apiKey, trimmed, token];
  return [...new Set(targets.filter((target) => target.length >= MIN_REDACT_KEY_LENGTH))];
}

/**
 * Replaces every occurrence of a configured key form with a redaction marker.
 */
function redactApiKey(text: string, apiKey: string): string {
  let redacted = text;
  for (const target of redactionTargets(apiKey)) {
    redacted = redacted.split(target).join("[redacted]");
  }
  return redacted;
}

/**
 * Maps an SDK error to the error shapes that `withRetry` already understands.
 * HTTP errors keep only the status, so an upstream body never reaches a log.
 * Connection errors start with `fetch failed:`, and abort errors stay
 * `AbortError`. An `EmptyResponseError` stays itself.
 */
function mapSdkError(error: unknown, apiKey: string): Error {
  if (error instanceof EmptyResponseError) {
    return error;
  }

  // A response whose body cannot be read holds no answer. Treat it as empty
  // so the retry layer gives the request another attempt.
  if (
    error instanceof Error &&
    (error.message.includes("Body is unusable") || error.message.includes("already been read"))
  ) {
    return new EmptyResponseError();
  }

  const message = error instanceof Error ? error.message : String(error);
  const redacted = redactApiKey(message, apiKey);

  if (!(error instanceof Error)) {
    return new Error(redacted);
  }

  const status = (error as Error & { statusCode?: unknown }).statusCode;
  if (typeof status === "number") {
    const mapped = new Error(`OpenRouter API error: ${status}`) as Error & {
      status: number;
    };
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
    return new Error(`fetch failed: ${redacted}`);
  }

  return new Error(redacted);
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

interface UsageCounts {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

interface ChatOutcome {
  content: string;
  servedModel: string;
  usage: UsageCounts;
}

/** Reads token counts from an SDK result or a raw response body. */
function readUsage(value: unknown): UsageCounts {
  if (!value || typeof value !== "object") {
    return { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
  }
  const usage = value as Record<string, unknown>;
  const count = (camel: string, snake: string): number => {
    const candidate = usage[camel] ?? usage[snake];
    return typeof candidate === "number" ? candidate : 0;
  };
  return {
    promptTokens: count("promptTokens", "prompt_tokens"),
    completionTokens: count("completionTokens", "completion_tokens"),
    totalTokens: count("totalTokens", "total_tokens"),
  };
}

const MODEL_ID = /^[A-Za-z0-9_.:~/-]{1,128}$/;

/**
 * Accepts only a bounded model identifier for a usage record. Any other text,
 * including prompt, answer, or key text, is recorded as null.
 */
function safeModel(value: unknown): string | null {
  return typeof value === "string" && MODEL_ID.test(value) ? value : null;
}

/**
 * Recovers a content answer from an SDK 200 body that failed strict validation.
 * The documented OpenRouter example and an error-only 200 body both reach this
 * path. A body without content is reported as empty so `withRetry` retries it.
 */
function recoverValidatedBody(error: unknown, fallbackModel: string): ChatOutcome | null {
  if (!(error instanceof Error)) {
    return null;
  }
  const validationError = error as Error & {
    name: string;
    statusCode?: unknown;
    rawValue?: unknown;
  };
  if (validationError.name !== "ResponseValidationError" || validationError.statusCode !== 200) {
    return null;
  }

  const raw = validationError.rawValue;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const body = raw as Record<string, unknown>;
  const choices = Array.isArray(body.choices) ? body.choices : [];
  const first =
    choices.length > 0 && choices[0] && typeof choices[0] === "object"
      ? (choices[0] as Record<string, unknown>)
      : null;
  const message =
    first && first.message && typeof first.message === "object"
      ? (first.message as Record<string, unknown>)
      : null;
  const content = message ? extractContent(message.content) : null;

  return {
    content: content === null ? "" : content.trim(),
    servedModel: safeModel(body.model) ?? fallbackModel,
    usage: readUsage(body.usage),
  };
}

/**
 * Sends one chat request through the SDK inside the existing retry wrapper.
 * One usage record is written after success or after the last retry.
 */
async function sendChat(
  client: OpenRouterClient,
  apiKey: string,
  role: AiRole,
  model: string,
  messages: SdkMessages,
  timeoutMs: number,
  preferences: ProviderPreferences | undefined,
  abortSignal?: AbortSignal,
): Promise<string> {
  const startedAt = Date.now();
  let lastStatus: number | null = null;

  try {
    const outcome = await withRetry(async () => {
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
          {
            chatRequest: {
              stream: false as const,
              model,
              messages,
              ...(preferences ? { provider: preferences } : {}),
            },
          },
          { signal: controller.signal },
        );
        const content = extractContent(result.choices?.[0]?.message?.content);
        if (content === null || content.trim().length === 0) {
          throw new EmptyResponseError();
        }
        return {
          content: content.trim(),
          servedModel: safeModel(result.model) ?? model,
          usage: readUsage(result.usage),
        };
      } catch (error) {
        const recovered = recoverValidatedBody(error, model);
        if (recovered) {
          if (recovered.content.trim().length === 0) {
            throw new EmptyResponseError();
          }
          return recovered;
        }
        const mapped = mapSdkError(error, apiKey);
        const mappedStatus = (mapped as Error & { status?: unknown }).status;
        if (typeof mappedStatus === "number") {
          lastStatus = mappedStatus;
        }
        throw mapped;
      } finally {
        clearTimeout(timeout);
      }
    });

    logAiRequest({
      role,
      model: safeModel(outcome.servedModel),
      latencyMs: Date.now() - startedAt,
      ...outcome.usage,
      outcome: "ok",
      status: null,
    });
    return outcome.content;
  } catch (error) {
    const status = (error as Error & { status?: unknown }).status;
    logAiRequest({
      role,
      model: safeModel(model),
      latencyMs: Date.now() - startedAt,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      outcome: "error",
      status: typeof status === "number" ? status : lastStatus,
    });
    throw error;
  }
}

function clientOptions(options: OpenRouterProviderOptions): OpenRouterClientOptions {
  const { apiKey, baseUrl = OPENROUTER_API_BASE, timeoutMs = 15000 } = options;
  return { apiKey, baseUrl, timeoutMs };
}

/**
 * Creates an OpenRouter provider function for single-prompt chat completion.
 */
export function createOpenRouterProvider(options: OpenRouterProviderOptions): PromptProvider {
  const { model, role, timeoutMs = 15000 } = options;
  const client = createOpenRouterClient(clientOptions(options));
  const preferences = buildProviderPreferences(AI_ROLES[role]);

  return function openRouterProvider(prompt: string, abortSignal?: AbortSignal): Promise<string> {
    return sendChat(
      client,
      options.apiKey,
      role,
      model,
      [{ role: "user", content: prompt }] as SdkMessages,
      timeoutMs,
      preferences,
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
export function createOpenRouterProviderWithMessages(
  options: OpenRouterProviderOptions,
): MessagesProvider {
  const { model, role, timeoutMs = 15000 } = options;
  const client = createOpenRouterClient(clientOptions(options));
  const preferences = buildProviderPreferences(AI_ROLES[role]);

  return function openRouterProviderWithMessages(
    messages: ChatMessage[],
    abortSignal?: AbortSignal,
  ): Promise<string> {
    return sendChat(
      client,
      options.apiKey,
      role,
      model,
      messages as SdkMessages,
      timeoutMs,
      preferences,
      abortSignal,
    );
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

const providerCache = new Map<string, PromptProvider>();
const messagesProviderCache = new Map<string, MessagesProvider>();

/** Clears the cached OpenRouter providers of every role. */
export function clearProviderCache(): void {
  providerCache.clear();
  messagesProviderCache.clear();
}

/**
 * Checks the environment before a cache hit. A removed key or role model must
 * fail closed on the next call, even when a provider was resolved before.
 */
function roleSettings(
  role: AiRole,
): { ok: true; apiKey: string; model: string; cacheKey: string } | { ok: false } {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    logRoleNotConfigured(role, "OPENROUTER_API_KEY", "missing");
    return { ok: false };
  }

  const modelResult = resolveRoleModel(role);
  if (!modelResult.ok) {
    logRoleNotConfigured(role, modelResult.missing, modelResult.reason);
    return { ok: false };
  }

  return {
    ok: true,
    apiKey,
    model: modelResult.model,
    cacheKey: `${role}\u0000${apiKey}\u0000${modelResult.model}`,
  };
}

/**
 * Resolves the OpenRouter provider of a role from environment variables.
 * A missing key or model is logged and returns null.
 */
export function resolveOpenRouterProviderFromEnv(role: AiRole): PromptProvider | null {
  const settings = roleSettings(role);
  if (!settings.ok) {
    return null;
  }

  const cached = providerCache.get(settings.cacheKey);
  if (cached) {
    return cached;
  }

  const provider = createOpenRouterProvider({
    apiKey: settings.apiKey,
    model: settings.model,
    role,
    baseUrl: process.env.OPENROUTER_API_BASE || OPENROUTER_API_BASE,
  });
  providerCache.set(settings.cacheKey, provider);
  return provider;
}

/**
 * Resolves the OpenRouter multi-message provider of a role from environment.
 * A missing key or model is logged and returns null.
 */
export function resolveOpenRouterProviderWithMessagesFromEnv(
  role: AiRole,
): MessagesProvider | null {
  const settings = roleSettings(role);
  if (!settings.ok) {
    return null;
  }

  const cached = messagesProviderCache.get(settings.cacheKey);
  if (cached) {
    return cached;
  }

  const provider = createOpenRouterProviderWithMessages({
    apiKey: settings.apiKey,
    model: settings.model,
    role,
    baseUrl: process.env.OPENROUTER_API_BASE || OPENROUTER_API_BASE,
  });
  messagesProviderCache.set(settings.cacheKey, provider);
  return provider;
}
