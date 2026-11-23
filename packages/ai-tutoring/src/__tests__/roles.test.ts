import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { OpenRouter } from "@openrouter/sdk";
import { resolveOpenRouterProviderFromEnv, clearProviderCache } from "../providers";
import { AI_ROLES, buildProviderPreferences } from "../roles";

vi.mock("@openrouter/sdk", () => ({ OpenRouter: vi.fn() }));

const mockSend = vi.fn();
const MockOpenRouter = vi.mocked(OpenRouter);

type RoleResolver = (role: string) => unknown;

function resolveRole(role: string): unknown {
  return (resolveOpenRouterProviderFromEnv as unknown as RoleResolver)(role);
}

function roleTextResponse(content: string, model = "served-model-r2") {
  return {
    id: "gen-r2",
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

function loggedLines(spy: { mock: { calls: unknown[][] } }): string[] {
  return spy.mock.calls.map((call) => call.map((part) => String(part)).join(" "));
}

const ORIGINAL_ENV = process.env;
let infoSpy: ReturnType<typeof vi.spyOn>;
let errorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  mockSend.mockReset();
  MockOpenRouter.mockReset();
  MockOpenRouter.mockImplementation(function () {
    return { chat: { send: mockSend } } as unknown as InstanceType<typeof OpenRouter>;
  });
  clearProviderCache();
  process.env = { ...ORIGINAL_ENV };
  delete process.env.OPENROUTER_MODEL_STUDENT_TUTOR;
  delete process.env.OPENROUTER_MODEL_SPREADSHEET_EVAL;
  delete process.env.OPENROUTER_MODEL_ACCOUNTING_EVAL;
  delete process.env.OPENROUTER_MODEL;
  delete process.env.OPENROUTER_API_BASE;
  infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  process.env = ORIGINAL_ENV;
  clearProviderCache();
});

