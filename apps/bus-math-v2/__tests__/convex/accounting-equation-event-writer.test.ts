import { beforeEach, describe, expect, it, vi } from "vitest";

const { publicationReady } = vi.hoisted(() => ({ publicationReady: vi.fn(() => true) }));

vi.mock("@/lib/practice/accounting-equation-event-activities", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/practice/accounting-equation-event-activities")>()),
  isBm2AccountingEquationEventPublished: publicationReady,
}));

import {
  buildPracticeSubmissionEnvelope,
  type PracticeSubmissionEnvelope,
} from "@/lib/practice/contract";
import { accountingEquationEventDrafts } from "@/lib/practice/drafts/accounting-equation-event";
import {
  BM2_ACCOUNTING_EQUATION_EVENT_ACTIVITIES,
  BM2_ACCOUNTING_EQUATION_EVENT_COMPONENT_KEY,
  BM2_ACCOUNTING_EQUATION_EVENT_NODE_ID,
} from "@/lib/practice/accounting-equation-event-activities";

const STUDENT_ID = "profiles:event-student";
const ORGANIZATION_ID = "organizations:event-school";

type Row = Record<string, unknown> & { _id: string };
type WriterArgs = {
  userId: string;
  activityId: string;
  submissionData: PracticeSubmissionEnvelope;
  idempotencyKey: string;
};
type Writer = (ctx: unknown, args: WriterArgs) => Promise<Record<string, unknown>>;

async function loadWriter(): Promise<Writer> {
  const activitiesModule = await vi.importActual<Record<string, unknown>>("@/convex/activities");
  const mutation = activitiesModule.createAccountingEquationEventSubmission;
  if ((typeof mutation !== "object" && typeof mutation !== "function") || mutation === null) {
    throw new Error("BM2 must export createAccountingEquationEventSubmission.");
  }
  const handler = (mutation as { _handler?: unknown })._handler;
  if (typeof handler !== "function") {
    throw new Error("BM2 createAccountingEquationEventSubmission must expose a Convex handler.");
  }
  return handler as Writer;
}

function eventActivity(mode: "worked_example" | "guided_practice" | "independent_practice"): Row {
  const mapping = BM2_ACCOUNTING_EQUATION_EVENT_ACTIVITIES.find((item) => item.mode === mode)!;
  const draftKey =
    mode === "worked_example" ? "worked" : mode === "guided_practice" ? "guided" : "independent";
  return {
    _id: `activities:event-${draftKey}`,
    stableActivityId: mapping.stableActivityId,
    componentKey: BM2_ACCOUNTING_EQUATION_EVENT_COMPONENT_KEY,
    props: {
      ...structuredClone(accountingEquationEventDrafts[draftKey]),
      activityId: mapping.stableActivityId,
    },
    gradingConfig: { autoGrade: false },
    createdAt: 1,
    updatedAt: 1,
  };
}

function createHarness(options: { role?: string; active?: boolean } = {}) {
  const rows: Record<string, Row[]> = {
    profiles: [
      {
        _id: STUDENT_ID,
        organizationId: ORGANIZATION_ID,
        username: "event-student",
        role: options.role ?? "student",
      },
    ],
    auth_credentials: [
      {
        _id: "auth_credentials:event-student",
        profileId: STUDENT_ID,
        isActive: options.active ?? true,
      },
    ],
    activities: [
      eventActivity("worked_example"),
      eventActivity("guided_practice"),
      eventActivity("independent_practice"),
    ],
    activity_submissions: [],
    learning_evidence: [],
    srs_cards: [],
  };

  const selected = (table: string, conditions: ReadonlyMap<string, unknown>) =>
    (rows[table] ?? []).filter((row) =>
      [...conditions].every(([field, value]) => row[field] === value),
    );
  const ctx = {
    db: {
      get: async (id: string) =>
        Object.values(rows)
          .flat()
          .find((row) => row._id === id) ?? null,
      query: (table: string) => {
        const conditions = new Map<string, unknown>();
        const query = {
          eq(field: string, value: unknown) {
            conditions.set(field, value);
            return query;
          },
        };
        let descending = false;
        const result = {
          unique: async () => {
            const matches = selected(table, conditions);
            if (matches.length > 1) throw new Error(`Duplicate ${table} row`);
            return matches[0] ?? null;
          },
          first: async () => {
            const matches = selected(table, conditions);
            return (descending ? matches.at(-1) : matches[0]) ?? null;
          },
          collect: async () => selected(table, conditions),
          order: (direction: "asc" | "desc") => {
            descending = direction === "desc";
            return result;
          },
        };
        return {
          withIndex: (_name: string, configure: (value: typeof query) => unknown) => {
            configure(query);
            return result;
          },
        };
      },
      insert: async (table: string, document: Record<string, unknown>) => {
        const id = `${table}:${(rows[table] ?? []).length + 1}`;
        (rows[table] ??= []).push({ _id: id, ...document });
        return id;
      },
    },
  };
  return { ctx, rows };
}

