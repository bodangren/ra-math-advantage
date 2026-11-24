/**
 * Structured-output helper for the OpenRouter AI layer.
 *
 * The helper sends a strict JSON Schema response format, validates the answer
 * with Zod, and returns typed failures. It never throws. Each request writes
 * one usage record with no prompt, answer, or key text.
 */

import { z } from "zod";

import { createOpenRouterClient } from "./openrouter-client";
import { safeModel } from "./model-id";
import { debugLoggerFor } from "./debug-logger";
import { withRetry, EmptyResponseError } from "./retry";
import { resolveRoleModel, type AiRole } from "./roles";
import { logAiRequest, logRoleNotConfigured } from "./usage-log";

const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";
const MAX_RETRIES = 2;

/** The typed reasons a structured request can fail. */
export type StructuredFailureReason =
  | "request_failed"
  | "empty_response"
  | "aborted"
  | "invalid_json"
  | "schema_mismatch";

/** The SDK fields the helper reads from a chat result. */
interface StructuredSendResult {
  choices?: Array<{ message?: { content?: unknown } }>;
  model?: string;
  usage?: unknown;
}

/** The result of one structured request. It never throws. */
export type StructuredResult<T> =
  | { ok: true; data: T; raw: string }
  | { ok: false; reason: StructuredFailureReason; raw?: string };

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** The arguments of one structured request. */
export interface StructuredRequest<TSchema extends z.ZodType> {
  schemaName: string;
  schema: TSchema;
  messages: ChatMessage[];
  abortSignal?: AbortSignal;
  temperature?: number;
  maxTokens?: number;
}

/** A bound structured provider for one role. */
export type StructuredProvider = <TSchema extends z.ZodType>(
  request: StructuredRequest<TSchema>,
) => Promise<StructuredResult<z.infer<TSchema>>>;

/** Reads the text of the first choice. The SDK returns a string or content blocks. */
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

/** Maps an SDK error to the error shapes that `withRetry` understands. */
function mapSdkError(error: unknown): Error {
  if (error instanceof EmptyResponseError) {
    return error;
  }
  if (
    error instanceof Error &&
    (error.name === "AbortError" || error.name === "RequestAbortedError")
  ) {
    return new DOMException("Aborted", "AbortError");
  }
  if (error instanceof Error) {
    const status = (error as Error & { statusCode?: unknown }).statusCode;
    if (typeof status === "number") {
      const mapped = new Error(`OpenRouter API error: ${status}`) as Error & { status: number };
      mapped.status = status;
      return mapped;
    }
    return error;
  }
  return new Error(String(error));
}

/** Maps a caught error to a typed failure reason. */
function reasonFor(error: unknown): StructuredFailureReason {
  if (error instanceof EmptyResponseError) {
    return "empty_response";
  }
  if ((error instanceof Error || error instanceof DOMException) && error.name === "AbortError") {
    return "aborted";
  }
  return "request_failed";
}

/** Reads the token counts of an SDK result. */
function readUsage(value: unknown): {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
} {
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

/**
 * Resolves the structured provider of a role from environment variables.
 * A missing key or model is logged and returns null.
 */
export function resolveStructuredProviderFromEnv(role: AiRole): StructuredProvider | null {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    logRoleNotConfigured(role, "OPENROUTER_API_KEY", "missing");
    return null;
  }

  const modelResult = resolveRoleModel(role);
  if (!modelResult.ok) {
    logRoleNotConfigured(role, modelResult.missing, modelResult.reason);
    return null;
  }

  const client = createOpenRouterClient({
    apiKey,
    baseUrl: process.env.OPENROUTER_API_BASE || OPENROUTER_API_BASE,
    debugLogger: debugLoggerFor(apiKey),
  });
  const model = modelResult.model;

  return async function structuredProvider<TSchema extends z.ZodType>(
    request: StructuredRequest<TSchema>,
  ): Promise<StructuredResult<z.infer<TSchema>>> {
    const startedAt = Date.now();
    const jsonSchema = z.toJSONSchema(request.schema);
    // The SDK input shape uses camelCase and remaps it to the outbound JSON.
    // The outbound-shaped field is also set so the contract holds at the SDK
    // boundary. The SDK reads the camelCase provider key by name, so that key
    // is non-enumerable: the boundary object keeps only the outbound key, and
    // the SDK still remaps the preference onto the wire body.
    const providerPreference = Object.defineProperty(
      { require_parameters: true },
      "requireParameters",
      { value: true, enumerable: false },
    );
    const contractFields = {
      response_format: {
        type: "json_schema" as const,
        json_schema: {
          name: request.schemaName,
          strict: true,
          schema: jsonSchema,
        },
      },
      provider: providerPreference,
    };
    let outcome: "ok" | "error" = "error";
    let status: number | null = null;
    let servedModel: string | null = null;
    let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    let content: string | null;

    try {
      const text = await withRetry(
        async () => {
          let result: StructuredSendResult;
          try {
            result = (await client.chat.send(
              {
                chatRequest: {
                  stream: false as const,
                  model,
                  messages: request.messages,
                  responseFormat: {
                    type: "json_schema" as const,
                    jsonSchema: {
                      name: request.schemaName,
                      strict: true,
                      schema: jsonSchema,
                    },
                  },
                  ...(request.temperature === undefined
                    ? {}
                    : { temperature: request.temperature }),
                  ...(request.maxTokens === undefined ? {} : { maxTokens: request.maxTokens }),
                  ...contractFields,
                },
              } as unknown as Parameters<typeof client.chat.send>[0],
              request.abortSignal ? { signal: request.abortSignal } : undefined,
            )) as unknown as StructuredSendResult;
          } catch (error) {
            throw mapSdkError(error);
          }
          const answer = extractContent(result.choices?.[0]?.message?.content);
          if (answer === null || answer.trim().length === 0) {
            throw new EmptyResponseError();
          }
          servedModel = safeModel(result.model);
          usage = readUsage(result.usage);
          return answer.trim();
        },
        { maxRetries: MAX_RETRIES, signal: request.abortSignal },
      );
      content = text;
      outcome = "ok";
    } catch (error) {
      const mapped = mapSdkError(error);
      const mappedStatus = (mapped as Error & { status?: unknown }).status;
      if (typeof mappedStatus === "number") {
        status = mappedStatus;
      }
      const reason = reasonFor(mapped);
      logAiRequest({
        role,
        model: safeModel(model),
        latencyMs: Date.now() - startedAt,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        outcome,
        status,
      });
      return { ok: false, reason };
    }

    logAiRequest({
      role,
      model: servedModel,
      latencyMs: Date.now() - startedAt,
      ...usage,
      outcome,
      status,
    });

    if (content === null) {
      return { ok: false, reason: "empty_response" };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return { ok: false, reason: "invalid_json", raw: content };
    }

    const validated = request.schema.safeParse(parsed);
    if (!validated.success) {
      return { ok: false, reason: "schema_mismatch", raw: content };
    }

    return { ok: true, data: validated.data as z.infer<TSchema>, raw: content };
  };
}