describe("role configuration", () => {
  it("case 1: the studentTutor provider sends the role variable value as the model", async () => {
    process.env.OPENROUTER_API_KEY = "sk-test";
    process.env.OPENROUTER_MODEL_STUDENT_TUTOR = "vendor/model-a";
    mockSend.mockResolvedValueOnce(roleTextResponse("hello"));

    const provider = resolveRole("studentTutor") as (prompt: string) => Promise<string>;
    expect(provider).not.toBeNull();
    await provider("hello");

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(sentChatRequest(mockSend.mock.calls[0]).model).toBe("vendor/model-a");
  });

  it("case 2: a tilde alias value reaches the request without change", async () => {
    process.env.OPENROUTER_API_KEY = "sk-test";
    process.env.OPENROUTER_MODEL_STUDENT_TUTOR = "~google/gemini-latest";
    mockSend.mockResolvedValueOnce(roleTextResponse("hello"));

    const provider = resolveRole("studentTutor") as (prompt: string) => Promise<string>;
    expect(provider).not.toBeNull();
    await provider("hello");

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(sentChatRequest(mockSend.mock.calls[0]).model).toBe("~google/gemini-latest");
  });

  it("case 3: a successful request logs one usage record with the served model and token counts", async () => {
    process.env.OPENROUTER_API_KEY = "sk-test";
    process.env.OPENROUTER_MODEL_STUDENT_TUTOR = "vendor/model-a";
    mockSend.mockResolvedValueOnce(roleTextResponse("hello", "served-model-r2"));

    const provider = resolveRole("studentTutor") as (prompt: string) => Promise<string>;
    await provider("hello");

    const records = loggedLines(infoSpy)
      .map((line) => {
        try {
          return JSON.parse(line.slice(line.indexOf("{"))) as Record<string, unknown>;
        } catch {
          return null;
        }
      })
      .filter((record) => record !== null);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      role: "studentTutor",
      model: "served-model-r2",
      promptTokens: 7,
      completionTokens: 5,
      totalTokens: 12,
      outcome: "ok",
    });
  });

  it("case 4: every AI role has sendsPii false", () => {
    expect(Object.keys(AI_ROLES).sort()).toEqual([
      "accountingEval",
      "spreadsheetEval",
      "studentTutor",
    ]);
    for (const role of Object.values(AI_ROLES)) {
      expect(role.sendsPii).toBe(false);
    }
  });

  it("case 5: buildProviderPreferences maps the four input pairs", () => {
    expect(buildProviderPreferences({ structured: false, sendsPii: false })).toBeUndefined();
    expect(buildProviderPreferences({ structured: true, sendsPii: false })).toEqual({
      requireParameters: true,
    });
    expect(buildProviderPreferences({ structured: false, sendsPii: true })).toEqual({
      zdr: true,
    });
    expect(buildProviderPreferences({ structured: true, sendsPii: true })).toEqual({
      requireParameters: true,
      zdr: true,
    });
  });

  it("case 6: a missing role variable returns null and logs the variable name", () => {
    process.env.OPENROUTER_API_KEY = "sk-test";

    const provider = resolveRole("studentTutor");

    expect(provider).toBeNull();
    expect(loggedLines(errorSpy).join("\n")).toContain("OPENROUTER_MODEL_STUDENT_TUTOR");
  });

  it("case 7: an empty or whitespace value returns null and logs the variable name", () => {
    process.env.OPENROUTER_API_KEY = "sk-test";
    process.env.OPENROUTER_MODEL_STUDENT_TUTOR = "   ";

    const provider = resolveRole("studentTutor");

    expect(provider).toBeNull();
    expect(loggedLines(errorSpy).join("\n")).toContain("OPENROUTER_MODEL_STUDENT_TUTOR");
  });

  it("case 8: a preset value returns null and logs reason preset", () => {
    process.env.OPENROUTER_API_KEY = "sk-test";
    process.env.OPENROUTER_MODEL_STUDENT_TUTOR = "@preset/tutor";

    const provider = resolveRole("studentTutor");

    expect(provider).toBeNull();
    const records = loggedLines(errorSpy)
      .map((line) => {
        try {
          return JSON.parse(line.slice(line.indexOf("{"))) as Record<string, unknown>;
        } catch {
          return null;
        }
      })
      .filter((record) => record !== null);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      role: "studentTutor",
      missing: "OPENROUTER_MODEL_STUDENT_TUTOR",
      reason: "preset",
    });
  });

  it("case 9: only the old OPENROUTER_MODEL set returns null", () => {
    process.env.OPENROUTER_API_KEY = "sk-test";
    process.env.OPENROUTER_MODEL = "vendor/model-a";

    const provider = resolveRole("studentTutor");

    expect(provider).toBeNull();
  });

  it("case 10: a missing API key returns null and logs the key name", () => {
    process.env.OPENROUTER_MODEL_STUDENT_TUTOR = "vendor/model-a";

    const provider = resolveRole("studentTutor");

    expect(provider).toBeNull();
    expect(loggedLines(errorSpy).join("\n")).toContain("OPENROUTER_API_KEY");
  });

  it("case 11: no log line holds prompt or answer markers, and a failed request logs outcome error with status", async () => {
    process.env.OPENROUTER_API_KEY = "sk-test";
    process.env.OPENROUTER_MODEL_STUDENT_TUTOR = "vendor/model-a";
    mockSend.mockResolvedValueOnce(roleTextResponse("ANSWER-MARKER-9 reply"));

    const provider = resolveRole("studentTutor") as (prompt: string) => Promise<string>;
    await provider("PROMPT-MARKER-7 question");

    const lines = [...loggedLines(infoSpy), ...loggedLines(errorSpy)];
    expect(lines.filter((line) => line.includes("PROMPT-MARKER-7"))).toHaveLength(0);
    expect(lines.filter((line) => line.includes("ANSWER-MARKER-9"))).toHaveLength(0);
    const records = lines
      .map((line) => {
        try {
          return JSON.parse(line.slice(line.indexOf("{"))) as Record<string, unknown>;
        } catch {
          return null;
        }
      })
      .filter((record) => record !== null);
    expect(records).toHaveLength(1);

    clearProviderCache();
    mockSend.mockRejectedValueOnce(
      Object.assign(new Error("Service unavailable"), { statusCode: 503 }),
    );
    await expect(provider("again")).rejects.toThrow();
    const errorRecords = [...loggedLines(infoSpy), ...loggedLines(errorSpy)]
      .map((line) => {
        try {
          return JSON.parse(line.slice(line.indexOf("{"))) as Record<string, unknown>;
        } catch {
          return null;
        }
      })
      .filter((record) => record !== null && record["outcome"] === "error");
    expect(errorRecords.length).toBeGreaterThanOrEqual(1);
    expect(errorRecords[0]).toMatchObject({ outcome: "error", status: 503 });
  });

  it("case 12: a studentTutor request sends contract-undefined preferences and no provider field", async () => {
    process.env.OPENROUTER_API_KEY = "sk-test";
    process.env.OPENROUTER_MODEL_STUDENT_TUTOR = "vendor/model-a";
    mockSend.mockResolvedValueOnce(roleTextResponse("hello"));

    expect(
      buildProviderPreferences({
        structured: AI_ROLES.studentTutor.structured,
        sendsPii: AI_ROLES.studentTutor.sendsPii,
      }),
    ).toBeUndefined();

    const provider = resolveRole("studentTutor") as (prompt: string) => Promise<string>;
    await provider("hello");

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect("provider" in sentChatRequest(mockSend.mock.calls[0])).toBe(false);
  });
});

