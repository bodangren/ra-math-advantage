import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRequireActiveRequestSessionClaims = vi.fn();
const mockRequireActiveStudentRequestClaims = vi.fn();
const mockFetchInternalQuery = vi.fn();
const mockFetchInternalMutation = vi.fn();
const mockValidateSpreadsheetData = vi.fn();
const mockValidateSubmission = vi.fn();
const mockResolveOpenRouterProviderFromEnv = vi.fn();
const mockResolveStructuredProviderFromEnv = vi.fn();
const mockStructuredProvider = vi.fn();

vi.mock("@/lib/auth/server", () => ({
  requireActiveRequestSessionClaims: mockRequireActiveRequestSessionClaims,
  requireActiveStudentRequestClaims: mockRequireActiveStudentRequestClaims,
}));

vi.mock("@/lib/convex/server", () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  fetchInternalMutation: mockFetchInternalMutation,
  internal: {
    activities: {
      getProfileByUserId: "internal.activities.getProfileByUserId",
      getActivityForValidation: "internal.activities.getActivityForValidation",
      submitSpreadsheet: "internal.activities.submitSpreadsheet",
      updateAttemptWithAiFeedback: "internal.activities.updateAttemptWithAiFeedback",
    },
  },
}));

vi.mock("@/lib/activities/spreadsheet-validation", () => ({
  validateSpreadsheetData: mockValidateSpreadsheetData,
  validateSubmission: mockValidateSubmission,
  getCellValue: (data: Array<Array<{ value?: string | number }>>, cellRef: string) => {
    const match = cellRef.match(/^([A-Z]+)([0-9]+)$/);
    if (!match) return "";

    const colLabel = match[1];
    const rowIndex = Number(match[2]) - 1;
    let colIndex = 0;
    for (const char of colLabel) {
      colIndex = colIndex * 26 + (char.charCodeAt(0) - 64);
    }
    colIndex -= 1;

    return data[rowIndex]?.[colIndex]?.value ?? "";
  },
}));

vi.mock("@math-platform/ai-tutoring", () => ({
  resolveOpenRouterProviderFromEnv: mockResolveOpenRouterProviderFromEnv,
  resolveStructuredProviderFromEnv: mockResolveStructuredProviderFromEnv,
}));

const { POST } =
  await import("../../../../../app/api/activities/spreadsheet/[activityId]/submit/route");

const NO_PII_VALUES = [
  "Avery Quinn",
  "Jordan Lee",
  "avery.quinn@example.org",
  "jordan.lee@example.org",
  "aquinn42",
  "k17pii0000account",
];

function buildPostRequest(body: unknown) {
  return new Request("http://localhost/api/activities/spreadsheet/activity_123/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Idempotency-Key": "no-pii-key-1" },
    body: JSON.stringify(body),
  });
}

describe("POST submit no-PII", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireActiveStudentRequestClaims.mockResolvedValue({
      sub: "k17pii0000account",
      username: "aquinn42",
      displayName: "Avery Quinn",
      email: "avery.quinn@example.org",
      role: "student",
      iat: 1,
      exp: 2,
    });
    mockValidateSpreadsheetData.mockReturnValue({ isValid: true });
    mockValidateSubmission.mockReturnValue({
      isComplete: true,
      totalCells: 1,
      correctCells: 1,
      feedback: [{ cell: "B2", isCorrect: true, expectedValue: 100, actualValue: 100 }],
    });
    mockFetchInternalQuery.mockImplementation(async (name: string) => {
      if (name === "internal.activities.getActivityForValidation") {
        return {
          componentKey: "spreadsheet-evaluator",
          displayName: "Test Sheet",
          props: {
            templateId: "template-1",
            instructions: "Fill the sheet",
            targetCells: [{ cell: "B2", expectedValue: 100 }],
          },
        };
      }
      return null;
    });
    mockFetchInternalMutation.mockImplementation(async (name: string) => {
      if (name === "internal.activities.submitSpreadsheet") {
        return { attemptId: "attempt-1", attemptNumber: 1 };
      }
      return {};
    });
    mockResolveOpenRouterProviderFromEnv.mockReturnValue(null);
    mockStructuredProvider.mockResolvedValue({
      ok: true,
      data: {
        preliminaryScore: 40,
        strengths: ["Good"],
        improvements: ["None"],
        nextSteps: ["Done"],
      },
      raw: "{}",
    });
    mockResolveStructuredProviderFromEnv.mockReturnValue(mockStructuredProvider);
  });

  it("captures a structured prompt with no fixture value", async () => {
    const response = await POST(buildPostRequest({ spreadsheetData: [[{ value: 100 }]] }), {
      params: Promise.resolve({ activityId: "activity_123" }),
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.aiFeedback).toBeTruthy();
    expect(mockStructuredProvider.mock.calls.length).toBeGreaterThan(0);
    const sent = JSON.stringify(mockStructuredProvider.mock.calls);
    for (const value of NO_PII_VALUES) {
      expect(sent).not.toContain(value);
    }
  });
});
