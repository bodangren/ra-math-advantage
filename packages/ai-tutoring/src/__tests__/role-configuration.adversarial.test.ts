import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearProviderCache,
  createOpenRouterProvider,
  EmptyResponseError,
  resolveOpenRouterProviderFromEnv,
  resolveOpenRouterProviderWithMessagesFromEnv,
} from "../providers";

const KEY = "sk-test-role-fixture-7391";
const TUTOR_MODEL = " \u2003vendor/tutor:exact\u00a0";
const SHEET_MODEL = "~vendor/sheet-latest";
const SERVED_MODEL = "vendor/served-model";
const PROMPT = "S2 prompt fixture 4917";
const ANSWER = "S2 answer fixture 9832";
const MESSAGES = [{ role: "user" as const, content: PROMPT }];
const TUTOR_ENV = "OPENROUTER_MODEL_STUDENT_TUTOR";
const SHEET_ENV = "OPENROUTER_MODEL_SPREADSHEET_EVAL";
const fetchMock = vi.fn<typeof fetch>();

function completion(content: string, model = SERVED_MODEL) {
  return {
    id: "gen-s2-fixture",
    created: 1,
    object: "chat.completion",
    system_fingerprint: null,
    model,
    choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }],
    usage: { prompt_tokens: 7, completion_tokens: 3, total_tokens: 10 },
  };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function provider(apiKey = KEY) {
  return createOpenRouterProvider({
    apiKey,
    model: "vendor/configured-model",
    role: "studentTutor",
    baseUrl: "https://openrouter-fixture.invalid/api/v1",
  });
}

function captureLogs() {
  const info = vi.spyOn(console, "info").mockImplementation(() => {});
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const debug = vi.spyOn(console, "debug").mockImplementation(() => {});
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  return {
    info,
    error,
    records: () =>
      info.mock.calls
        .filter(([label]) => label === "[ai-tutoring] request")
        .map(([, record]) => JSON.parse(String(record)) as unknown),
    text: () => JSON.stringify([info, error, warn, debug, log].map((spy) => spy.mock.calls)),
  };
}

beforeEach(() => {
  clearProviderCache();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("OPENROUTER_API_KEY", KEY);
  vi.stubEnv("OPENROUTER_API_BASE", "https://openrouter-fixture.invalid/api/v1");
  vi.stubEnv("OPENROUTER_DEBUG", undefined);
  vi.stubEnv(TUTOR_ENV, TUTOR_MODEL);
  vi.stubEnv(SHEET_ENV, SHEET_MODEL);
  vi.spyOn(Math, "random").mockReturnValue(0);
});

