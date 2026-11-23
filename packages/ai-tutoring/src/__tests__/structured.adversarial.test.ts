import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { clearProviderCache, resolveOpenRouterProviderWithMessagesFromEnv } from "../providers";
import { resolveStructuredProviderFromEnv } from "../structured";

const KEY = "sk-test-s3-wire-fixture";
const SHEET_MODEL = "vendor/sheet";
const TEACHER_MODEL = "vendor/accounting";
const ENSURED_SCHEMA = z.strictObject({ score: z.number() });
const REQUEST = {
  schemaName: "adversarial_score",
  schema: ENSURED_SCHEMA,
  messages: [{ role: "user" as const, content: "Check the result." }],
};
const VALID = '{"score":21}';

function completion(content: string, model = SHEET_MODEL): Response {
  return Response.json({
    id: "gen-s3-adversarial",
    object: "chat.completion",
    created: 1,
    model,
    system_fingerprint: null,
    choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content } }],
    usage: { prompt_tokens: 7, completion_tokens: 3, total_tokens: 10 },
  });
}

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("OPENROUTER_API_BASE", "https://openrouter-fixture.invalid/api/v1");
  vi.stubEnv("OPENROUTER_DEBUG", undefined);
  vi.stubEnv("OPENROUTER_API_KEY", KEY);
  vi.stubEnv("OPENROUTER_MODEL_SPREADSHEET_EVAL", SHEET_MODEL);
  vi.stubEnv("OPENROUTER_MODEL_ACCOUNTING_EVAL", TEACHER_MODEL);
  clearProviderCache();
});

afterEach(() => {
  clearProviderCache();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function spreadsheetProvider() {
  const provider = resolveStructuredProviderFromEnv("spreadsheetEval");
  if (!provider) throw new Error("The configured spreadsheet provider must resolve");
  return provider;
}

describe("S3 adversarial wire", () => {
  it("ADV-S3-1 and ADV-S3-7: sends the exact strict schema and no other provider preferences", async () => {
    const bodies: unknown[] = [];
    fetchMock.mockImplementation(async (input, init) => {
      const request = new Request(input, init);
      bodies.push(await request.json());
      return completion(VALID);
    });
    await expect(spreadsheetProvider()(REQUEST)).resolves.toStrictEqual({
      ok: true,
      data: { score: 21 },
      raw: VALID,
    });
    expect(bodies).toStrictEqual([
      expect.objectContaining({
        model: SHEET_MODEL,
        messages: REQUEST.messages,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: REQUEST.schemaName,
            strict: true,
            schema: z.toJSONSchema(ENSURED_SCHEMA),
          },
        },
        provider: { require_parameters: true },
      }),
    ]);
  });

  it.each([
    ["not JSON", "invalid_json"],
    ['{"score":"21"}', "schema_mismatch"],
  ] as const)("ADV-S3-2: returns %s as %s", async (raw, reason) => {
    fetchMock.mockResolvedValueOnce(completion(raw));
    await expect(spreadsheetProvider()(REQUEST)).resolves.toStrictEqual({ ok: false, reason, raw });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("ADV-S3-2: retries a transport disconnect and returns the next valid answer", async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(completion(VALID));
    await expect(spreadsheetProvider()(REQUEST)).resolves.toStrictEqual({
      ok: true,
      data: { score: 21 },
      raw: VALID,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("ADV-S3-9: logs no model for a bare key but keeps a valid model suffix", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const modelWithSuffix = `${SHEET_MODEL}:free`;
    fetchMock
      .mockResolvedValueOnce(completion(VALID, KEY))
      .mockResolvedValueOnce(completion(VALID, modelWithSuffix));
    const provider = spreadsheetProvider();

    for (let call = 0; call < 2; call += 1) {
      await expect(provider(REQUEST)).resolves.toMatchObject({ ok: true, data: { score: 21 } });
    }
    const records = info.mock.calls.map(([, record]) => JSON.parse(String(record)));
    expect(records).toEqual([
      expect.objectContaining({ role: "spreadsheetEval", model: null }),
      expect.objectContaining({ role: "spreadsheetEval", model: modelWithSuffix }),
    ]);
  });

  it("ADV-S3-10: keeps warm multi-message providers separate under concurrent requests", async () => {
    const sent = new Map<string, string>();
    fetchMock.mockImplementation(async (input, init) => {
      const body = await new Request(input, init).json();
      sent.set(body.messages[0].content, body.model);
      return completion(body.model, body.model);
    });
    const sheet = resolveOpenRouterProviderWithMessagesFromEnv("spreadsheetEval");
    const teacher = resolveOpenRouterProviderWithMessagesFromEnv("accountingEval");
    if (!sheet || !teacher) throw new Error("Both configured roles must resolve");
    expect(resolveOpenRouterProviderWithMessagesFromEnv("accountingEval")).toBe(teacher);
    expect(resolveOpenRouterProviderWithMessagesFromEnv("spreadsheetEval")).toBe(sheet);

    await expect(
      Promise.all([
        teacher([{ role: "user", content: "Teacher fixture" }]),
        sheet([{ role: "user", content: "Sheet fixture" }]),
      ]),
    ).resolves.toEqual([TEACHER_MODEL, SHEET_MODEL]);
    expect(sent).toEqual(
      new Map([
        ["Teacher fixture", TEACHER_MODEL],
        ["Sheet fixture", SHEET_MODEL],
      ]),
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
