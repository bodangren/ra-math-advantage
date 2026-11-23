import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { z } from "zod";
import { OpenRouter } from "@openrouter/sdk";
import { clearProviderCache } from "../providers";

vi.mock("@openrouter/sdk", () => ({ OpenRouter: vi.fn() }));

const mockSend = vi.fn();
const MockOpenRouter = vi.mocked(OpenRouter);

const STRUCTURED_SPECIFIER: string = "../structured";

async function loadStructured(): Promise<any> {
  try {
    return await import(STRUCTURED_SPECIFIER);
  } catch {
    return null;
  }
}

const TEST_SCHEMA = z.strictObject({ score: z.number() });

function roleTextResponse(content: string, model = "served-structured-r1") {
  return {
    id: "gen-structured-r1",
    created: 2,
    model,
    choices: [{ message: { role: "assistant", content }, finishReason: "stop" }],
    usage: { promptTokens: 7, completionTokens: 5, totalTokens: 12 },
  };
}

function sentChatRequest(callArgs: unknown[]): Record<string, unknown> {
  const first = (callArgs[0] ?? {}) as Record<string, unknown>;
  return (first["chatRequest"] ?? first) as Record<string, unknown>;
}

function validFeedbackJson() {
  return JSON.stringify({ score: 35 });
}

const MESSAGES = [{ role: "user" as const, content: "Give feedback" }];

beforeEach(() => {
  mockSend.mockReset();
  MockOpenRouter.mockReset();
  MockOpenRouter.mockImplementation(function () {
    return { chat: { send: mockSend } } as unknown as InstanceType<typeof OpenRouter>;
  });
  clearProviderCache();
  vi.stubEnv("OPENROUTER_API_KEY", "sk-test");
  vi.stubEnv("OPENROUTER_MODEL_SPREADSHEET_EVAL", "vendor/spreadsheet-model");
  vi.stubEnv("OPENROUTER_MODEL", "vendor/old-global-model");
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  clearProviderCache();
});

