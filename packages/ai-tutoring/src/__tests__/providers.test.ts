import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createOpenRouterProvider,
  createOpenRouterProviderWithMessages,
  resolveOpenRouterProviderFromEnv,
  clearProviderCache,
} from "../providers";
import { OpenRouter } from "@openrouter/sdk";

vi.mock("@openrouter/sdk", () => ({ OpenRouter: vi.fn() }));

const legacySend = vi.fn();
const OpenRouterCtor = vi.mocked(OpenRouter);

function legacyTextResponse(content: string) {
  return {
    id: "gen-1",
    created: 1,
    model: "vendor/model-a",
    choices: [{ message: { role: "assistant", content }, finishReason: "stop" }],
    usage: { promptTokens: 3, completionTokens: 2, totalTokens: 5 },
  };
}

// Shared constructor-safe mock. The SDK transport block replaces this send spy.
beforeEach(() => {
  legacySend.mockReset();
  OpenRouterCtor.mockReset();
  OpenRouterCtor.mockImplementation(function () {
    return { chat: { send: legacySend } } as unknown as InstanceType<typeof OpenRouter>;
  });
});

describe("createOpenRouterProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates a provider function", () => {
    const provider = createOpenRouterProvider({ apiKey: "test-key" });
    expect(typeof provider).toBe("function");
  });

  it("calls OpenRouter API with correct headers", async () => {
    legacySend.mockResolvedValueOnce(legacyTextResponse("Hello!"));

    const provider = createOpenRouterProvider({ apiKey: "test-key" });
    const result = await provider("Hello AI");

    expect(result).toBe("Hello!");
    expect(OpenRouterCtor).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: "test-key",
        httpReferer: "https://github.com/bodangren/ra-integrated-math-3",
        appTitle: "Integrated Math 3",
        retryConfig: { strategy: "none" },
        timeoutMs: 15000,
        serverURL: "https://openrouter.ai/api/v1",
      }),
    );
  });

  it("uses custom model when provided", async () => {
    legacySend.mockResolvedValueOnce(legacyTextResponse("Response"));

    const provider = createOpenRouterProvider({
      apiKey: "test-key",
      model: "openrouter/premium",
    });
    await provider("test");

    const request = legacySend.mock.calls[0][0] as { chatRequest: { model: unknown } };
    expect(request.chatRequest.model).toBe("openrouter/premium");
  });

  it("uses custom baseUrl when provided", async () => {
    legacySend.mockResolvedValueOnce(legacyTextResponse("Response"));

    const provider = createOpenRouterProvider({
      apiKey: "test-key",
      baseUrl: "https://custom.api/v1",
    });
    await provider("test");

    expect(OpenRouterCtor).toHaveBeenCalledWith(
      expect.objectContaining({ serverURL: "https://custom.api/v1" }),
    );
  });

  it("throws on non-ok response", async () => {
    legacySend.mockRejectedValue(Object.assign(new Error("Unauthorized"), { statusCode: 401 }));

    const provider = createOpenRouterProvider({ apiKey: "bad-key" });

    await expect(provider("test")).rejects.toThrow("OpenRouter API error: 401 Unauthorized");
  });

  it("retries on empty response content then throws", async () => {
    legacySend.mockResolvedValue(legacyTextResponse("   "));

    const provider = createOpenRouterProvider({ apiKey: "test-key" });

    await expect(provider("test")).rejects.toThrow("Empty response from AI provider");
    expect(legacySend.mock.calls.length).toBeGreaterThanOrEqual(1);
  });

  it("retries when no choices returned then throws", async () => {
    legacySend.mockResolvedValue({ ...legacyTextResponse(""), choices: [] });

    const provider = createOpenRouterProvider({ apiKey: "test-key" });

    await expect(provider("test")).rejects.toThrow("Empty response from AI provider");
    expect(legacySend.mock.calls.length).toBeGreaterThanOrEqual(1);
  });

  it("trims whitespace from response", async () => {
    legacySend.mockResolvedValueOnce(legacyTextResponse("  Hello world  "));

    const provider = createOpenRouterProvider({ apiKey: "test-key" });
    const result = await provider("test");

    expect(result).toBe("Hello world");
  });

  it("aborts on timeout", async () => {
    legacySend.mockImplementation(
      (_request: unknown, options: { signal?: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          options.signal?.addEventListener(
            "abort",
            () => reject(new DOMException("Aborted", "AbortError")),
            { once: true },
          );
        }),
    );

    const provider = createOpenRouterProvider({
      apiKey: "test-key",
      timeoutMs: 10,
    });

    await expect(provider("test")).rejects.toThrow();
  });

  it("accepts external AbortSignal", async () => {
    legacySend.mockResolvedValueOnce(legacyTextResponse("Response"));

    const provider = createOpenRouterProvider({ apiKey: "test-key" });
    const abortController = new AbortController();

    const result = await provider("test", abortController.signal);
    expect(result).toBe("Response");
  });

  it("aborts request when external AbortSignal is triggered", async () => {
    legacySend.mockImplementation(
      (_request: unknown, options: { signal?: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          options.signal?.addEventListener(
            "abort",
            () => reject(new DOMException("Aborted", "AbortError")),
            { once: true },
          );
        }),
    );

    const provider = createOpenRouterProvider({
      apiKey: "test-key",
      timeoutMs: 10000,
    });

    const abortController = new AbortController();
    setTimeout(() => abortController.abort(), 10);

    await expect(provider("test", abortController.signal)).rejects.toThrow();
  });
});

