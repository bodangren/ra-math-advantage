import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createOpenRouterProvider,
  createOpenRouterProviderWithMessages,
  EmptyResponseError,
  getErrorStatus,
} from "../providers";

// Keep the SDK real. Intercept only its network boundary.
const API_KEY = "sk-adversarial-private-key-7391";
const MODEL = "vendor/adversarial-model";
const mockFetch = vi.fn<typeof fetch>();

function answer(content: string | null = " recovered ", choices?: unknown[]) {
  return new Response(
    JSON.stringify({
      id: "adversarial-1",
      created: 1,
      model: MODEL,
      object: "chat.completion",
      system_fingerprint: null,
      choices: choices ?? [
        { index: 0, message: { role: "assistant", content }, finish_reason: "stop" },
      ],
      usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
    }),
    { headers: { "content-type": "application/json" } },
  );
}

function httpError(status: number, message = "upstream error (400)") {
  return new Response(JSON.stringify({ error: { code: status, message } }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function provider(timeoutMs = 15000) {
  return createOpenRouterProvider({ apiKey: API_KEY, model: MODEL, timeoutMs });
}

function abortableFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const signal = input instanceof Request ? input.signal : init?.signal;
  return new Promise((_resolve, reject) => {
    if (!signal) {
      reject(new Error("The SDK omitted the request signal"));
    } else if (signal.aborted) {
      reject(signal.reason);
    } else {
      signal.addEventListener("abort", () => reject(signal.reason), { once: true });
    }
  });
}

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal("fetch", mockFetch);
  vi.spyOn(Math, "random").mockReturnValue(0);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("adversarial real SDK transport", () => {
  it("preserves the request, headers, and messages through the real SDK", async () => {
    mockFetch.mockImplementation(async () => answer());
    const messages = [
      { role: "system" as const, content: "Teach briefly." },
      { role: "user" as const, content: "Explain 2 + 2." },
    ];
    const send = createOpenRouterProviderWithMessages({
      apiKey: API_KEY,
      model: MODEL,
      baseUrl: "https://adversarial.invalid/api/v1",
    });

    await expect(send(messages)).resolves.toBe("recovered");
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const request = mockFetch.mock.calls[0][0] as Request;
    expect(request.url).toBe("https://adversarial.invalid/api/v1/chat/completions");
    expect(request.method).toBe("POST");
    expect(request.headers.get("authorization")).toBe(`Bearer ${API_KEY}`);
    expect(request.headers.get("http-referer")).toBe(
      "https://github.com/bodangren/ra-integrated-math-3",
    );
    expect(request.headers.get("x-openrouter-title")).toBe("Integrated Math 3");
    expect(await request.json()).toEqual({ model: MODEL, messages, stream: false });
  });

  it.each([400, 401, 403, 404, 408, 422])(
    "rejects HTTP %i once despite retry terms in the response body",
    async (status) => {
      mockFetch.mockImplementation(async () => httpError(status, "fetch failed (503) network"));
      const error = await provider()("hello").catch((caught: unknown) => caught);
      expect(error).toBeInstanceOf(Error);
      expect(error).toMatchObject({ status });
      expect(getErrorStatus(error as Error)).toBe(status);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    },
  );

  it.each([429, 500, 503, 599])(
    "caps HTTP %i at three attempts without SDK retries",
    async (status) => {
      mockFetch.mockImplementation(async () => httpError(status));
      await expect(provider()("hello")).rejects.toMatchObject({ status });
      expect(mockFetch).toHaveBeenCalledTimes(3);
    },
  );

  it("recovers after two different transient HTTP failures", async () => {
    mockFetch
      .mockImplementationOnce(async () => httpError(429))
      .mockImplementationOnce(async () => httpError(503))
      .mockImplementationOnce(async () => answer());
    await expect(provider()("hello")).resolves.toBe("recovered");
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("caps real SDK connection failures at three attempts", async () => {
    mockFetch.mockRejectedValue(new TypeError("fetch failed"));
    await expect(provider()("hello")).rejects.toThrow(/^fetch failed:/);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it.each(["", " \n\t ", null])("retries empty content %j exactly twice", async (content) => {
    mockFetch.mockImplementation(async () => answer(content));
    await expect(provider()("hello")).rejects.toBeInstanceOf(EmptyResponseError);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("recovers after an empty choices array", async () => {
    mockFetch
      .mockImplementationOnce(async () => answer(null, []))
      .mockImplementationOnce(async () => answer());
    await expect(provider()("hello")).resolves.toBe("recovered");
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("aborts the real SDK request on timeout without a retry", async () => {
    mockFetch.mockImplementation(abortableFetch);
    await expect(provider(30)("hello")).rejects.toMatchObject({ name: "AbortError" });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("aborts an in-flight SDK request through the external signal", async () => {
    const controller = new AbortController();
    mockFetch.mockImplementation((input, init) => {
      const pending = abortableFetch(input, init);
      controller.abort();
      return pending;
    });
    await expect(provider()("hello", controller.signal)).rejects.toMatchObject({
      name: "AbortError",
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("isolates concurrent calls when only one external signal aborts", async () => {
    const controller = new AbortController();
    mockFetch.mockImplementationOnce(abortableFetch).mockImplementationOnce(async () => {
      controller.abort();
      return answer("second call");
    });
    const send = provider();
    const results = await Promise.allSettled([send("first", controller.signal), send("second")]);
    expect(results[0]).toMatchObject({ status: "rejected", reason: { name: "AbortError" } });
    expect(results[1]).toEqual({ status: "fulfilled", value: "second call" });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("keeps the API key out of mapped HTTP errors and serialized fields", async () => {
    mockFetch.mockImplementation(async () => httpError(400, `rejected credential ${API_KEY}`));
    const error = await provider()("hello").catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(Error);
    expect(Object.keys(error as Error)).toEqual(["status"]);
    expect(JSON.stringify(error)).not.toContain(API_KEY);
    expect(String(error)).not.toContain(API_KEY);
  });
});