afterEach(() => {
  clearProviderCache();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("S2 role selection through the real SDK", () => {
  it("sends separate role models and preferences on concurrent requests", async () => {
    const logs = captureLogs();
    vi.stubEnv("OPENROUTER_MODEL", "vendor/old-global-model");
    fetchMock.mockImplementation(async () => json(completion(ANSWER)));

    const tutor = resolveOpenRouterProviderWithMessagesFromEnv("studentTutor");
    const sheet = resolveOpenRouterProviderWithMessagesFromEnv("spreadsheetEval");
    if (!tutor || !sheet) throw new Error("Both configured roles must resolve");
    await expect(Promise.all([tutor(MESSAGES), sheet(MESSAGES)])).resolves.toEqual([
      ANSWER,
      ANSWER,
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const bodies = await Promise.all(
      fetchMock.mock.calls.map(([request]) => (request as Request).json() as Promise<unknown>),
    );
    expect(bodies).toEqual(
      expect.arrayContaining([
        { model: TUTOR_MODEL, messages: MESSAGES, stream: false },
        {
          model: SHEET_MODEL,
          messages: MESSAGES,
          stream: false,
          provider: { require_parameters: true },
        },
      ]),
    );
    expect(logs.records()).toEqual(
      expect.arrayContaining(
        ["studentTutor", "spreadsheetEval"].map((role) => ({
          role,
          model: SERVED_MODEL,
          latencyMs: expect.any(Number),
          promptTokens: 7,
          completionTokens: 3,
          totalTokens: 10,
          outcome: "ok",
          status: null,
        })),
      ),
    );
    expect(logs.records()).toHaveLength(2);
    for (const value of [KEY, PROMPT, ANSWER]) expect(logs.text()).not.toContain(value);
  });

  it.each([
    [undefined, "missing"],
    ["\u2003\u00a0\u3000", "missing"],
    ["\u2003 @preset/tutor \u00a0", "preset"],
  ] as const)("rejects an invalid cold role value %j despite other models", (value, reason) => {
    const logs = captureLogs();
    vi.stubEnv(TUTOR_ENV, value);
    vi.stubEnv("OPENROUTER_MODEL", "vendor/old-global-model");
    expect(resolveOpenRouterProviderWithMessagesFromEnv("studentTutor")).toBeNull();
    expect(logs.error.mock.calls).toEqual([
      [
        "[ai-tutoring] AI role not configured",
        JSON.stringify({ role: "studentTutor", missing: TUTOR_ENV, reason }),
      ],
    ]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails closed when the tutor model is removed after the cache is warm", async () => {
    const logs = captureLogs();
    fetchMock.mockImplementation(async () => json(completion(ANSWER)));
    const tutor = resolveOpenRouterProviderWithMessagesFromEnv("studentTutor");
    if (!tutor) throw new Error("The configured tutor must resolve");
    await expect(tutor(MESSAGES)).resolves.toBe(ANSWER);

    vi.stubEnv(TUTOR_ENV, undefined);
    vi.stubEnv("OPENROUTER_MODEL", "vendor/old-global-model");
    const nextTutor = resolveOpenRouterProviderWithMessagesFromEnv("studentTutor");
    if (nextTutor) await nextTutor(MESSAGES);

    expect.soft(fetchMock).toHaveBeenCalledTimes(1);
    expect.soft(nextTutor).toBeNull();
    expect(logs.error.mock.calls).toEqual([
      [
        "[ai-tutoring] AI role not configured",
        JSON.stringify({ role: "studentTutor", missing: TUTOR_ENV, reason: "missing" }),
      ],
    ]);
  });

  it("fails closed when the API key is removed after the spreadsheet cache is warm", async () => {
    const logs = captureLogs();
    fetchMock.mockImplementation(async () => json(completion(ANSWER)));
    const sheet = resolveOpenRouterProviderFromEnv("spreadsheetEval");
    if (!sheet) throw new Error("The configured spreadsheet role must resolve");
    await expect(sheet(PROMPT)).resolves.toBe(ANSWER);

    vi.stubEnv("OPENROUTER_API_KEY", undefined);
    const nextSheet = resolveOpenRouterProviderFromEnv("spreadsheetEval");
    if (nextSheet) await nextSheet(PROMPT);

    expect.soft(fetchMock).toHaveBeenCalledTimes(1);
    expect.soft(nextSheet).toBeNull();
    expect(logs.error.mock.calls).toEqual([
      [
        "[ai-tutoring] AI role not configured",
        JSON.stringify({
          role: "spreadsheetEval",
          missing: "OPENROUTER_API_KEY",
          reason: "missing",
        }),
      ],
    ]);
  });
});

describe("S2 responses and logs through the real SDK", () => {
  it("returns the same trimmed answer for a strict 200 body and a documented-shape 200 body", async () => {
    captureLogs();
    const fullBody = completion(` \n${ANSWER}\t `);
    const documentedShape = {
      id: fullBody.id,
      model: fullBody.model,
      choices: [{ message: fullBody.choices[0].message, finish_reason: "stop" }],
      usage: fullBody.usage,
    };
    fetchMock.mockResolvedValueOnce(json(fullBody)).mockResolvedValueOnce(json(documentedShape));
    const send = provider();
    await expect(send(PROMPT)).resolves.toBe(ANSWER);
    await expect(send(PROMPT)).resolves.toBe(ANSWER);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("retries a 200 error body with usage and logs one final failure", async () => {
    const logs = captureLogs();
    fetchMock.mockImplementation(async () =>
      json({
        error: { code: 503, message: `${PROMPT} ${ANSWER} ${KEY}` },
        model: SERVED_MODEL,
        usage: { prompt_tokens: 7, completion_tokens: 0, total_tokens: 7 },
      }),
    );
    await expect(provider()(PROMPT)).rejects.toBeInstanceOf(EmptyResponseError);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(logs.records()).toEqual([
      expect.objectContaining({ role: "studentTutor", outcome: "error" }),
    ]);
    for (const value of [KEY, PROMPT, ANSWER]) expect(logs.text()).not.toContain(value);
  });

  it("does not log prompt, answer, or key values from unexpected served model metadata", async () => {
    const logs = captureLogs();
    fetchMock.mockResolvedValue(json(completion(ANSWER, `${PROMPT} ${ANSWER} ${KEY}`)));
    await expect(provider()(PROMPT)).resolves.toBe(ANSWER);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(logs.records()).toEqual([
      expect.objectContaining({ role: "studentTutor", outcome: "ok", totalTokens: 10 }),
    ]);
    for (const value of [KEY, PROMPT, ANSWER]) expect.soft(logs.text()).not.toContain(value);
  });

  it.each(["bEaReR \t  ", "BEARER\t", "  bearer   "])(
    "redacts repeated token echoes with the configured scheme %j",
    async (scheme) => {
      const logs = captureLogs();
      const token = "sk-test-bearer-fixture-4431";
      fetchMock.mockImplementation(async () =>
        json({ error: { code: 401, message: `Rejected ${token}; token ${token}` } }, 401),
      );
      const error: unknown = await provider(`${scheme}${token}  `)(PROMPT).catch(
        (caught: unknown) => caught,
      );
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(error).toMatchObject({ status: 401 });
      expect(String(error)).not.toContain(token);
      expect(JSON.stringify(error)).not.toContain(token);
      expect(logs.records()).toEqual([
        expect.objectContaining({ role: "studentTutor", outcome: "error", status: 401 }),
      ]);
      expect(logs.text()).not.toContain(token);
    },
  );
});

describe("S3 fix", () => {
  it("finding e N1: OPENROUTER_DEBUG logging never prints the auth header", async () => {
    const logs = captureLogs();
    const group = vi.spyOn(console, "group").mockImplementation(() => {});
    const groupEnd = vi.spyOn(console, "groupEnd").mockImplementation(() => {});
    try {
      vi.stubEnv("OPENROUTER_DEBUG", "1");
      fetchMock.mockImplementation(async () => json(completion(ANSWER)));
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
