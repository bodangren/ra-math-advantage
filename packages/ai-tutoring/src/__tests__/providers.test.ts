import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createOpenRouterProvider,
  createOpenRouterProviderWithMessages,
  resolveOpenRouterProviderFromEnv,
  clearProviderCache,
} from "../providers";
import { OpenRouter } from "@openrouter/sdk";

vi.mock("@openrouter/sdk", () => ({ OpenRouter: vi.fn() }));

const mockFetch = vi.fn();

vi.stubGlobal("fetch", mockFetch);

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
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Hello!" } }],
      }),
    });

    const provider = createOpenRouterProvider({ apiKey: "test-key" });
    const result = await provider("Hello AI");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer test-key",
        }),
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [{ role: "user", content: "Hello AI" }],
        }),
      }),
    );
    expect(result).toBe("Hello!");
  });

  it("uses custom model when provided", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Response" } }],
      }),
    });

    const provider = createOpenRouterProvider({
      apiKey: "test-key",
      model: "openrouter/premium",
    });
    await provider("test");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/chat/completions",
      expect.objectContaining({
        body: JSON.stringify({
          model: "openrouter/premium",
          messages: [{ role: "user", content: "test" }],
        }),
      }),
    );
  });

  it("uses custom baseUrl when provided", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Response" } }],
      }),
    });

    const provider = createOpenRouterProvider({
      apiKey: "test-key",
      baseUrl: "https://custom.api/v1",
    });
    await provider("test");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://custom.api/v1/chat/completions",
      expect.any(Object),
    );
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    });

    const provider = createOpenRouterProvider({ apiKey: "bad-key" });

    await expect(provider("test")).rejects.toThrow("OpenRouter API error: 401 Unauthorized");
  });

  it("retries on empty response content then throws", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "   " } }],
      }),
    });

    const provider = createOpenRouterProvider({ apiKey: "test-key" });

    await expect(provider("test")).rejects.toThrow("Empty response from AI provider");
    expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(1);
  });

  it("retries when no choices returned then throws", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [] }),
    });

    const provider = createOpenRouterProvider({ apiKey: "test-key" });

    await expect(provider("test")).rejects.toThrow("Empty response from AI provider");
    expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(1);
  });

  it("trims whitespace from response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "  Hello world  " } }],
      }),
    });

    const provider = createOpenRouterProvider({ apiKey: "test-key" });
    const result = await provider("test");

    expect(result).toBe("Hello world");
  });

  it("aborts on timeout", async () => {
    let abortFn: () => void = () => {};
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          abortFn = reject.bind(null, new DOMException("Aborted", "AbortError"));
          setTimeout(abortFn, 100);
        }),
    );

    const provider = createOpenRouterProvider({
      apiKey: "test-key",
      timeoutMs: 10,
    });

    await expect(provider("test")).rejects.toThrow();
  });

  it("accepts external AbortSignal", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Response" } }],
      }),
    });

    const provider = createOpenRouterProvider({ apiKey: "test-key" });
    const abortController = new AbortController();

    const result = await provider("test", abortController.signal);
    expect(result).toBe("Response");
  });

  it("aborts request when external AbortSignal is triggered", async () => {
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new DOMException("Aborted", "AbortError")), 100);
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
    MockOpenRouter.mockReturnValue({
      chat: { send: mockSend },
    } as unknown as InstanceType<typeof OpenRouter>);
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
    mockSend.mockRejectedValueOnce(connectionError).mockResolvedValueOnce(
      sdkTextResponse("recovered"),
    );

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

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "OK" } }],
      }),
    });

    const provider = resolveOpenRouterProviderFromEnv()!;
    await provider("test");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/chat/completions",
      expect.objectContaining({
        body: JSON.stringify({
          model: "openrouter/premium",
          messages: [{ role: "user", content: "test" }],
        }),
      }),
    );
  });

  it("uses custom base URL from OPENROUTER_API_BASE", async () => {
    process.env.OPENROUTER_API_KEY = "sk-test";
    process.env.OPENROUTER_API_BASE = "https://custom.openrouter.ai/api/v1";

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "OK" } }],
      }),
    });

    const provider = resolveOpenRouterProviderFromEnv()!;
    await provider("test");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://custom.openrouter.ai/api/v1/chat/completions",
      expect.any(Object),
    );
  });
});
