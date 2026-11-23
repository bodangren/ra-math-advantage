import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { z } from "zod";
import { generateAiFeedback, type AiFeedback } from "@/lib/ai/spreadsheet-feedback";
import * as feedbackModule from "@/lib/ai/spreadsheet-feedback";

const { mockResolveOpenRouterProviderFromEnv, mockResolveStructuredProviderFromEnv } = vi.hoisted(
  () => ({
    mockResolveOpenRouterProviderFromEnv: vi.fn(),
    mockResolveStructuredProviderFromEnv: vi.fn(),
  }),
);

vi.mock("@math-platform/ai-tutoring", () => ({
  resolveOpenRouterProviderFromEnv: mockResolveOpenRouterProviderFromEnv,
  resolveStructuredProviderFromEnv: mockResolveStructuredProviderFromEnv,
}));

describe("spreadsheet-feedback", () => {
  describe("generateAiFeedback", () => {
    const mockTargetCells = [
      { cell: "B2", expectedValue: 100 },
      { cell: "B3", expectedValue: 200 },
      { cell: "B4", expectedValue: 300 },
    ];

    const mockValidationResult = {
      isComplete: false,
      totalCells: 3,
      correctCells: 1,
      feedback: [
        { cell: "B2", isCorrect: true, expectedValue: 100, actualValue: 100 },
        { cell: "B3", isCorrect: false, expectedValue: 200, actualValue: 150 },
        { cell: "B4", isCorrect: false, expectedValue: 300, actualValue: 250 },
      ],
      timestamp: new Date().toISOString(),
    };

    const mockSpreadsheetData = [
      [{ value: "" }, { value: "Value" }],
      [{ value: "Item 1" }, { value: 100 }],
      [{ value: "Item 2" }, { value: 150 }],
      [{ value: "Item 3" }, { value: 250 }],
    ];

    const validFeedbackJson = JSON.stringify({
      preliminaryScore: 35,
      strengths: ["Got B2 correct", "Good effort"],
      improvements: ["Fix B3", "Fix B4"],
      nextSteps: ["Review formulas", "Double-check values"],
    });

    const validFeedbackData = {
      preliminaryScore: 35,
      strengths: ["Got B2 correct", "Good effort"],
      improvements: ["Fix B3", "Fix B4"],
      nextSteps: ["Review formulas", "Double-check values"],
    };

    function optionsWith(validationResult: typeof mockValidationResult) {
      return {
        spreadsheetData: mockSpreadsheetData,
        validationResult,
        targetCells: mockTargetCells,
      };
    }

    it("should return deterministic feedback when AI provider is not configured", async () => {
      mockResolveOpenRouterProviderFromEnv.mockReturnValue(null);
      mockResolveStructuredProviderFromEnv.mockReturnValue(null);

      const feedback: AiFeedback = await generateAiFeedback({
        spreadsheetData: mockSpreadsheetData,
        validationResult: mockValidationResult,
        targetCells: mockTargetCells,
        activityName: "Test Activity",
      });

      expect(feedback.preliminaryScore).toBe(13);
      expect(feedback.strengths).toEqual(["Completed the spreadsheet submission"]);
      expect(feedback.improvements).toEqual(["Review your work for possible errors"]);
      expect(feedback.nextSteps).toEqual(["Ask your teacher for feedback"]);
      expect(feedback.rawAiResponse).toContain("AI provider not configured");
    });

    it("should clamp preliminary score between 0 and 40", async () => {
      mockResolveOpenRouterProviderFromEnv.mockReturnValue(null);
      mockResolveStructuredProviderFromEnv.mockReturnValue(null);

      const allCorrectValidation = {
        ...mockValidationResult,
        correctCells: 3,
        feedback: mockValidationResult.feedback.map((f) => ({ ...f, isCorrect: true })),
      };

      const feedback: AiFeedback = await generateAiFeedback(optionsWith(allCorrectValidation));

      expect(feedback.preliminaryScore).toBe(40);
    });

    it("should use AI feedback when available", async () => {
      const mockProvider = vi.fn().mockResolvedValue(validFeedbackJson);
      const mockStructuredProvider = vi
        .fn()
        .mockResolvedValue({ ok: true, data: validFeedbackData, raw: validFeedbackJson });

      mockResolveOpenRouterProviderFromEnv.mockReturnValue(mockProvider);
      mockResolveStructuredProviderFromEnv.mockReturnValue(mockStructuredProvider);

      const feedback: AiFeedback = await generateAiFeedback(optionsWith(mockValidationResult));

      expect(mockResolveStructuredProviderFromEnv).toHaveBeenCalledWith("spreadsheetEval");
      expect(mockStructuredProvider).toHaveBeenCalled();
      expect(feedback.preliminaryScore).toBe(35);
      expect(feedback.strengths).toHaveLength(2);
      expect(feedback.improvements).toHaveLength(2);
      expect(feedback.nextSteps).toHaveLength(2);
    });

    it("should fall back to deterministic feedback on AI parse error", async () => {
      const mockProvider = vi.fn().mockResolvedValue("Not valid JSON");
      const mockStructuredProvider = vi
        .fn()
        .mockResolvedValue({ ok: false, reason: "invalid_json", raw: "Not valid JSON" });

      mockResolveOpenRouterProviderFromEnv.mockReturnValue(mockProvider);
      mockResolveStructuredProviderFromEnv.mockReturnValue(mockStructuredProvider);

      const feedback: AiFeedback = await generateAiFeedback(optionsWith(mockValidationResult));

      expect(feedback.preliminaryScore).toBe(13);
      expect(feedback.rawAiResponse).toBe("Not valid JSON");
    });

    it("should fall back to deterministic feedback when AI returns wrong types", async () => {
      const raw = JSON.stringify({
        preliminaryScore: "35",
        strengths: [1, 2],
        improvements: ["Fix B3"],
        nextSteps: ["Review"],
      });
      const mockProvider = vi.fn().mockResolvedValue(raw);
      const mockStructuredProvider = vi
        .fn()
        .mockResolvedValue({ ok: false, reason: "schema_mismatch", raw });

      mockResolveOpenRouterProviderFromEnv.mockReturnValue(mockProvider);
      mockResolveStructuredProviderFromEnv.mockReturnValue(mockStructuredProvider);

      const feedback: AiFeedback = await generateAiFeedback(optionsWith(mockValidationResult));

      expect(feedback.preliminaryScore).toBe(13);
      expect(feedback.rawAiResponse).toContain('"preliminaryScore":"35"');
    });

    it("should fall back to deterministic feedback when AI returns score out of range", async () => {
      const raw = JSON.stringify({
        preliminaryScore: 100,
        strengths: ["Good"],
        improvements: ["Fix"],
        nextSteps: ["Review"],
      });
      const mockProvider = vi.fn().mockResolvedValue(raw);
      const mockStructuredProvider = vi.fn().mockResolvedValue({
        ok: true,
        data: {
          preliminaryScore: 100,
          strengths: ["Good"],
          improvements: ["Fix"],
          nextSteps: ["Review"],
        },
        raw,
      });

      mockResolveOpenRouterProviderFromEnv.mockReturnValue(mockProvider);
      mockResolveStructuredProviderFromEnv.mockReturnValue(mockStructuredProvider);

      const feedback: AiFeedback = await generateAiFeedback(optionsWith(mockValidationResult));

      expect(feedback.preliminaryScore).toBe(40);
    });

    it.each(["request_failed", "empty_response", "aborted"] as const)(
      "edge case 10: a typed %s failure makes generateAiFeedback throw",
      async (reason) => {
        const mockProvider = vi.fn().mockResolvedValue(validFeedbackJson);
        const mockStructuredProvider = vi
          .fn()
          .mockResolvedValue({ ok: false, reason, raw: validFeedbackJson });

        mockResolveOpenRouterProviderFromEnv.mockReturnValue(mockProvider);
        mockResolveStructuredProviderFromEnv.mockReturnValue(mockStructuredProvider);

        await expect(generateAiFeedback(optionsWith(mockValidationResult))).rejects.toThrow();
      },
    );

    it("uses a strict response schema whose JSON Schema lists every field", () => {
      const schema = (feedbackModule as unknown as Record<string, unknown>)
        .AiFeedbackResponseSchema;
      expect(schema).toBeDefined();
      const jsonSchema = z.toJSONSchema(schema as z.ZodType) as {
        additionalProperties?: boolean;
        required?: string[];
      };
      expect(jsonSchema.additionalProperties).toBe(false);
      expect(jsonSchema.required).toEqual([
        "preliminaryScore",
        "strengths",
        "improvements",
        "nextSteps",
      ]);
    });

    describe("S3 adversarial wire", () => {
      const items = ["first", "second", "third", "fourth"];
      let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

      beforeEach(async () => {
        const actual = await vi.importActual<typeof import("@math-platform/ai-tutoring")>(
          "@math-platform/ai-tutoring",
        );
        mockResolveStructuredProviderFromEnv.mockImplementation(
          actual.resolveStructuredProviderFromEnv,
        );
        vi.stubEnv("OPENROUTER_API_KEY", "sk-test-s3-sheet-wire");
        vi.stubEnv("OPENROUTER_API_BASE", "https://openrouter-fixture.invalid/api/v1");
        vi.stubEnv("OPENROUTER_DEBUG", undefined);
        vi.stubEnv("OPENROUTER_MODEL_SPREADSHEET_EVAL", "vendor/sheet");
        fetchMock = vi.fn<typeof fetch>();
        vi.stubGlobal("fetch", fetchMock);
      });

      afterEach(() => {
        mockResolveStructuredProviderFromEnv.mockReset();
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
      });

      function returnAnswer(raw: string) {
        fetchMock.mockResolvedValueOnce(
          Response.json({
            id: "gen-sheet-s3",
            object: "chat.completion",
            created: 1,
            model: "vendor/sheet",
            system_fingerprint: null,
            choices: [
              { index: 0, finish_reason: "stop", message: { role: "assistant", content: raw } },
            ],
          }),
        );
      }

      it.each([
        [-1, 0],
        [41, 40],
      ])(
        "ADV-S3-6: clamps score %i to %i and keeps the first three items of each list",
        async (score, expectedScore) => {
          const raw = JSON.stringify({
            preliminaryScore: score,
            strengths: items,
            improvements: items,
            nextSteps: items,
          });
          returnAnswer(raw);
          const firstThree = ["first", "second", "third"];
          await expect(
            generateAiFeedback(optionsWith(mockValidationResult)),
          ).resolves.toStrictEqual({
            preliminaryScore: expectedScore,
            strengths: firstThree,
            improvements: firstThree,
            nextSteps: firstThree,
            rawAiResponse: raw,
          });
          expect(fetchMock).toHaveBeenCalledTimes(1);
        },
      );

      it("ADV-S3-6: rejects a non-string fourth item before trimming the list", async () => {
        const raw = JSON.stringify({
          preliminaryScore: 29,
          strengths: items,
          improvements: [...items.slice(0, 3), 4],
          nextSteps: items,
        });
        returnAnswer(raw);
        await expect(generateAiFeedback(optionsWith(mockValidationResult))).resolves.toStrictEqual({
          preliminaryScore: 13,
          strengths: ["Completed the spreadsheet submission"],
          improvements: ["Review your work for possible errors"],
          nextSteps: ["Ask your teacher for feedback"],
          rawAiResponse: raw,
        });
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });
    });
  });
});
