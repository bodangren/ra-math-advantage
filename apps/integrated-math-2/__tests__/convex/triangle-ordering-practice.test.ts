import { describe, expect, it } from "vitest";
import {
  getTrianglePracticeHandler,
  submitBoundedPracticeHandler,
  submitTriangleHandler,
} from "@/convex/activities";
import { triangleNodeIds } from "@/lib/practice/triangle-ordering";
import { database } from "../helpers/database";

const approved = {
  nodes: Object.values(triangleNodeIds).map((id) => ({
    id,
    kind: "skill",
    reviewStatus: "approved",
  })),
  blueprints: Object.values(triangleNodeIds).map((nodeId) => ({
    nodeId,
    reviewStatus: "approved",
  })),
};
const ready = {
  nodes: Object.values(triangleNodeIds).map((id) => ({
    id,
    kind: "skill",
    reviewStatus: "approved",
    independentPracticeReady: true,
  })),
  blueprints: Object.values(triangleNodeIds).map((nodeId) => ({
    nodeId,
    reviewStatus: "approved",
    metadata: { independentPracticeReady: true },
  })),
};
async function setup(
  node: string = triangleNodeIds.sides,
  mode = "guided_practice",
  seed = 9,
) {
  const store = database();
  const userId = await store.db.insert("profiles", {
    role: "student",
    organizationId: "org",
    username: "student",
  });
  await store.db.insert("auth_credentials", {
    profileId: userId,
    role: "student",
    organizationId: "org",
    username: "student",
    isActive: true,
  });
  await store.db.insert("lessons", { slug: "module-1-lesson-4" });
  let activityId = "";
  for (const [candidateNode, modes] of [
    [
      triangleNodeIds.angles,
      [
        ["worked_example", 6],
        ["guided_practice", 8],
        ["independent_practice", 11],
      ],
    ],
    [
      triangleNodeIds.sides,
      [
        ["worked_example", 7],
        ["guided_practice", 9],
        ["independent_practice", 10],
      ],
    ],
  ] as const) {
    for (const [candidateMode, candidateSeed] of modes) {
      const id = await store.db.insert("activities", {
        stableActivityId: `${candidateNode}.${candidateMode}`,
        masteryNodeId: candidateNode,
        learningEvidenceMode: candidateMode,
        componentKey: "im2-question",
        generatorSeed: candidateSeed,
        generatorDifficulty: 1,
        approval: { status: "approved" },
      });
      if (
        candidateNode === node &&
        candidateMode === mode &&
        candidateSeed === seed
      )
        activityId = id;
    }
  }
  return { ...store, userId, activityId };
}
describe("triangle staged submissions", () => {
  it.each([
    [triangleNodeIds.angles, 8],
    [triangleNodeIds.sides, undefined],
  ] as const)("omits the %s Worked item after reload and reuses one physical row", async (nodeId, firstProblem) => {
    const t = await setup();
    expect(await getTrianglePracticeHandler(t.ctx, t.userId as never, approved)).toHaveLength(6);
    const worked = t.tables.activities.find(
      (row) => row.stableActivityId === `${nodeId}.worked_example`,
    )!;
    const args = {
      userId: t.userId,
      activityId: worked._id,
      idempotencyKey: "worked-one",
      answers: {},
      hintsUsed: 0,
      revealStepsSeen: 0,
    };
    const first = await submitBoundedPracticeHandler(t.ctx, args as never, approved);
    expect(first).toMatchObject({ kind: "acknowledged" });
    expect(t.tables.activity_submissions).toHaveLength(1);
    const resumed = await getTrianglePracticeHandler(t.ctx, t.userId as never, approved);
    expect(resumed).toHaveLength(5);
    expect(resumed.some((item) => item.activityId === worked._id)).toBe(false);
    if (firstProblem) expect(resumed[0]).toMatchObject({ mode: "guided_practice", problem: firstProblem });
    const lesson = t.tables.lessons.find((row) => row.slug === "module-1-lesson-4")!;
    expect(t.tables.activity_submissions[0].lessonId).toBe(lesson._id);
    expect(await submitBoundedPracticeHandler(t.ctx, args as never, approved)).toEqual(first);
    const differentKey = await submitBoundedPracticeHandler(
      t.ctx,
      { ...args, idempotencyKey: "worked-two" } as never,
      approved,
    );
    expect(differentKey).toEqual(first);
    expect(t.tables.activity_submissions).toHaveLength(1);
  });

  it("fails closed for malformed Worked history and changed replay counters", async () => {
    const t = await setup();
    const worked = t.tables.activities.find(
      (row) => row.stableActivityId === `${triangleNodeIds.sides}.worked_example`,
    )!;
    const args = { userId: t.userId, activityId: worked._id, idempotencyKey: "worked", answers: {}, hintsUsed: 0, revealStepsSeen: 0 };
    await submitBoundedPracticeHandler(t.ctx, args as never, approved);
    const before = structuredClone(t.tables);
    await expect(submitBoundedPracticeHandler(t.ctx, { ...args, hintsUsed: 1 } as never, approved)).rejects.toThrow(/conflict/);
    await expect(submitBoundedPracticeHandler(t.ctx, { ...args, idempotencyKey: "changed", revealStepsSeen: 1 } as never, approved)).rejects.toThrow(/conflict/);
    expect(t.tables).toEqual(before);
    (t.tables.activity_submissions[0].submissionData as Record<string, unknown>).parts = [{ partId: "private" }];
    const malformed = structuredClone(t.tables);
    expect(await getTrianglePracticeHandler(t.ctx, t.userId as never, approved)).toEqual([]);
    await expect(submitBoundedPracticeHandler(t.ctx, { ...args, idempotencyKey: "new" } as never, approved)).rejects.toThrow(/history/);
    expect(t.tables).toEqual(malformed);
  });

  it.each([
    ["missing lesson", (row: Record<string, unknown>) => { delete row.lessonId; }],
    ["lesson identity", (row: Record<string, unknown>) => { row.lessonId = "lessons:other"; }],
    ["empty key", (row: Record<string, unknown>) => { row.idempotencyKey = " "; }],
    ["ordinal", (row: Record<string, unknown>) => { row.attemptOrdinal = 0; }],
    ["row time", (row: Record<string, unknown>) => { row.updatedAt = Number.NaN; }],
    ["grade", (row: Record<string, unknown>) => { row.score = 0; }],
    ["contract", (row: Record<string, unknown>) => { (row.submissionData as Record<string, unknown>).contractVersion = "legacy"; }],
    ["envelope activity", (row: Record<string, unknown>) => { (row.submissionData as Record<string, unknown>).activityId = "activities:other"; }],
    ["mode", (row: Record<string, unknown>) => { (row.submissionData as Record<string, unknown>).mode = "guided_practice"; }],
    ["status", (row: Record<string, unknown>) => { (row.submissionData as Record<string, unknown>).status = "pending"; }],
    ["envelope ordinal", (row: Record<string, unknown>) => { (row.submissionData as Record<string, unknown>).attemptNumber = 2; }],
    ["envelope time", (row: Record<string, unknown>) => { (row.submissionData as Record<string, unknown>).submittedAt = new Date(1).toISOString(); }],
    ["answers", (row: Record<string, unknown>) => { (row.submissionData as { answers: Record<string, string> }).answers.answer = "x"; }],
    ["parts", (row: Record<string, unknown>) => { (row.submissionData as Record<string, unknown>).parts = [{ partId: "private" }]; }],
    ["artifact", (row: Record<string, unknown>) => { ((row.submissionData as Record<string, unknown>).artifact as Record<string, unknown>).privateAnswer = "x"; }],
    ["request answers", (row: Record<string, unknown>) => { ((((row.submissionData as Record<string, unknown>).artifact as Record<string, unknown>).request as { answers: Record<string, string> }).answers).answer = "x"; }],
    ["request counter", (row: Record<string, unknown>) => { ((((row.submissionData as Record<string, unknown>).artifact as Record<string, unknown>).request as Record<string, unknown>)).hintsUsed = -1; }],
  ])("rejects malformed Worked %s history for same and new keys", async (_name, corrupt) => {
    const t = await setup();
    const worked = t.tables.activities.find((row) => row.stableActivityId === `${triangleNodeIds.angles}.worked_example`)!;
    const args = { userId: t.userId, activityId: worked._id, idempotencyKey: "worked", answers: {}, hintsUsed: 0, revealStepsSeen: 0 };
    await submitBoundedPracticeHandler(t.ctx, args as never, approved);
    corrupt(t.tables.activity_submissions[0]);
    const before = structuredClone(t.tables);
    expect(await getTrianglePracticeHandler(t.ctx, t.userId as never, approved)).toEqual([]);
    await expect(submitBoundedPracticeHandler(t.ctx, args as never, approved)).rejects.toThrow(/history/);
    await expect(submitBoundedPracticeHandler(t.ctx, { ...args, idempotencyKey: "new" } as never, approved)).rejects.toThrow(/history/);
    expect(t.tables).toEqual(before);
  });

  it.each(["missing", "duplicate"])("fails closed when the canonical lesson is %s", async (state) => {
    const t = await setup(triangleNodeIds.angles, "worked_example", 6);
    if (state === "missing") t.tables.lessons.length = 0;
    else await t.db.insert("lessons", { slug: "module-1-lesson-4" });
    const before = structuredClone(t.tables);
    expect(await getTrianglePracticeHandler(t.ctx, t.userId as never, approved)).toEqual([]);
    await expect(submitBoundedPracticeHandler(t.ctx, {
      userId: t.userId, activityId: t.activityId, idempotencyKey: "worked",
      answers: {}, hintsUsed: 0, revealStepsSeen: 0,
    } as never, approved)).rejects.toThrow("pilot_source_lesson_missing");
    expect(t.tables).toEqual(before);
  });

  it("omits both Worked items and restores partial and completed graded state", async () => {
    const t = await setup();
    for (const nodeId of Object.values(triangleNodeIds)) {
      const worked = t.tables.activities.find((row) => row.stableActivityId === `${nodeId}.worked_example`)!;
      await submitBoundedPracticeHandler(t.ctx, {
        userId: t.userId, activityId: worked._id, idempotencyKey: `worked-${nodeId}`,
        answers: {}, hintsUsed: 0, revealStepsSeen: 0,
      } as never, approved);
    }
    const guided = t.tables.activities.find((row) => row.stableActivityId === `${triangleNodeIds.angles}.guided_practice`)!;
    await submitTriangleHandler(t.ctx, {
      userId: t.userId, activityId: guided._id, idempotencyKey: "guided-part",
      answers: { measure_order: "choice-1" }, hintsUsed: 0, revealStepsSeen: 0,
    } as never, approved);
    const independent = t.tables.activities.find((row) => row.stableActivityId === `${triangleNodeIds.sides}.independent_practice`)!;
    await submitTriangleHandler(t.ctx, {
      userId: t.userId, activityId: independent._id, idempotencyKey: "independent-part",
      answers: { missing_angle: "66" }, hintsUsed: 0, revealStepsSeen: 0,
    } as never, approved);
    await submitTriangleHandler(t.ctx, {
      userId: t.userId, activityId: independent._id, idempotencyKey: "independent-final",
      answers: { missing_angle: "66", final_order: "choice-1" }, hintsUsed: 0, revealStepsSeen: 0,
    } as never, approved);

    const resumed = await getTrianglePracticeHandler(t.ctx, t.userId as never, approved);
    expect(resumed.some((row) => row.mode === "worked_example")).toBe(false);
    expect(resumed.find((row) => row.activityId === guided._id)).toMatchObject({
      acceptedAnswers: { measure_order: "choice-1" },
      currentPart: { id: "opposite_correspondence" },
    });
    expect(resumed.some((row) => row.activityId === independent._id)).toBe(false);
  });

  it("saves a guided retry before it advances and replays the exact request", async () => {
    const t = await setup();
    const wrongArgs = {
      userId: t.userId,
      activityId: t.activityId,
      idempotencyKey: "wrong",
      answers: { measure_order: "choice-2" },
      hintsUsed: 0,
      revealStepsSeen: 0,
    };
    const wrong = await submitTriangleHandler(
      t.ctx,
      wrongArgs as never,
      approved,
    );
    expect(wrong).toMatchObject({
      score: 0,
      complete: false,
      finalPart: false,
      hintsUsed: 1,
    });
    expect(
      await submitTriangleHandler(t.ctx, wrongArgs as never, approved),
    ).toEqual(wrong);
    const right = await submitTriangleHandler(
      t.ctx,
      {
        ...wrongArgs,
        idempotencyKey: "right",
        answers: { measure_order: "choice-1" },
        hintsUsed: 1,
      } as never,
      approved,
    );
    expect(right).toMatchObject({
      score: 1,
      acceptedAnswers: { measure_order: "choice-1" },
      nextPart: { id: "opposite_correspondence" },
    });
    const projected = (
      await getTrianglePracticeHandler(t.ctx, t.userId as never, approved)
    ).find((row) => row.activityId === t.activityId);
    expect(projected).toMatchObject({
      acceptedAnswers: { measure_order: "choice-1" },
      hintsUsed: 1,
      currentPart: { id: "opposite_correspondence" },
    });
    expect(JSON.stringify(projected)).not.toContain("The correct order");
    expect(t.tables.learning_evidence ?? []).toEqual([]);
    expect(t.tables.srs_cards ?? []).toEqual([]);
  });

  it("requires the missing-angle prerequisite and stores an incorrect final row with all graded parts", async () => {
    const t = await setup(triangleNodeIds.sides, "independent_practice", 10);
    const first = await submitTriangleHandler(
      t.ctx,
      {
        userId: t.userId,
        activityId: t.activityId,
        idempotencyKey: "angle",
        answers: { missing_angle: "66" },
        hintsUsed: 0,
        revealStepsSeen: 0,
      } as never,
      approved,
    );
    expect(first).toMatchObject({
      nextPart: { id: "final_order" },
      acceptedAnswers: { missing_angle: "66" },
    });
    await expect(
      submitTriangleHandler(
        t.ctx,
        {
          userId: t.userId,
          activityId: t.activityId,
          idempotencyKey: "skip",
          answers: { final_order: "choice-1" },
          hintsUsed: 0,
          revealStepsSeen: 0,
        } as never,
        approved,
      ),
    ).rejects.toThrow("invalid_submission");
    const last = await submitTriangleHandler(
      t.ctx,
      {
        userId: t.userId,
        activityId: t.activityId,
        idempotencyKey: "last",
        answers: { missing_angle: "66", final_order: "choice-2" },
        hintsUsed: 0,
        revealStepsSeen: 0,
      } as never,
      approved,
    );
    expect(last).toMatchObject({
      finalPart: true,
      complete: false,
      score: 0,
      maxScore: 1,
    });
    const saved = t.tables.activity_submissions.at(-1)!;
    expect((saved.submissionData as { parts: unknown[] }).parts).toHaveLength(
      2,
    );
    expect(
      (saved.submissionData as { artifact: { request: unknown } }).artifact
        .request,
    ).toEqual({
      answers: { missing_angle: "66", final_order: "choice-2" },
      hintsUsed: 0,
      revealStepsSeen: 0,
    });
    expect(saved.submissionData).not.toHaveProperty("request");
  });

  it("fails closed while the graph is draft and does not write", async () => {
    const t = await setup();
    expect(await getTrianglePracticeHandler(t.ctx, t.userId as never)).toEqual(
      [],
    );
    await expect(
      submitTriangleHandler(t.ctx, {
        userId: t.userId,
        activityId: t.activityId,
        idempotencyKey: "x",
        answers: { measure_order: "choice-1" },
        hintsUsed: 0,
        revealStepsSeen: 0,
      } as never),
    ).rejects.toThrow("unsupported_activity");
    expect(t.tables.activity_submissions ?? []).toEqual([]);
  });

  it("requires an approved skill node and its matching approved blueprint", async () => {
    const t = await setup();
    const wrongKind = {
      ...approved,
      nodes: approved.nodes.map((node) => ({ ...node, kind: "example" })),
    };
    expect(
      await getTrianglePracticeHandler(t.ctx, t.userId as never, wrongKind),
    ).toEqual([]);
    const mixed = {
      ...approved,
      blueprints: approved.blueprints.filter(
        (row) => row.nodeId !== triangleNodeIds.sides,
      ),
    };
    const partial = await getTrianglePracticeHandler(
      t.ctx,
      t.userId as never,
      mixed,
    );
    expect(partial).toHaveLength(3);
    expect(
      partial.every(
        (item) =>
          item.problem === 6 || item.problem === 8 || item.problem === 11,
      ),
    ).toBe(true);
    expect(t.tables.activity_submissions ?? []).toEqual([]);
  });

  it.each([
    [triangleNodeIds.angles, 6],
    [triangleNodeIds.sides, 7],
  ])("acknowledges the Worked activity for %s", async (node, seed) => {
    const t = await setup(node, "worked_example", seed);
    const args = {
      userId: t.userId,
      activityId: t.activityId,
      idempotencyKey: "worked",
      answers: {},
      hintsUsed: 0,
      revealStepsSeen: 0,
    };
    const first = await submitBoundedPracticeHandler(
      t.ctx,
      args as never,
      approved,
    );
    expect(first).toMatchObject({
      kind: "acknowledged",
      evidencePersisted: false,
    });
    expect(
      await submitBoundedPracticeHandler(t.ctx, args as never, approved),
    ).toEqual(first);
    expect(t.tables.activity_submissions).toHaveLength(1);
    expect(t.tables.learning_evidence ?? []).toEqual([]);
  });

  it("treats answer key order as irrelevant and rejects malformed stored history without a write", async () => {
    const t = await setup();
    await submitTriangleHandler(
      t.ctx,
      {
        userId: t.userId,
        activityId: t.activityId,
        idempotencyKey: "first",
        answers: { measure_order: "choice-1" },
        hintsUsed: 0,
        revealStepsSeen: 0,
      } as never,
      approved,
    );
    const args = {
      userId: t.userId,
      activityId: t.activityId,
      idempotencyKey: "second",
      answers: {
        measure_order: "choice-1",
        opposite_correspondence: "choice-1",
      },
      hintsUsed: 0,
      revealStepsSeen: 0,
    };
    const receipt = await submitTriangleHandler(t.ctx, args as never, approved);
    expect(
      await submitTriangleHandler(
        t.ctx,
        {
          ...args,
          answers: {
            opposite_correspondence: "choice-1",
            measure_order: "choice-1",
          },
        } as never,
        approved,
      ),
    ).toEqual(receipt);
    const before = t.tables.activity_submissions.length;
    const latest = t.tables.activity_submissions.at(-1)!;
    (
      latest.submissionData as { answers: Record<string, string> }
    ).answers.future = "choice-1";
    expect(
      await getTrianglePracticeHandler(t.ctx, t.userId as never, approved),
    ).toEqual([]);
    await expect(
      submitTriangleHandler(
        t.ctx,
        { ...args, idempotencyKey: "third" } as never,
        approved,
      ),
    ).rejects.toThrow("invalid_triangle_history");
    expect(t.tables.activity_submissions).toHaveLength(before);
  });

  it.each([
    [
      "mixed identity",
      (row: Record<string, unknown>) => {
        (row.submissionData as Record<string, unknown>).mode =
          "independent_practice";
      },
    ],
    [
      "skipped prefix",
      (row: Record<string, unknown>) => {
        (row.submissionData as { answers: Record<string, string> }).answers = {
          opposite_correspondence: "choice-1",
        };
      },
    ],
    [
      "changed raw answer",
      (row: Record<string, unknown>) => {
        (
          row.submissionData as { parts: Array<Record<string, unknown>> }
        ).parts[0].rawAnswer = "choice-2";
      },
    ],
    [
      "bad grade",
      (row: Record<string, unknown>) => {
        (
          row.submissionData as { parts: Array<Record<string, unknown>> }
        ).parts[0].score = 0;
      },
    ],
    [
      "bad final shape",
      (row: Record<string, unknown>) => {
        (
          row.submissionData as { artifact: Record<string, unknown> }
        ).artifact.finalPart = true;
      },
    ],
    [
      "wrong response feedback",
      (row: Record<string, unknown>) => {
        (
          row.submissionData as {
            artifact: { response: Record<string, unknown> };
          }
        ).artifact.response.feedback = "Private answer.";
      },
    ],
    [
      "wrong next part",
      (row: Record<string, unknown>) => {
        const response = (
          row.submissionData as {
            artifact: { response: { nextPart: Record<string, unknown> } };
          }
        ).artifact.response;
        response.nextPart.id = "future_part";
      },
    ],
    [
      "private next-part field",
      (row: Record<string, unknown>) => {
        const response = (
          row.submissionData as {
            artifact: { response: { nextPart: Record<string, unknown> } };
          }
        ).artifact.response;
        response.nextPart.answer = "choice-1";
      },
    ],
    [
      "hint on a successful part",
      (row: Record<string, unknown>) => {
        (
          row.submissionData as {
            artifact: { response: Record<string, unknown> };
          }
        ).artifact.response.hint = "Leaked hint";
      },
    ],
  ])(
    "makes the sequence unavailable for %s history",
    async (_name, corrupt) => {
      const t = await setup();
      await submitTriangleHandler(
        t.ctx,
        {
          userId: t.userId,
          activityId: t.activityId,
          idempotencyKey: "saved",
          answers: { measure_order: "choice-1" },
          hintsUsed: 0,
          revealStepsSeen: 0,
        } as never,
        approved,
      );
      corrupt(t.tables.activity_submissions[0]);
      expect(
        await getTrianglePracticeHandler(t.ctx, t.userId as never, approved),
      ).toEqual([]);
      const retry = {
        userId: t.userId,
        activityId: t.activityId,
        idempotencyKey: "saved",
        answers: { measure_order: "choice-1" },
        hintsUsed: 0,
        revealStepsSeen: 0,
      };
      await expect(
        submitTriangleHandler(t.ctx, retry as never, approved),
      ).rejects.toThrow("invalid_triangle_history");
      await expect(
        submitTriangleHandler(
          t.ctx,
          { ...retry, idempotencyKey: "new" } as never,
          approved,
        ),
      ).rejects.toThrow("invalid_triangle_history");
      expect(t.tables.activity_submissions).toHaveLength(1);
    },
  );

  it("returns only public graded parts in a complete receipt", async () => {
    const t = await setup();
    const one = { measure_order: "choice-1" };
    await submitTriangleHandler(
      t.ctx,
      {
        userId: t.userId,
        activityId: t.activityId,
        idempotencyKey: "one",
        answers: one,
        hintsUsed: 0,
        revealStepsSeen: 0,
      } as never,
      approved,
    );
    const two = { ...one, opposite_correspondence: "choice-1" };
    await submitTriangleHandler(
      t.ctx,
      {
        userId: t.userId,
        activityId: t.activityId,
        idempotencyKey: "two",
        answers: two,
        hintsUsed: 0,
        revealStepsSeen: 0,
      } as never,
      approved,
    );
    const result = await submitTriangleHandler(
      t.ctx,
      {
        userId: t.userId,
        activityId: t.activityId,
        idempotencyKey: "three",
        answers: { ...two, final_order: "choice-1" },
        hintsUsed: 0,
        revealStepsSeen: 0,
      } as never,
      approved,
    );
    expect(result).toMatchObject({ complete: true, score: 3, maxScore: 3 });
    expect(result.parts).toHaveLength(3);
    for (const part of result.parts ?? [])
      expect(Object.keys(part).sort()).toEqual([
        "feedback",
        "isCorrect",
        "maxScore",
        "partId",
        "rawAnswer",
        "score",
      ]);
    expect(JSON.stringify(result)).not.toMatch(
      /normalized|explanation|solutionSteps|answerKey|"hint":/,
    );
  });

  it("rejects a stored Guided hint that is not the fixed current hint", async () => {
    const t = await setup();
    const args = {
      userId: t.userId,
      activityId: t.activityId,
      idempotencyKey: "wrong",
      answers: { measure_order: "choice-2" },
      hintsUsed: 0,
      revealStepsSeen: 0,
    };
    await submitTriangleHandler(t.ctx, args as never, approved);
    (
      t.tables.activity_submissions[0].submissionData as {
        artifact: { response: Record<string, unknown> };
      }
    ).artifact.response.hint = "Different hint";
    expect(
      await getTrianglePracticeHandler(t.ctx, t.userId as never, approved),
    ).toEqual([]);
    await expect(
      submitTriangleHandler(t.ctx, args as never, approved),
    ).rejects.toThrow("invalid_triangle_history");
    expect(t.tables.activity_submissions).toHaveLength(1);
  });

  it("writes only exact-node final-order evidence after later readiness", async () => {
    const t = await setup(triangleNodeIds.sides, "independent_practice", 10);
    await t.db.patch(t.activityId, { srsEligible: true });
    await t.db.insert("learning_evidence", {
      learnerId: t.userId,
      nodeId: triangleNodeIds.sides,
      submissionId: "teacher-source",
      activityId: "teacher-guided",
      attemptOrdinal: 1,
      origin: "teacher_led",
      mode: "guided_practice",
      occurredAt: "2026-09-09T00:00:00.000Z",
      idempotencyKey: "teacher",
      masteryBearing: false,
      createdAt: 1,
    });
    await submitTriangleHandler(
      t.ctx,
      {
        userId: t.userId,
        activityId: t.activityId,
        idempotencyKey: "angle",
        answers: { missing_angle: "66" },
        hintsUsed: 0,
        revealStepsSeen: 0,
      } as never,
      ready,
    );
    const result = await submitTriangleHandler(
      t.ctx,
      {
        userId: t.userId,
        activityId: t.activityId,
        idempotencyKey: "order",
        answers: { final_order: "choice-2", missing_angle: "66" },
        hintsUsed: 0,
        revealStepsSeen: 0,
      } as never,
      ready,
    );
    expect(result).toMatchObject({ complete: false, evidencePersisted: true });
    expect(t.tables.learning_evidence).toHaveLength(2);
    expect(t.tables.learning_evidence[1]).toMatchObject({
      nodeId: triangleNodeIds.sides,
      gradedEvidence: { isCorrect: false, score: 0, maxScore: 1 },
    });
    expect(
      t.tables.learning_evidence.some(
        (row) =>
          typeof row.nodeId === "string" && row.nodeId.includes("missing"),
      ),
    ).toBe(false);
  });

  it("does not unlock Problem 10 or write evidence after a wrong prerequisite", async () => {
    const t = await setup(triangleNodeIds.sides, "independent_practice", 10);
    await t.db.patch(t.activityId, { srsEligible: true });
    await submitTriangleHandler(
      t.ctx,
      {
        userId: t.userId,
        activityId: t.activityId,
        idempotencyKey: "wrong-angle",
        answers: { missing_angle: "65" },
        hintsUsed: 0,
        revealStepsSeen: 0,
      } as never,
      ready,
    );
    await expect(
      submitTriangleHandler(
        t.ctx,
        {
          userId: t.userId,
          activityId: t.activityId,
          idempotencyKey: "guess",
          answers: { missing_angle: "65", final_order: "choice-1" },
          hintsUsed: 0,
          revealStepsSeen: 0,
        } as never,
        ready,
      ),
    ).rejects.toThrow("invalid_submission");
    expect(t.tables.learning_evidence ?? []).toEqual([]);
    expect(t.tables.srs_cards ?? []).toEqual([]);
  });
});
