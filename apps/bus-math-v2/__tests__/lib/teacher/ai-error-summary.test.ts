import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const TEACHER_SUMMARY_SPECIFIER: string = "@/lib/teacher/ai-error-summary";

async function loadTeacherSummary(): Promise<any> {
  try {
    return await import(TEACHER_SUMMARY_SPECIFIER);
  } catch {
    return null;
  }
}

const ACCOUNTING_ENV = "OPENROUTER_MODEL_ACCOUNTING_EVAL";
const ACCOUNTING_MODEL = "vendor/accounting-model";
const API_KEY = "sk-test-teacher-summary-7718";

const SUMMARY_FIXTURE = {
  studentName: "Case Quaternion",
  lessonTitle: "Balancing the Ledger",
  activities: [
    {
      activityId: "activity-1",
      activityTitle: "Bank Reconciliation",
      mode: "independent_practice",
      totalParts: 3,
      correctParts: 2,
      incorrectParts: 1,
      correctnessRate: 2 / 3,
      misconceptionTags: [{ tag: "debit-credit-confusion", count: 2, partIds: ["q1", "q2"] }],
      hintsUsed: 1,
      revealStepsSeen: 0,
      editsMade: 2,
    },
  ],
  totalParts: 3,
  correctParts: 2,
  incorrectParts: 1,
  overallCorrectnessRate: 2 / 3,
  topMisconceptions: [{ tag: "debit-credit-confusion", count: 2, partIds: ["q1", "q2"] }],
  totalHintsUsed: 1,
  totalRevealsSeen: 0,
  totalEditsMade: 2,
  attemptNumber: 1,
  latestSubmittedAt: "2026-11-01T00:00:00.000Z",
};

const AI_ANSWER = {
  likelyMisunderstanding: "The learner confuses debits and credits.",
  evidenceObserved: ["q1 answered with the wrong side", "q2 repeated the error"],
  suggestedReteach: "Review T-account basics.",
  groundedIn: ["activity-1:q1", "activity-1:q2"],
};