describe("S3 fix", () => {
  it("finding b: a bare API key form as the served model gives model null", async () => {
    process.env.OPENROUTER_API_KEY = "sk-test";
    process.env.OPENROUTER_MODEL_STUDENT_TUTOR = "vendor/model-a";
    mockSend.mockResolvedValueOnce(roleTextResponse("hello", "sk-test-bare-key-9921"));

    const provider = resolveRole("studentTutor") as (prompt: string) => Promise<string>;
    await provider("hello");

    expect(mockSend).toHaveBeenCalledTimes(1);
    const records = loggedLines(infoSpy)
      .map((line) => {
        try {
          return JSON.parse(line.slice(line.indexOf("{"))) as Record<string, unknown>;
        } catch {
          return null;
        }
      })
      .filter((record) => record !== null);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ role: "studentTutor", outcome: "ok" });
    expect(records[0]).toMatchObject({ model: null });
  });

  it("finding b guard: the configured served model is still recorded", async () => {
    process.env.OPENROUTER_API_KEY = "sk-test";
    process.env.OPENROUTER_MODEL_STUDENT_TUTOR = "vendor/model-a";
    mockSend.mockResolvedValueOnce(roleTextResponse("hello", "vendor/model-a"));

    const provider = resolveRole("studentTutor") as (prompt: string) => Promise<string>;
    await provider("hello");

    const records = loggedLines(infoSpy)
      .map((line) => {
        try {
          return JSON.parse(line.slice(line.indexOf("{"))) as Record<string, unknown>;
        } catch {
          return null;
        }
      })
      .filter((record) => record !== null);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ role: "studentTutor", model: "vendor/model-a" });
  });

  it("finding c: the provider cache key holds no raw API key", () => {
    const source = readFileSync(new URL("../providers.ts", import.meta.url), "utf8");
    const cacheKeyLines = source.split("\n").filter((line) => line.includes("cacheKey"));
    expect(cacheKeyLines.length).toBeGreaterThan(0);
    expect(cacheKeyLines.join("\n")).not.toContain("apiKey");

    process.env.OPENROUTER_API_KEY = "sk-test-cache-check-4417";
    process.env.OPENROUTER_MODEL_STUDENT_TUTOR = "vendor/model-a";
    const first = resolveRole("studentTutor");
    expect(first).not.toBeNull();
    const second = resolveRole("studentTutor");
    expect(second).toBe(first);

    process.env.OPENROUTER_API_KEY = "sk-test-cache-check-4418";
    const rotated = resolveRole("studentTutor");
    expect(rotated).not.toBeNull();
    expect(rotated).not.toBe(first);
  });

  it("finding e N3: two roles resolve isolated cache entries", async () => {
    process.env.OPENROUTER_API_KEY = "sk-test";
    process.env.OPENROUTER_MODEL_STUDENT_TUTOR = "vendor/tutor-model";
    process.env.OPENROUTER_MODEL_SPREADSHEET_EVAL = "vendor/sheet-model";
    mockSend.mockResolvedValue(roleTextResponse("hello"));

    const tutor = resolveRole("studentTutor") as (prompt: string) => Promise<string>;
    const sheet = resolveRole("spreadsheetEval") as (prompt: string) => Promise<string>;
    expect(tutor).not.toBeNull();
    expect(sheet).not.toBeNull();
    expect(tutor).not.toBe(sheet);
    await tutor("question one");
    await sheet("question two");

    expect(mockSend).toHaveBeenCalledTimes(2);
    const models = mockSend.mock.calls.map((call) => sentChatRequest(call).model);
    expect(models).toEqual(["vendor/tutor-model", "vendor/sheet-model"]);
  });

  it("finding e N5: a padded preset value fails closed with reason preset", () => {
    process.env.OPENROUTER_API_KEY = "sk-test";
    process.env.OPENROUTER_MODEL_STUDENT_TUTOR = "  @preset/tutor  ";

    const provider = resolveRole("studentTutor");

    expect(provider).toBeNull();
    const records = loggedLines(errorSpy)
      .map((line) => {
        try {
          return JSON.parse(line.slice(line.indexOf("{"))) as Record<string, unknown>;
        } catch {
          return null;
        }
      })
      .filter((record) => record !== null);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      role: "studentTutor",
      missing: "OPENROUTER_MODEL_STUDENT_TUTOR",
      reason: "preset",
    });
  });
});