describe("SDK transport", () => {
  const mockSend = vi.fn();
  const MockOpenRouter = vi.mocked(OpenRouter);

  function sdkTextResponse(content: string, model = "vendor/model-a") {
    return {
      id: "gen-1",
      created: 1,
      model,
      choices: [{ message: { role: "assistant", content }, finishReason: "stop" }],
      usage: { promptTokens: 3, completionTokens: 2, totalTokens: 5 },
    };
  }

  function sdkStatusError(status: number, message: string) {
    return Object.assign(new Error(message), { statusCode: status });
  }

  function sentPayload(callArgs: unknown[]): { model?: unknown; messages?: unknown } {
    const first = (callArgs[0] ?? {}) as Record<string, unknown>;
    const nested = first["chatRequest"] as Record<string, unknown> | undefined;
    const payload = (nested ?? first) as Record<string, unknown>;
    return { model: payload["model"], messages: payload["messages"] };
  }

  beforeEach(() => {
    mockSend.mockReset();
    MockOpenRouter.mockReset();
    MockOpenRouter.mockImplementation(function () {
      return { chat: { send: mockSend } } as unknown as InstanceType<typeof OpenRouter>;
    });
  });

  it("sends model and one user message through the SDK and returns trimmed content", async () => {
    mockSend.mockResolvedValueOnce(sdkTextResponse("  trimmed  "));

    const provider = createOpenRouterProvider({ apiKey: "test-key", model: "vendor/model-a" });
    const result = await provider("hello");

    expect(result).toBe("trimmed");
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(sentPayload(mockSend.mock.calls[0]).model).toBe("vendor/model-a");
    expect(sentPayload(mockSend.mock.calls[0]).messages).toEqual([
      { role: "user", content: "hello" },
    ]);
  });

  it("passes the messages array to the SDK without change", async () => {
    mockSend.mockResolvedValueOnce(sdkTextResponse("ok"));
    const messages = [
      { role: "system", content: "Be brief." },
      { role: "user", content: "First." },
      { role: "assistant", content: "Answer." },
      { role: "user", content: "Second." },
    ] as const;

    const provider = createOpenRouterProviderWithMessages({
      apiKey: "test-key",
      model: "vendor/model-a",
    });
    await provider([...messages]);

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(sentPayload(mockSend.mock.calls[0]).messages).toEqual(messages);
  });

  it("retries once on an SDK 429 error and returns the success", async () => {
    mockSend
      .mockRejectedValueOnce(sdkStatusError(429, "rate limited"))
      .mockResolvedValueOnce(sdkTextResponse("recovered"));

    const provider = createOpenRouterProvider({ apiKey: "test-key", model: "vendor/model-a" });
    const result = await provider("hello");

    expect(result).toBe("recovered");
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it("does not retry an SDK 400 error and reports status 400", async () => {
    mockSend.mockRejectedValue(sdkStatusError(400, "bad request"));

    const provider = createOpenRouterProvider({ apiKey: "test-key", model: "vendor/model-a" });

    await expect(provider("hello")).rejects.toThrow(/^OpenRouter API error: 400/);
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("retries an SDK connection error as a network error", async () => {
    const connectionError = Object.assign(new Error("connection reset"), {
      name: "ConnectionError",
    });
    mockSend
      .mockRejectedValueOnce(connectionError)
      .mockResolvedValueOnce(sdkTextResponse("recovered"));

    const provider = createOpenRouterProvider({ apiKey: "test-key", model: "vendor/model-a" });
    const result = await provider("hello");

    expect(result).toBe("recovered");
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it("reports an external abort as AbortError without a retry", async () => {
    mockSend.mockRejectedValue(new DOMException("Aborted", "AbortError"));
    const controller = new AbortController();
    controller.abort();

    const provider = createOpenRouterProvider({ apiKey: "test-key", model: "vendor/model-a" });

    await expect(provider("hello", controller.signal)).rejects.toMatchObject({
      name: "AbortError",
    });
    expect(mockSend).toHaveBeenCalledTimes(1);
  });
});

describe("resolveOpenRouterProviderFromEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    clearProviderCache();
    process.env = { ...originalEnv };
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_MODEL;
    delete process.env.OPENROUTER_API_BASE;
  });

  afterEach(() => {
    process.env = originalEnv;
    clearProviderCache();
  });

  it("returns null when OPENROUTER_API_KEY is missing", () => {
    expect(resolveOpenRouterProviderFromEnv()).toBeNull();
  });

  it("returns null when OPENROUTER_API_KEY is empty string", () => {
    process.env.OPENROUTER_API_KEY = "   ";
    expect(resolveOpenRouterProviderFromEnv()).toBeNull();
  });

  it("returns a provider function when OPENROUTER_API_KEY is set", () => {
    process.env.OPENROUTER_API_KEY = "sk-test";
    const provider = resolveOpenRouterProviderFromEnv();
    expect(typeof provider).toBe("function");
  });

  it("caches the provider across multiple calls", () => {
    process.env.OPENROUTER_API_KEY = "sk-test";
    const first = resolveOpenRouterProviderFromEnv();
    const second = resolveOpenRouterProviderFromEnv();
    expect(first).toBe(second);
  });

  it("uses custom model from OPENROUTER_MODEL", async () => {
    process.env.OPENROUTER_API_KEY = "sk-test";
    process.env.OPENROUTER_MODEL = "openrouter/premium";

    legacySend.mockResolvedValueOnce(legacyTextResponse("OK"));

    const provider = resolveOpenRouterProviderFromEnv()!;
    await provider("test");

    const request = legacySend.mock.calls[0][0] as { chatRequest: { model: unknown } };
    expect(request.chatRequest.model).toBe("openrouter/premium");
  });

  it("uses custom base URL from OPENROUTER_API_BASE", async () => {
    process.env.OPENROUTER_API_KEY = "sk-test";
    process.env.OPENROUTER_API_BASE = "https://custom.openrouter.ai/api/v1";

    legacySend.mockResolvedValueOnce(legacyTextResponse("OK"));

    const provider = resolveOpenRouterProviderFromEnv()!;
    await provider("test");

    expect(OpenRouterCtor).toHaveBeenCalledWith(
      expect.objectContaining({ serverURL: "https://custom.openrouter.ai/api/v1" }),
    );
  });
});

describe("SDK status classification", () => {
  const statusSend = vi.fn();
  const StatusCtor = vi.mocked(OpenRouter);

  function statusError(status: number, message: string) {
    return Object.assign(new Error(message), { statusCode: status });
  }

  function textAnswer(content: string) {
    return {
      id: "gen-1",
      created: 1,
      model: "vendor/model-a",
      choices: [{ message: { role: "assistant", content } }],
    };
  }

  beforeEach(() => {
    statusSend.mockReset();
    StatusCtor.mockReset();
    StatusCtor.mockImplementation(function () {
      return { chat: { send: statusSend } } as unknown as InstanceType<typeof OpenRouter>;
    });
  });

  it("retries a 503 whose message text holds a 400 code", async () => {
    statusSend
      .mockRejectedValueOnce(statusError(503, "upstream error (400)"))
      .mockResolvedValueOnce(textAnswer("recovered"));

    const provider = createOpenRouterProvider({ apiKey: "test-key", model: "vendor/model-a" });
    await expect(provider("hello")).resolves.toBe("recovered");
    expect(statusSend).toHaveBeenCalledTimes(2);
  });

  it("rejects a 400 whose message text holds a 503 code after one attempt", async () => {
    statusSend.mockRejectedValue(statusError(400, "upstream error (503)"));

    const provider = createOpenRouterProvider({ apiKey: "test-key", model: "vendor/model-a" });
    await expect(provider("hello")).rejects.toThrow(
      /^OpenRouter API error: 400 upstream error \(503\)$/,
    );
    expect(statusSend).toHaveBeenCalledTimes(1);
  });
});

describe("API key redaction on SDK errors", () => {
  const redactSend = vi.fn();
  const RedactCtor = vi.mocked(OpenRouter);

  function withStatus(status: number, message: string) {
    return Object.assign(new Error(message), { statusCode: status });
  }

  beforeEach(() => {
    redactSend.mockReset();
    RedactCtor.mockReset();
    RedactCtor.mockImplementation(function () {
      return { chat: { send: redactSend } } as unknown as InstanceType<typeof OpenRouter>;
    });
  });

  it("redacts a padded key echoed by its trimmed form in an HTTP error", async () => {
    const key = "sk-padded-private-key-4242\n ";
    redactSend.mockRejectedValue(withStatus(400, `denied ${key.trim()} again`));
    const provider = createOpenRouterProvider({ apiKey: key, model: "vendor/model-a" });
    const error = await provider("hello").catch((caught: unknown) => caught as Error);
    expect(String(error)).not.toContain(key.trim());
  });

  it("redacts a Bearer-prefixed key echoed without the scheme", async () => {
    const key = "Bearer sk-bearer-private-key-5555";
    const token = key.slice("Bearer ".length);
    redactSend.mockRejectedValue(withStatus(401, `denied ${token}`));
    const provider = createOpenRouterProvider({ apiKey: key, model: "vendor/model-a" });
    const error = await provider("hello").catch((caught: unknown) => caught as Error);
    expect(String(error)).not.toContain(token);
  });

  it("redacts repeated key echoes on the connection path", async () => {
    const key = "sk-conn-private-key-6666";
    redactSend.mockRejectedValue(
      Object.assign(new Error(`fetch failed ${key} and ${key}`), { name: "ConnectionError" }),
    );
    const provider = createOpenRouterProvider({ apiKey: key, model: "vendor/model-a" });
    const error = (await provider("hello").catch((caught: unknown) => caught)) as Error;
    expect(error.message).toContain("fetch failed:");
    expect(String(error)).not.toContain(key);
  });

  it("redacts a string rejection", async () => {
    const key = "sk-string-private-key-7777";
    redactSend.mockRejectedValue(`upstream said ${key}`);
    const provider = createOpenRouterProvider({ apiKey: key, model: "vendor/model-a" });
    const error = await provider("hello").catch((caught: unknown) => caught as Error);
    expect(error).toBeInstanceOf(Error);
    expect(String(error)).not.toContain(key);
  });

  it("does not redact a short key into unrelated text", async () => {
    const key = "abc";
    redactSend.mockRejectedValue(withStatus(400, "abc is fine here"));
    const provider = createOpenRouterProvider({ apiKey: key, model: "vendor/model-a" });
    const error = await provider("hello").catch((caught: unknown) => caught as Error);
    expect(String(error)).toContain("abc is fine here");
  });
});