function workedEnvelope(): PracticeSubmissionEnvelope {
  const activityId = BM2_ACCOUNTING_EQUATION_EVENT_ACTIVITIES[0].stableActivityId;
  return buildPracticeSubmissionEnvelope({
    activityId,
    mode: "worked_example",
    status: "submitted",
    attemptNumber: 91,
    submittedAt: "2026-09-07T01:00:00.000Z",
    answers: {},
    parts: [],
    artifact: { kind: "accounting-equation-event-acknowledgement" },
  });
}

function guidedEnvelope(): PracticeSubmissionEnvelope {
  const activityId = BM2_ACCOUNTING_EQUATION_EVENT_ACTIVITIES[1].stableActivityId;
  const answers = {
    "cash_purchase.account_categories": { cash: "Asset", equipment: "Asset" },
    "cash_purchase.account_effects": { cash: "decrease", equipment: "increase" },
    "cash_purchase.account_amounts": { cash: 2000, equipment: 2000 },
    "cash_purchase.ending_assets": 7000,
    "cash_purchase.ending_liabilities": 2000,
    "cash_purchase.ending_equity": 5000,
    "cash_purchase.equation_difference": 0,
    "credit_purchase.account_categories": { equipment: "Asset", payable: "Liability" },
    "credit_purchase.account_effects": { equipment: "increase", payable: "increase" },
    "credit_purchase.account_amounts": { equipment: 2000, payable: 2000 },
    "credit_purchase.ending_assets": 7000,
    "credit_purchase.ending_liabilities": 2000,
    "credit_purchase.ending_equity": 5000,
    "credit_purchase.equation_difference": 0,
    explanation: "The equal changes keep the accounting equation balanced.",
  };
  return buildPracticeSubmissionEnvelope({
    activityId,
    mode: "guided_practice",
    status: "submitted",
    attemptNumber: 88,
    submittedAt: "2026-09-07T01:01:00.000Z",
    answers,
    parts: Object.entries(answers).map(([partId, rawAnswer]) => ({
      partId,
      rawAnswer,
      ...(partId.startsWith("cash_purchase.") ? { hintsUsed: 1 } : {}),
    })),
    artifact: {
      kind: "accounting-equation-event-analysis",
      cases: ["cash_purchase", "credit_purchase"],
    },
  });
}

function independentEnvelope(endingAssets = 6000): PracticeSubmissionEnvelope {
  const activityId = BM2_ACCOUNTING_EQUATION_EVENT_ACTIVITIES[2].stableActivityId;
  const answers = {
    "owner_investment.account_categories": {
      cash: "Asset",
      owner_equity: "Equity",
      bank_loan: "Liability",
      equipment: "Asset",
    },
    "owner_investment.account_effects": {
      cash: "increase",
      owner_equity: "increase",
      bank_loan: "no-effect",
      equipment: "no-effect",
    },
    "owner_investment.account_amounts": {
      cash: 1000,
      owner_equity: 1000,
      bank_loan: 0,
      equipment: 0,
    },
    "owner_investment.ending_assets": endingAssets,
    "owner_investment.ending_liabilities": 1000,
    "owner_investment.ending_equity": 5000,
    "owner_investment.equation_difference": 0,
    explanation: "Cash and equity increase by the same amount.",
  };
  return buildPracticeSubmissionEnvelope({
    activityId,
    mode: "independent_practice",
    status: "submitted",
    attemptNumber: 73,
    submittedAt: "2026-09-07T01:02:00.000Z",
    answers,
    parts: Object.entries(answers).map(([partId, rawAnswer]) => ({ partId, rawAnswer })),
    artifact: { kind: "accounting-equation-event-analysis", cases: ["owner_investment"] },
  });
}