function completion(content: string) {
  return {
    id: "gen-teacher-summary",
    created: 1,
    object: "chat.completion",
    system_fingerprint: null,
    model: "vendor/served-model",
    choices: [
      {
        index: 0,
        message: { role: "assistant", content },
        finish_reason: "stop",
      },
    ],
    usage: { prompt_tokens: 9, completion_tokens: 4, total_tokens: 13 },
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const fetchMock = vi.fn<typeof fetch>();

function loggedLines(spy: { mock: { calls: unknown[][] } }): string[] {
  return spy.mock.calls.map((call) => call.map((part) => String(part)).join(" "));
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("OPENROUTER_API_KEY", API_KEY);
  vi.stubEnv("OPENROUTER_API_BASE", "https://openrouter-fixture.invalid/api/v1");
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("teacher AI error summary", () => {
  it("case 11: the teacher prompt holds the lesson, correctness, misconception, scaffold, and activity lines", async () => {
    const teacher = await loadTeacherSummary();
    expect(teacher).not.toBeNull();

    const prompt: string = teacher.buildTeacherSummaryPrompt(SUMMARY_FIXTURE);

    expect(prompt).toContain("Lesson: Balancing the Ledger");
    expect(prompt).toContain("Overall performance: 67% correct (2/3 parts)");
    expect(prompt).toContain('"debit-credit-confusion" (2 occurrences across parts: q1, q2)');
    expect(prompt).toContain("Scaffold usage: 1 hints, 0 reveals, 2 edits");
    expect(prompt).toContain("Activity breakdown:");
    expect(prompt).toContain("  - Bank Reconciliation: 2/3 correct (67%)");
  });

  it("case 12: the teacher prompt says the student and names the four fields", async () => {
    const teacher = await loadTeacherSummary();
    expect(teacher).not.toBeNull();

    const prompt: string = teacher.buildTeacherSummaryPrompt(SUMMARY_FIXTURE);

    expect(prompt).toContain("the student");
    expect(prompt).toContain("likelyMisunderstanding");
    expect(prompt).toContain("evidenceObserved");
    expect(prompt).toContain("suggestedReteach");
    expect(prompt).toContain("groundedIn");
    expect(prompt).not.toContain("Student: Case Quaternion");
  });

  it("case 13: the generator sends the accounting model and the schema name, and returns a teacher summary", async () => {
    const teacher = await loadTeacherSummary();
    expect(teacher).not.toBeNull();
    vi.stubEnv(ACCOUNTING_ENV, ACCOUNTING_MODEL);
    fetchMock.mockResolvedValue(jsonResponse(completion(JSON.stringify(AI_ANSWER))));

    const generator = teacher.resolveTeacherAiSummaryGenerator();
    expect(generator).not.toBeNull();
    const result = await generator(SUMMARY_FIXTURE);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = (await (fetchMock.mock.calls[0][0] as Request).json()) as {
      model: string;
      messages: Array<{ role: string; content: string }>;
      response_format: { type: string; json_schema: { name: string; strict: boolean } };
    };
    expect(body.model).toBe(ACCOUNTING_MODEL);
    expect(body.response_format.json_schema.name).toBe("teacher_error_summary");
    expect(body.messages).toHaveLength(1);
    expect(body.messages[0].role).toBe("user");
    expect(result).toMatchObject({ type: "ai-assisted", ...AI_ANSWER });
    expect(typeof result.generatedAt).toBe("number");
  });

  it("case 14: a missing role variable makes the generator resolver return null and log the variable name", async () => {
    const teacher = await loadTeacherSummary();
    expect(teacher).not.toBeNull();
    delete process.env[ACCOUNTING_ENV];
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const generator = teacher.resolveTeacherAiSummaryGenerator();
      expect(generator).toBeNull();
      expect(loggedLines(errorSpy).join("\n")).toContain(ACCOUNTING_ENV);
    } finally {
      errorSpy.mockRestore();
    }
  });

  it("case 15: a typed failure makes the generator return null", async () => {
    const teacher = await loadTeacherSummary();
    expect(teacher).not.toBeNull();
    vi.stubEnv(ACCOUNTING_ENV, ACCOUNTING_MODEL);
    fetchMock.mockResolvedValue(jsonResponse(completion("definitely not json")));

    const generator = teacher.resolveTeacherAiSummaryGenerator();
    expect(generator).not.toBeNull();
    const result = await generator(SUMMARY_FIXTURE);

    expect(result).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("case 16: zero total parts makes the generator return null and send no request", async () => {
    const teacher = await loadTeacherSummary();
    expect(teacher).not.toBeNull();
    vi.stubEnv(ACCOUNTING_ENV, ACCOUNTING_MODEL);

    const generator = teacher.resolveTeacherAiSummaryGenerator();
    expect(generator).not.toBeNull();
    const result = await generator({ ...SUMMARY_FIXTURE, totalParts: 0 });

    expect(result).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("case 17: a student name with a name and an email stays out of the teacher prompt", async () => {
    const teacher = await loadTeacherSummary();
    expect(teacher).not.toBeNull();

    const prompt: string = teacher.buildTeacherSummaryPrompt({
      ...SUMMARY_FIXTURE,
      studentName: "Avery Quinn (avery.quinn@example.org)",
    });

    expect(prompt).not.toContain("Avery Quinn");
    expect(prompt).not.toContain("avery.quinn@example.org");
  });

  it("case 9 complement: the teacher summary schema is strict with four required fields", async () => {
    const teacher = await loadTeacherSummary();
    expect(teacher).not.toBeNull();

    const schema = teacher.teacherAiSummarySchema;
    expect(schema).toBeDefined();
    const { z } = await import("zod");
    const jsonSchema = z.toJSONSchema(schema) as {
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