describe("structured output", () => {
  it("case 1: a valid JSON answer that matches the schema gives ok true with data and raw", async () => {
    const structured = await loadStructured();
    expect(structured).not.toBeNull();
    mockSend.mockResolvedValueOnce(roleTextResponse(validFeedbackJson()));

    const provider = structured.resolveStructuredProviderFromEnv("spreadsheetEval");
    expect(provider).not.toBeNull();
    const result = await provider({
      schemaName: "test_schema",
      schema: TEST_SCHEMA,
      messages: MESSAGES,
    });

    expect(result).toEqual({ ok: true, data: { score: 35 }, raw: validFeedbackJson() });
  });

  it("case 2: the request body holds response_format with the name, strict true, and the z.toJSONSchema output", async () => {
    const structured = await loadStructured();
    expect(structured).not.toBeNull();
    mockSend.mockResolvedValueOnce(roleTextResponse(validFeedbackJson()));

    const provider = structured.resolveStructuredProviderFromEnv("spreadsheetEval");
    await provider({
      schemaName: "test_schema",
      schema: TEST_SCHEMA,
      messages: MESSAGES,
    });

    expect(mockSend).toHaveBeenCalledTimes(1);
    const request = sentChatRequest(mockSend.mock.calls[0]);
    expect(request["response_format"]).toEqual({
      type: "json_schema",
      json_schema: {
        name: "test_schema",
        strict: true,
        schema: z.toJSONSchema(TEST_SCHEMA),
      },
    });
  });

  it("case 3: the request provider object is exactly require_parameters true", async () => {
    const structured = await loadStructured();
    expect(structured).not.toBeNull();
    mockSend.mockResolvedValueOnce(roleTextResponse(validFeedbackJson()));

    const provider = structured.resolveStructuredProviderFromEnv("spreadsheetEval");
    await provider({
      schemaName: "test_schema",
      schema: TEST_SCHEMA,
      messages: MESSAGES,
    });

    expect(mockSend).toHaveBeenCalledTimes(1);
    const request = sentChatRequest(mockSend.mock.calls[0]);
    expect(request["provider"]).toEqual({ require_parameters: true });
  });

  it("case 4: text that is not JSON gives invalid_json with raw", async () => {
    const structured = await loadStructured();
    expect(structured).not.toBeNull();
    mockSend.mockResolvedValueOnce(roleTextResponse("not json{{{"));

    const provider = structured.resolveStructuredProviderFromEnv("spreadsheetEval");
    const result = await provider({
      schemaName: "test_schema",
      schema: TEST_SCHEMA,
      messages: MESSAGES,
    });

    expect(result).toEqual({ ok: false, reason: "invalid_json", raw: "not json{{{" });
  });

  it("case 5: JSON that fails the schema gives schema_mismatch with raw", async () => {
    const structured = await loadStructured();
    expect(structured).not.toBeNull();
    const raw = JSON.stringify({ wrong: "shape" });
    mockSend.mockResolvedValueOnce(roleTextResponse(raw));

    const provider = structured.resolveStructuredProviderFromEnv("spreadsheetEval");
    const result = await provider({
      schemaName: "test_schema",
      schema: TEST_SCHEMA,
      messages: MESSAGES,
    });

    expect(result).toEqual({ ok: false, reason: "schema_mismatch", raw });
  });

  it("case 6: empty content on each attempt gives empty_response", async () => {
    const structured = await loadStructured();
    expect(structured).not.toBeNull();
    mockSend.mockResolvedValue(roleTextResponse("   "));

    const provider = structured.resolveStructuredProviderFromEnv("spreadsheetEval");
    const result = await provider({
      schemaName: "test_schema",
      schema: TEST_SCHEMA,
      messages: MESSAGES,
    });

    expect(result).toEqual({ ok: false, reason: "empty_response" });
    expect(mockSend).toHaveBeenCalledTimes(3);
  });

  it("case 7: an HTTP 400 gives request_failed with no retry, and a 503 then a success gives ok true", async () => {
    const structured = await loadStructured();
    expect(structured).not.toBeNull();
    mockSend.mockRejectedValueOnce(Object.assign(new Error("Bad request"), { statusCode: 400 }));

    const provider = structured.resolveStructuredProviderFromEnv("spreadsheetEval");
    const failed = await provider({
      schemaName: "test_schema",
      schema: TEST_SCHEMA,
      messages: MESSAGES,
    });

    expect(failed).toMatchObject({ ok: false, reason: "request_failed" });
    expect(mockSend).toHaveBeenCalledTimes(1);

    clearProviderCache();
    mockSend.mockReset();
    mockSend.mockRejectedValueOnce(Object.assign(new Error("Busy"), { statusCode: 503 }));
    mockSend.mockResolvedValueOnce(roleTextResponse(validFeedbackJson()));

    const recovered = await provider({
      schemaName: "test_schema",
      schema: TEST_SCHEMA,
      messages: MESSAGES,
    });

    expect(recovered).toEqual({ ok: true, data: { score: 35 }, raw: validFeedbackJson() });
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it("case 8: an external abort gives aborted", async () => {
    const structured = await loadStructured();
    expect(structured).not.toBeNull();
    mockSend.mockResolvedValue(roleTextResponse(validFeedbackJson()));

    const controller = new AbortController();
    controller.abort();
    const provider = structured.resolveStructuredProviderFromEnv("spreadsheetEval");
    const result = await provider({
      schemaName: "test_schema",
      schema: TEST_SCHEMA,
      messages: MESSAGES,
      abortSignal: controller.signal,
    });

    expect(result).toEqual({ ok: false, reason: "aborted" });
  });

  it("case 9: a strict object schema gives additionalProperties false and lists all keys in required", () => {
    const mirror = z.strictObject({
      likelyMisunderstanding: z.string(),
      evidenceObserved: z.array(z.string()),
      suggestedReteach: z.string(),
      groundedIn: z.array(z.string()),
    });
    const jsonSchema = z.toJSONSchema(mirror) as {
      additionalProperties?: boolean;
      required?: string[];
    };
    expect(jsonSchema.additionalProperties).toBe(false);
    expect(jsonSchema.required).toEqual([
      "likelyMisunderstanding",
      "evidenceObserved",
      "suggestedReteach",
      "groundedIn",
    ]);
  });
});
