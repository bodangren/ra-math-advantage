import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearProviderCache, resolveOpenRouterProviderWithMessagesFromEnv } from "../providers";
import { resolveStructuredProviderFromEnv } from "../structured";
import { z } from "zod";

const KEY = "sk-test-debug-fixture-6642";
const TUTOR_ENV = "OPENROUTER_MODEL_STUDENT_TUTOR";
const PROMPT = "S3 debug prompt fixture 2214";
const ANSWER = "S3 debug answer fixture 8871";
const MESSAGES = [{ role: "user" as const, content: PROMPT }];
const fetchMock = vi.fn<typeof fetch>();

function completion(content: string) {
  return {
    id: "gen-s3-debug",
    created: 1,
    object: "chat.completion",
    system_fingerprint: null,
    model: "vendor/served-model",
    choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }],
    usage: { prompt_tokens: 7, completion_tokens: 3, total_tokens: 10 },
  };
}

function captureLogs() {
  const info = vi.spyOn(console, "info").mockImplementation(() => {});
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const debug = vi.spyOn(console, "debug").mockImplementation(() => {});
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  return {
    text: () => JSON.stringify([info, error, warn, debug, log].map((spy) => spy.mock.calls)),
  };
}

beforeEach(() => {
  clearProviderCache();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("OPENROUTER_API_KEY", KEY);
  vi.stubEnv("OPENROUTER_API_BASE", "https://openrouter-fixture.invalid/api/v1");
  vi.stubEnv(TUTOR_ENV, "vendor/debug-tutor-model");
  vi.stubEnv("OPENROUTER_DEBUG", "1");
});

afterEach(() => {
  clearProviderCache();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("S3 fix", () => {
  it("finding e N1: OPENROUTER_DEBUG logging never prints the auth header", async () => {
    const logs = captureLogs();
    const group = vi.spyOn(console, "group").mockImplementation(() => {});
    const groupEnd = vi.spyOn(console, "groupEnd").mockImplementation(() => {});
    try {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify(completion(ANSWER)), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
      const tutor = resolveOpenRouterProviderWithMessagesFromEnv("studentTutor");
      if (!tutor) throw new Error("The configured tutor must resolve");
      await expect(tutor(MESSAGES)).resolves.toBe(ANSWER);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(logs.text()).not.toContain(KEY);
    } finally {
      group.mockRestore();
      groupEnd.mockRestore();
    }
  });
});

describe("S3 adversarial", () => {
  // Expected red at b0bb87d4. Do not mask the gate failure.
  it("ADV-S3-8: structured SDK debug output omits the key, prompt, and answer", async () => {
    vi.stubEnv("OPENROUTER_MODEL_ACCOUNTING_EVAL", "vendor/accounting-model");
    const logs = captureLogs();
    vi.spyOn(console, "group").mockImplementation(() => {});
    vi.spyOn(console, "groupEnd").mockImplementation(() => {});
    const data = { note: ANSWER };
    const raw = JSON.stringify(data);
    fetchMock.mockImplementation(async (input, init) => {
      const request = new Request(input, init);
      expect(request.headers.get("authorization")).toBe(`Bearer ${KEY}`);
      return Response.json(completion(raw));
    });
    const provider = resolveStructuredProviderFromEnv("accountingEval");
    if (!provider) throw new Error("The configured structured provider must resolve");

    await expect(
      provider({
        schemaName: "debug_note",
        schema: z.strictObject({ note: z.string() }),
        messages: MESSAGES,
      }),
    ).resolves.toStrictEqual({ ok: true, data, raw });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const output = logs.text();
    expect({
      key: output.includes(KEY),
      prompt: output.includes(PROMPT),
      answer: output.includes(ANSWER),
    }).toStrictEqual({ key: false, prompt: false, answer: false });
  });
});