describe("BM2 accounting equation event writer contract", () => {
  beforeEach(() => publicationReady.mockReturnValue(true));

  it("keeps the new event mapping distinct and unavailable in the current catalog", async () => {
    const actual = await vi.importActual<
      typeof import("@/lib/practice/accounting-equation-event-activities")
    >("@/lib/practice/accounting-equation-event-activities");
    expect(actual.BM2_ACCOUNTING_EQUATION_EVENT_NODE_ID).toBe(
      BM2_ACCOUNTING_EQUATION_EVENT_NODE_ID,
    );
    expect(
      new Set(actual.BM2_ACCOUNTING_EQUATION_EVENT_ACTIVITIES.map((item) => item.stableActivityId))
        .size,
    ).toBe(3);
    expect(actual.BM2_ACCOUNTING_EQUATION_EVENT_ACTIVITIES.map((item) => item.mode)).toEqual([
      "worked_example",
      "guided_practice",
      "independent_practice",
    ]);
    expect(
      actual.BM2_ACCOUNTING_EQUATION_EVENT_ACTIVITIES.filter(
        (item) => item.canCreateApplicationEvidence,
      ).map((item) => item.mode),
    ).toEqual(["independent_practice"]);
    expect(actual.getBm2AccountingEquationEventActivity("unknown-event")).toBeNull();
    expect(actual.isBm2AccountingEquationEventPublished()).toBe(false);
  });

  it("stores a Worked acknowledgement without grade or mastery fields", async () => {
    const writer = await loadWriter();
    const { ctx, rows } = createHarness();
    const result = await writer(ctx, {
      userId: STUDENT_ID,
      activityId: workedEnvelope().activityId,
      submissionData: workedEnvelope(),
      idempotencyKey: "event-worked-ack",
    });
    expect(result).toMatchObject({ acknowledged: true, attemptOrdinal: 1 });
    expect(rows.activity_submissions).toHaveLength(1);
    expect(rows.activity_submissions[0]).not.toHaveProperty("score");
    expect(rows.activity_submissions[0]).not.toHaveProperty("maxScore");
    expect(rows.activity_submissions[0]).not.toHaveProperty("gradedAt");
    expect(rows.activity_submissions[0]).not.toHaveProperty("masteryContractVersion");
    expect(rows.learning_evidence).toEqual([]);
    expect(rows.srs_cards).toEqual([]);
  });

  it("grades Guided raw answers on the server and preserves case assistance", async () => {
    const writer = await loadWriter();
    const { ctx, rows } = createHarness();
    const result = await writer(ctx, {
      userId: STUDENT_ID,
      activityId: guidedEnvelope().activityId,
      submissionData: guidedEnvelope(),
      idempotencyKey: "event-guided-grade",
    });
    expect(result).toMatchObject({
      score: 20,
      maxScore: 20,
      hintsUsed: 1,
      manualReviewRequired: true,
    });
    expect(rows.activity_submissions[0]).toMatchObject({ score: 20, maxScore: 20 });
    const stored = rows.activity_submissions[0].submissionData as PracticeSubmissionEnvelope;
    expect(stored.attemptNumber).toBe(1);
    expect(
      stored.parts.find((part) => part.partId === "cash_purchase.account_categories"),
    ).toMatchObject({ hintsUsed: 1, score: 2, maxScore: 2, isCorrect: true });
    expect(stored.parts.find((part) => part.partId === "explanation")).toMatchObject({
      rawAnswer: expect.any(String),
    });
  });

  it("requires teacher review for Independent work and creates no mastery effect", async () => {
    const writer = await loadWriter();
    const { ctx, rows } = createHarness();
    const result = await writer(ctx, {
      userId: STUDENT_ID,
      activityId: independentEnvelope().activityId,
      submissionData: independentEnvelope(),
      idempotencyKey: "event-independent-grade",
    });
    expect(result).toMatchObject({ score: 16, maxScore: 16, manualReviewRequired: true });
    expect(rows.activity_submissions).toHaveLength(1);
    expect(rows.activity_submissions[0]).not.toHaveProperty("gradedBy");
    expect(rows.learning_evidence).toEqual([]);
    expect(rows.srs_cards).toEqual([]);
  });

  it("replays an identical request and rejects changed content with the same key", async () => {
    const writer = await loadWriter();
    const { ctx, rows } = createHarness();
    const args = {
      userId: STUDENT_ID,
      activityId: independentEnvelope().activityId,
      submissionData: independentEnvelope(),
      idempotencyKey: "event-independent-replay",
    };
    const first = await writer(ctx, args);
    expect(await writer(ctx, args)).toEqual(first);
    expect(rows.activity_submissions).toHaveLength(1);
    await expect(
      writer(ctx, { ...args, submissionData: independentEnvelope(5999) }),
    ).rejects.toThrow("idempotency_conflict");
    expect(rows.activity_submissions).toHaveLength(1);
  });

  it("replays reordered Guided parts with telemetry and rejects changed assistance", async () => {
    const writer = await loadWriter();
    const { ctx, rows } = createHarness();
    const firstEnvelope = guidedEnvelope();
    firstEnvelope.parts = firstEnvelope.parts.map((part) => ({
      ...part,
      revealStepsSeen: 0,
      changedCount: 1,
    }));
    const args = {
      userId: STUDENT_ID,
      activityId: firstEnvelope.activityId,
      submissionData: firstEnvelope,
      idempotencyKey: "event-guided-telemetry-replay",
    };
    const first = await writer(ctx, args);
    const reordered = structuredClone(firstEnvelope);
    reordered.parts.reverse();
    expect(await writer(ctx, { ...args, submissionData: reordered })).toEqual(first);
    expect(rows.activity_submissions).toHaveLength(1);
    const changedHints = structuredClone(firstEnvelope);
    changedHints.parts[0].hintsUsed = 2;
    await expect(writer(ctx, { ...args, submissionData: changedHints })).rejects.toThrow(
      "idempotency_conflict",
    );
    expect(rows.activity_submissions).toHaveLength(1);
  });

  it("fails before persistence when current event publication is unavailable", async () => {
    publicationReady.mockReturnValue(false);
    const writer = await loadWriter();
    const { ctx, rows } = createHarness();
    await expect(
      writer(ctx, {
        userId: STUDENT_ID,
        activityId: independentEnvelope().activityId,
        submissionData: independentEnvelope(),
        idempotencyKey: "event-unpublished",
      }),
    ).rejects.toThrow(/not published/i);
    expect(rows.activity_submissions).toEqual([]);
  });

  it.each([
    ["the stored component key", () => ({ componentKey: "classification" })],
    ["the stored mode", () => ({ props: { mode: "guided_practice" } })],
    [
      "changed stored source content",
      () => ({
        props: {
          ...structuredClone(accountingEquationEventDrafts.independent),
          activityId: independentEnvelope().activityId,
          cases: [
            {
              ...structuredClone(accountingEquationEventDrafts.independent.cases[0]),
              eventAmount: 9000,
            },
          ],
        },
      }),
    ],
  ])("rejects a mismatch in %s", async (_label, replacement) => {
    const writer = await loadWriter();
    const { ctx, rows } = createHarness();
    const stored = rows.activities.find(
      (row) => row.stableActivityId === independentEnvelope().activityId,
    )!;
    Object.assign(stored, replacement());
    await expect(
      writer(ctx, {
        userId: STUDENT_ID,
        activityId: independentEnvelope().activityId,
        submissionData: independentEnvelope(),
        idempotencyKey: `event-identity-${_label}`,
      }),
    ).rejects.toThrow(/activity|component|mode|metadata/i);
    expect(rows.activity_submissions).toEqual([]);
  });

  it.each([
    ["a nonstudent profile", { role: "teacher", active: true }],
    ["an inactive credential", { role: "student", active: false }],
  ])("rejects %s before persistence", async (_label, options) => {
    const writer = await loadWriter();
    const { ctx, rows } = createHarness(options);
    await expect(
      writer(ctx, {
        userId: STUDENT_ID,
        activityId: independentEnvelope().activityId,
        submissionData: independentEnvelope(),
        idempotencyKey: `event-auth-${_label}`,
      }),
    ).rejects.toThrow(/student|active|auth/i);
    expect(rows.activity_submissions).toEqual([]);
  });
});
