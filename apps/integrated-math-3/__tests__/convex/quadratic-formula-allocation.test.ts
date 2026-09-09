import { describe, expect, it } from "vitest";
import { generateQuadraticFormula } from "@math-platform/math-content";
import {
  createServerOwnedSubmissionHandler,
  checkQuadraticFormulaDiscriminantHandler,
  getQuadraticFormulaAttemptHandler,
  startQuadraticFormulaAttemptHandler,
} from "@/convex/activities";
import { upsertIm3QuadraticFormulaDrafts } from "@/convex/seed/seed_lesson_1_6";
import {
  IM3_QF_DRAFT_MAPPINGS,
  IM3_QF_NODE,
  IM3_QF_VARIANT_SCHEDULES,
  quadraticFormulaVariantKey,
} from "@/lib/activities/server-grading";
const publication = {
  nodes: [{ id: IM3_QF_NODE, kind: "skill", reviewStatus: "draft" }],
  blueprints: [{ nodeId: IM3_QF_NODE, reviewStatus: "draft" }],
};
function memory() {
  const data: Record<string, any[]> = {};
  let next = 1;
  const table = (name: string) => (data[name] ??= []);
  const db = {
    get: async (id: string) =>
      Object.values(data)
        .flat()
        .find((row) => row._id === id) ?? null,
    query(name: string) {
      const filters: [string, unknown][] = [];
      const selected = () =>
        table(name).filter((row) => filters.every(([k, v]) => row[k] === v));
      const chain: any = {
        withIndex(_name: string, apply: (q: any) => void) {
          const q: any = {
            eq(k: string, v: unknown) {
              filters.push([k, v]);
              return q;
            },
          };
          apply(q);
          return chain;
        },
        collect: async () => selected(),
        take: async (n: number) => selected().slice(0, n),
        unique: async () => {
          const rows = selected();
          if (rows.length > 1) throw new Error("non-unique");
          return rows[0] ?? null;
        },
        first: async () => selected()[0] ?? null,
        order: () => ({
          first: async () =>
            selected().sort(
              (a, b) => (b.attemptOrdinal ?? 0) - (a.attemptOrdinal ?? 0),
            )[0] ?? null,
          take: async (n: number) => selected().sort((a, b) => (b.attemptOrdinal ?? 0) - (a.attemptOrdinal ?? 0)).slice(0, n),
        }),
        async *[Symbol.asyncIterator]() {
          yield* selected();
        },
      };
      return chain;
    },
    insert: async (name: string, value: any) => {
      const id = `${name}:${next++}`;
      table(name).push({ _id: id, ...structuredClone(value) });
      return id;
    },
    patch: async (id: string, value: any) =>
      Object.assign(
        Object.values(data)
          .flat()
          .find((row) => row._id === id),
        structuredClone(value),
      ),
  };
  return { ctx: { db, scheduler: { runAfter: async () => undefined } }, table };
}
async function fixture(mode: keyof typeof IM3_QF_DRAFT_MAPPINGS) {
  const f = memory();
  const userId = "profiles:a";
  f.table("profiles").push({
    _id: userId,
    username: "a",
    role: "student",
    organizationId: "org",
  });
  f.table("auth_credentials").push({
    _id: "auth",
    profileId: userId,
    username: "a",
    role: "student",
    organizationId: "org",
    isActive: true,
  });
  await upsertIm3QuadraticFormulaDrafts(f.ctx as never, 1);
  const activityId = f
    .table("activities")
    .find(
      (row) =>
        row.stableActivityId === IM3_QF_DRAFT_MAPPINGS[mode].stableActivityId,
    )._id;
  return { ...f, userId, activityId } as any;
}
function envelope(
  activityId: string,
  mode: keyof typeof IM3_QF_DRAFT_MAPPINGS,
  seed: number,
  attemptNumber = 99,
) {
  const p = generateQuadraticFormula({ seed });
  const [x1, x2 = ""] = p.roots.map((r) => r.value);
  return {
    contractVersion: "practice.v1",
    activityId,
    mode,
    status: "submitted",
    attemptNumber,
    submittedAt: "2026-09-09T00:00:00.000Z",
    answers: { discriminant: p.discriminant, x1, x2 },
    parts: [
      { partId: "discriminant", rawAnswer: p.discriminant },
      { partId: "x1", rawAnswer: x1 },
      { partId: "x2", rawAnswer: x2 },
    ],
  };
}
function addLegacyFinal(f: any, userId: string, ordinal = 9, key = "legacy") {
  const value: any = envelope(f.activityId, "guided_practice", 1);
  value.status = "graded";
  value.parts = value.parts.map((part: any) => ({
    ...part,
    isCorrect: true,
    score: 1,
    maxScore: 1,
  }));
  f.table("activity_submissions").push({
    _id: `activity_submissions:${userId}:${ordinal}`,
    userId,
    activityId: f.activityId,
    submissionData: value,
    score: 3,
    maxScore: 3,
    attemptOrdinal: ordinal,
    idempotencyKey: key,
    submittedAt: 1,
    gradedAt: 1,
    createdAt: 1,
    updatedAt: 1,
  });
  return value;
}
describe("quadratic-formula immutable allocation", () => {
  it("seeds only canonical relations and creates the selected suffix on Start", async () => {
    const f: any = await fixture("guided_practice");
    expect(f.table("practice_variants").map((row: any) => row.variantKey).sort()).toEqual(
      [
        quadraticFormulaVariantKey("guided_practice", 0),
        quadraticFormulaVariantKey("independent_practice", 0),
      ].sort(),
    );
    expect(f.table("practice_items")).toHaveLength(2);
    addLegacyFinal(f, f.userId, 9);
    await startQuadraticFormulaAttemptHandler(
      f.ctx as never,
      { userId: f.userId, activityId: f.activityId, mode: "guided_practice" },
      publication,
    );
    expect(
      f.table("practice_variants").filter(
        (row: any) => row.variantKey === quadraticFormulaVariantKey("guided_practice", 1),
      ),
    ).toHaveLength(1);
  });
  it("preserves an existing suffix and does not create future suffixes on seed rerun", async () => {
    const f: any = await fixture("guided_practice");
    addLegacyFinal(f, f.userId, 9);
    await startQuadraticFormulaAttemptHandler(
      f.ctx as never,
      { userId: f.userId, activityId: f.activityId, mode: "guided_practice" },
      publication,
    );
    const existingSuffix = structuredClone(
      f.table("practice_variants").find(
        (row: any) => row.variantKey === quadraticFormulaVariantKey("guided_practice", 1),
      ),
    );
    await upsertIm3QuadraticFormulaDrafts(f.ctx as never, 20);
    expect(
      f.table("practice_variants").find(
        (row: any) => row.variantKey === quadraticFormulaVariantKey("guided_practice", 1),
      ),
    ).toEqual(existingSuffix);
    expect(
      f.table("practice_variants").some(
        (row: any) => row.variantKey === quadraticFormulaVariantKey("guided_practice", 2),
      ),
    ).toBe(false);
  });
  it("accepts canonical metadata with a different object key order", async () => {
    const f: any = await fixture("guided_practice");
    const row = f.table("practice_variants")[0];
    const { mode, seed, generatorKey, stableActivityId } = row.metadata;
    row.metadata = { mode, stableActivityId, generatorKey, seed };
    await expect(upsertIm3QuadraticFormulaDrafts(f.ctx as never, 20)).resolves.toBeUndefined();
  });
  it.each(["guided_practice", "independent_practice"] as const)(
    "allocates, reloads, finalizes, advances, and exhausts %s",
    async (mode) => {
      const f = await fixture(mode);
      expect(
        await getQuadraticFormulaAttemptHandler(
          f.ctx as never,
          { userId: f.userId, activityId: f.activityId, mode },
          publication,
        ),
      ).toEqual({ state: "no_attempt" });
      for (let index = 0; index < 4; index++) {
        const pending: any = await startQuadraticFormulaAttemptHandler(
          f.ctx as never,
          { userId: f.userId, activityId: f.activityId, mode },
          publication,
        );
        expect(pending).toMatchObject({
          state: "pending",
          attemptOrdinal: index + 1,
        });
        expect(JSON.stringify(pending)).not.toContain("allocatedVariantKey");
        expect(
          await startQuadraticFormulaAttemptHandler(
            f.ctx as never,
            { userId: f.userId, activityId: f.activityId, mode },
            publication,
          ),
        ).toEqual(pending);
        const submitArgs = {
          userId: f.userId,
          activityId: f.activityId,
          pendingSubmissionId: pending.pendingSubmissionId,
          idempotencyKey: pending.idempotencyKey,
          submissionData: envelope(
            f.activityId,
            mode,
            IM3_QF_VARIANT_SCHEDULES[mode][index],
            index + 1,
          ),
        };
        const result = await createServerOwnedSubmissionHandler(
          f.ctx as never,
          submitArgs as never,
          publication,
        );
        expect(result.submissionId).toBe(pending.pendingSubmissionId);
        await expect(
          createServerOwnedSubmissionHandler(
            f.ctx as never,
            submitArgs as never,
            publication,
          ),
        ).resolves.toEqual(result);
        await expect(
          createServerOwnedSubmissionHandler(
            f.ctx as never,
            {
              ...submitArgs,
              pendingSubmissionId: "activity_submissions:other",
            } as never,
            publication,
          ),
        ).rejects.toThrow(/pending/);
        const final: any = await getQuadraticFormulaAttemptHandler(
          f.ctx as never,
          { userId: f.userId, activityId: f.activityId, mode },
          publication,
        );
        expect(final).toMatchObject({
          state: "final",
          submissionId: pending.pendingSubmissionId,
          attemptOrdinal: index + 1,
        });
        expect(JSON.stringify(final)).not.toMatch(
          /allocatedVariantKey|generatorKey|canonicalRoots|"seed"/,
        );
      }
      const before = f.table("activity_submissions").length;
      expect(
        await startQuadraticFormulaAttemptHandler(
          f.ctx as never,
          { userId: f.userId, activityId: f.activityId, mode },
          publication,
        ),
      ).toEqual({ state: "exhausted" });
      expect(f.table("activity_submissions")).toHaveLength(before);
    },
  );
  it("enforces pending ownership and mode isolation", async () => {
    const f = await fixture("guided_practice");
    const pending: any = await startQuadraticFormulaAttemptHandler(
      f.ctx as never,
      { userId: f.userId, activityId: f.activityId, mode: "guided_practice" },
      publication,
    );
    f.table("profiles").push({
      _id: "profiles:b",
      username: "b",
      role: "student",
      organizationId: "org",
    });
    f.table("auth_credentials").push({
      _id: "auth:b",
      profileId: "profiles:b",
      username: "b",
      role: "student",
      organizationId: "org",
      isActive: true,
    });
    await expect(
      createServerOwnedSubmissionHandler(
        f.ctx as never,
        {
          userId: "profiles:b",
          activityId: f.activityId,
          pendingSubmissionId: pending.pendingSubmissionId,
          idempotencyKey: pending.idempotencyKey,
          submissionData: envelope(f.activityId, "guided_practice", 1),
        } as never,
        publication,
      ),
    ).rejects.toThrow(/pending/);
    await expect(
      getQuadraticFormulaAttemptHandler(
        f.ctx as never,
        {
          userId: f.userId,
          activityId: f.activityId,
          mode: "independent_practice",
        },
        publication,
      ),
    ).rejects.toThrow();
  });
  it("preserves an exact legacy replay and advances it to later index one", async () => {
    const f: any = await fixture("guided_practice");
    const legacy = addLegacyFinal(f, f.userId, 9);
    const replay = await createServerOwnedSubmissionHandler(
      f.ctx as never,
      {
        userId: f.userId,
        activityId: f.activityId,
        idempotencyKey: "legacy",
        submissionData: {
          ...legacy,
          status: "submitted",
          parts: legacy.parts.map(
            ({ isCorrect: _i, score: _s, maxScore: _m, ...part }: any) => part,
          ),
        },
      } as never,
      publication,
    );
    expect(replay).toMatchObject({
      submissionId: `activity_submissions:${f.userId}:9`,
      score: 3,
      maxScore: 3,
    });
    const laterKey = quadraticFormulaVariantKey("guided_practice", 1);
    f.table("practice_variants").splice(
      f
        .table("practice_variants")
        .findIndex((row: any) => row.variantKey === laterKey),
      1,
    );
    f.table("practice_items").splice(
      f
        .table("practice_items")
        .findIndex((row: any) => row.variantKey === laterKey),
      1,
    );
    const pending: any = await startQuadraticFormulaAttemptHandler(
      f.ctx as never,
      { userId: f.userId, activityId: f.activityId, mode: "guided_practice" },
      publication,
    );
    expect(pending).toMatchObject({ state: "pending", attemptOrdinal: 10 });
    expect(f.table("activity_submissions").at(-1).allocatedVariantKey).toBe(
      laterKey,
    );
    expect(
      f
        .table("practice_items")
        .filter((row: any) => row.variantKey === laterKey),
    ).toHaveLength(1);
  });
  it("reads a bounded tail after a long sparse legacy prefix", async () => {
    const f: any = await fixture("guided_practice");
    for (const ordinal of [1, 3, 8, 20, 21, 40, 75, 120]) addLegacyFinal(f, f.userId, ordinal, `legacy-${ordinal}`);
    const pending: any = await startQuadraticFormulaAttemptHandler(f.ctx as never, { userId: f.userId, activityId: f.activityId, mode: "guided_practice" }, publication);
    expect(pending).toMatchObject({ state: "pending", attemptOrdinal: 121 });
    expect(f.table("activity_submissions").at(-1).allocatedVariantKey).toBe(quadraticFormulaVariantKey("guided_practice", 1));
  });
  it.each(["wrong mode", "draft"])(
    "rejects a %s legacy anchor behind an allocated final without writes",
    async (cause) => {
      const f: any = await fixture("guided_practice");
      addLegacyFinal(f, f.userId, 9);
      const pending: any = await startQuadraticFormulaAttemptHandler(
        f.ctx as never,
        { userId: f.userId, activityId: f.activityId, mode: "guided_practice" },
        publication,
      );
      await createServerOwnedSubmissionHandler(
        f.ctx as never,
        {
          userId: f.userId,
          activityId: f.activityId,
          pendingSubmissionId: pending.pendingSubmissionId,
          idempotencyKey: pending.idempotencyKey,
          submissionData: envelope(f.activityId, "guided_practice", 7, 10),
        } as never,
        publication,
      );
      const anchor = f.table("activity_submissions").find((row: any) => !row.allocatedVariantKey);
      if (cause === "wrong mode") anchor.submissionData.mode = "independent_practice";
      else anchor.submissionData.status = "draft";
      const before = structuredClone(f.table("activity_submissions"));
      await expect(
        getQuadraticFormulaAttemptHandler(
          f.ctx as never,
          { userId: f.userId, activityId: f.activityId, mode: "guided_practice" },
          publication,
        ),
      ).rejects.toThrow(/legacy anchor/);
      await expect(
        startQuadraticFormulaAttemptHandler(
          f.ctx as never,
          { userId: f.userId, activityId: f.activityId, mode: "guided_practice" },
          publication,
        ),
      ).rejects.toThrow(/legacy anchor/);
      expect(f.table("activity_submissions")).toEqual(before);
    },
  );
  it("rejects attempt ordinal overflow before relation or submission writes", async () => {
    const f: any = await fixture("guided_practice");
    addLegacyFinal(f, f.userId, Number.MAX_SAFE_INTEGER);
    const key = quadraticFormulaVariantKey("guided_practice", 1);
    f.table("practice_variants").splice(f.table("practice_variants").findIndex((row: any) => row.variantKey === key), 1);
    f.table("practice_items").splice(f.table("practice_items").findIndex((row: any) => row.variantKey === key), 1);
    const before = structuredClone({
      submissions: f.table("activity_submissions"),
      variants: f.table("practice_variants"),
      items: f.table("practice_items"),
    });
    await expect(
      startQuadraticFormulaAttemptHandler(
        f.ctx as never,
        { userId: f.userId, activityId: f.activityId, mode: "guided_practice" },
        publication,
      ),
    ).rejects.toThrow(/ordinal is exhausted/);
    expect({
      submissions: f.table("activity_submissions"),
      variants: f.table("practice_variants"),
      items: f.table("practice_items"),
    }).toEqual(before);
  });
  it("reuses one later relation for two learners", async () => {
    const f: any = await fixture("guided_practice");
    f.table("profiles").push({
      _id: "profiles:b",
      username: "b",
      role: "student",
      organizationId: "org",
    });
    f.table("auth_credentials").push({
      _id: "auth:b",
      profileId: "profiles:b",
      username: "b",
      role: "student",
      organizationId: "org",
      isActive: true,
    });
    addLegacyFinal(f, f.userId);
    addLegacyFinal(f, "profiles:b");
    const a: any = await startQuadraticFormulaAttemptHandler(
      f.ctx as never,
      { userId: f.userId, activityId: f.activityId, mode: "guided_practice" },
      publication,
    );
    const b: any = await startQuadraticFormulaAttemptHandler(
      f.ctx as never,
      {
        userId: "profiles:b",
        activityId: f.activityId,
        mode: "guided_practice",
      } as never,
      publication,
    );
    expect(a.props).toEqual(b.props);
    expect(
      f
        .table("practice_items")
        .filter(
          (item: any) =>
            item.variantKey ===
            quadraticFormulaVariantKey("guided_practice", 1),
        ),
    ).toHaveLength(1);
  });
  it("preserves every activity, variant, and item byte on a seed rerun", async () => {
    const f: any = await fixture("guided_practice");
    const before = structuredClone({
      activities: f.table("activities"),
      variants: f.table("practice_variants"),
      items: f.table("practice_items"),
    });
    await upsertIm3QuadraticFormulaDrafts(f.ctx as never, 20);
    expect({
      activities: f.table("activities"),
      variants: f.table("practice_variants"),
      items: f.table("practice_items"),
    }).toEqual(before);
  });
  it.each(["duplicate variant", "reverse item"])(
    "rejects an invalid selected %s without a submission write",
    async (cause) => {
      const f: any = await fixture("guided_practice");
      addLegacyFinal(f, f.userId);
      const key = quadraticFormulaVariantKey("guided_practice", 1);
      await startQuadraticFormulaAttemptHandler(
        f.ctx as never,
        { userId: f.userId, activityId: f.activityId, mode: "guided_practice" },
        publication,
      );
      f.table("activity_submissions").pop();
      if (cause === "duplicate variant")
        f.table("practice_variants").push({
          ...f
            .table("practice_variants")
            .find((row: any) => row.variantKey === key),
          _id: "practice_variants:duplicate",
        });
      else
        f.table("practice_items").push({
          ...f
            .table("practice_items")
            .find((row: any) => row.variantKey === key),
          _id: "practice_items:reverse",
          activityId: "activities:other",
        });
      const before = f.table("activity_submissions").length;
      await expect(
        startQuadraticFormulaAttemptHandler(
          f.ctx as never,
          {
            userId: f.userId,
            activityId: f.activityId,
            mode: "guided_practice",
          },
          publication,
        ),
      ).rejects.toThrow(/relation|variant/);
      expect(f.table("activity_submissions")).toHaveLength(before);
    },
  );
  it.each(["ordinal", "attempt", "answers", "grade", "retry", "timing"])(
    "rejects a corrupt pending %s row",
    async (cause) => {
      const f: any = await fixture("guided_practice");
      const pending: any = await startQuadraticFormulaAttemptHandler(
        f.ctx as never,
        { userId: f.userId, activityId: f.activityId, mode: "guided_practice" },
        publication,
      );
      const row = f.table("activity_submissions").at(-1);
      if (cause === "ordinal") row.attemptOrdinal = 0;
      if (cause === "attempt") row.submissionData.attemptNumber = 2;
      if (cause === "answers") row.submissionData.answers = { x1: "private" };
      if (cause === "grade") row.score = 1;
      if (cause === "retry") row.idempotencyKey = "learner-key";
      if (cause === "timing") row.submissionData.timing = { wallClockMs: 1 };
      await expect(
        getQuadraticFormulaAttemptHandler(
          f.ctx as never,
          {
            userId: f.userId,
            activityId: f.activityId,
            mode: "guided_practice",
          },
          publication,
        ),
      ).rejects.toThrow(/pending|attempt/);
      expect(pending.state).toBe("pending");
    },
  );
  it.each(["timing", "ordinal", "score", "retry"])("rejects a corrupt pending %s row during Guided check", async cause => {
    const f: any = await fixture("guided_practice");
    const pending: any = await startQuadraticFormulaAttemptHandler(f.ctx as never, { userId: f.userId, activityId: f.activityId, mode: "guided_practice" }, publication);
    const row = f.table("activity_submissions").at(-1);
    if (cause === "timing") row.submissionData.timing = { activeMs: 1 };
    if (cause === "ordinal") row.attemptOrdinal = 0;
    if (cause === "score") row.score = 1;
    if (cause === "retry") row.idempotencyKey = "bad";
    await expect(checkQuadraticFormulaDiscriminantHandler(f.ctx as never, { userId: f.userId, activityId: f.activityId, pendingSubmissionId: pending.pendingSubmissionId, fieldId: "discriminant", rawAnswer: "1" }, publication)).rejects.toThrow(/pending/);
  });
  it.each(["duplicate pending", "duplicate ordinal", "invalid earlier key"])(
    "rejects %s before another write",
    async (cause) => {
      const f: any = await fixture("guided_practice");
      const pending: any = await startQuadraticFormulaAttemptHandler(
        f.ctx as never,
        { userId: f.userId, activityId: f.activityId, mode: "guided_practice" },
        publication,
      );
      const row = f.table("activity_submissions").at(-1);
      if (cause === "duplicate pending")
        f.table("activity_submissions").push({
          ...structuredClone(row),
          _id: "activity_submissions:duplicate",
          idempotencyKey: "qf:activity_submissions:duplicate",
        });
      if (cause === "duplicate ordinal")
        f.table("activity_submissions").push({
          ...structuredClone(row),
          _id: "activity_submissions:final",
          idempotencyKey: "qf:activity_submissions:final",
          submissionData: {
            ...row.submissionData,
            status: "graded",
            answers: { discriminant: 1, x1: 1, x2: 1 },
            parts: [
              {
                partId: "discriminant",
                rawAnswer: 1,
                isCorrect: true,
                score: 1,
                maxScore: 1,
              },
              {
                partId: "x1",
                rawAnswer: 1,
                isCorrect: true,
                score: 1,
                maxScore: 1,
              },
              {
                partId: "x2",
                rawAnswer: 1,
                isCorrect: true,
                score: 1,
                maxScore: 1,
              },
            ],
          },
          score: 3,
          maxScore: 3,
          gradedAt: 1,
        });
      if (cause === "invalid earlier key")
        row.allocatedVariantKey = quadraticFormulaVariantKey(
          "guided_practice",
          2,
        );
      const before = f.table("activity_submissions").length;
      await expect(
        startQuadraticFormulaAttemptHandler(
          f.ctx as never,
          {
            userId: f.userId,
            activityId: f.activityId,
            mode: "guided_practice",
          },
          publication,
        ),
      ).rejects.toThrow(/sequence/);
      expect(f.table("activity_submissions")).toHaveLength(before);
      expect(pending.state).toBe("pending");
    },
  );
  it.each(["canonical after legacy", "allocated ordinal gap", "excess allocated"])("rejects invalid bounded-tail transition: %s", async cause => {
    const f: any = await fixture("guided_practice"); addLegacyFinal(f, f.userId, 1);
    const pending: any = await startQuadraticFormulaAttemptHandler(f.ctx as never, { userId: f.userId, activityId: f.activityId, mode: "guided_practice" }, publication);
    const row = f.table("activity_submissions").at(-1);
    if (cause === "canonical after legacy") row.allocatedVariantKey = quadraticFormulaVariantKey("guided_practice", 0);
    if (cause === "allocated ordinal gap") row.attemptOrdinal = 3;
    if (cause === "excess allocated") for (let index = 0; index < 4; index++) f.table("activity_submissions").push({ ...structuredClone(row), _id: `activity_submissions:extra-${index}`, attemptOrdinal: 3 + index, idempotencyKey: `qf:activity_submissions:extra-${index}` });
    const before = f.table("activity_submissions").length;
    await expect(startQuadraticFormulaAttemptHandler(f.ctx as never, { userId: f.userId, activityId: f.activityId, mode: "guided_practice" }, publication)).rejects.toThrow(/sequence/);
    expect(f.table("activity_submissions")).toHaveLength(before);
    expect(pending.state).toBe("pending");
  });
  it("rejects corrupt fixed props with a valid pending handle", async () => {
    const f: any = await fixture("guided_practice");
    const pending: any = await startQuadraticFormulaAttemptHandler(
      f.ctx as never,
      { userId: f.userId, activityId: f.activityId, mode: "guided_practice" },
      publication,
    );
    f
      .table("activities")
      .find((row: any) => row._id === f.activityId).props.equation = "x^2 = 0";
    await expect(
      createServerOwnedSubmissionHandler(
        f.ctx as never,
        {
          userId: f.userId,
          activityId: f.activityId,
          pendingSubmissionId: pending.pendingSubmissionId,
          idempotencyKey: pending.idempotencyKey,
          submissionData: envelope(f.activityId, "guided_practice", 1, 1),
        } as never,
        publication,
      ),
    ).rejects.toThrow(/authority/);
  });
  it("rejects a corrupt final row", async () => {
    const f: any = await fixture("guided_practice");
    const pending: any = await startQuadraticFormulaAttemptHandler(
      f.ctx as never,
      { userId: f.userId, activityId: f.activityId, mode: "guided_practice" },
      publication,
    );
    await createServerOwnedSubmissionHandler(
      f.ctx as never,
      {
        userId: f.userId,
        activityId: f.activityId,
        pendingSubmissionId: pending.pendingSubmissionId,
        idempotencyKey: pending.idempotencyKey,
        submissionData: envelope(f.activityId, "guided_practice", 1, 1),
      } as never,
      publication,
    );
    f.table("activity_submissions").at(-1).submissionData.parts[0].rawAnswer = {
      privateSeed: 1,
    };
    await expect(
      getQuadraticFormulaAttemptHandler(
        f.ctx as never,
        { userId: f.userId, activityId: f.activityId, mode: "guided_practice" },
        publication,
      ),
    ).rejects.toThrow(/final|sequence/);
  });
  it("reads, replays, and advances a timing-enriched final receipt", async () => {
    const f: any = await fixture("guided_practice");
    const pending: any = await startQuadraticFormulaAttemptHandler(f.ctx as never, { userId: f.userId, activityId: f.activityId, mode: "guided_practice" }, publication);
    const submissionData: any = envelope(f.activityId, "guided_practice", 1, 1);
    submissionData.timing = { startedAt: "2026-09-09T00:00:00.000Z", submittedAt: "2026-09-09T00:01:00.000Z", wallClockMs: 60000, activeMs: 50000, idleMs: 10000, pauseCount: 0, focusLossCount: 0, visibilityHiddenCount: 0, confidence: "high" };
    const args = { userId: f.userId, activityId: f.activityId, pendingSubmissionId: pending.pendingSubmissionId, idempotencyKey: pending.idempotencyKey, submissionData };
    const saved = await createServerOwnedSubmissionHandler(f.ctx as never, args as never, publication);
    expect((await getQuadraticFormulaAttemptHandler(f.ctx as never, { userId: f.userId, activityId: f.activityId, mode: "guided_practice" }, publication) as any).state).toBe("final");
    await expect(createServerOwnedSubmissionHandler(f.ctx as never, args as never, publication)).resolves.toEqual(saved);
    await expect(startQuadraticFormulaAttemptHandler(f.ctx as never, { userId: f.userId, activityId: f.activityId, mode: "guided_practice" }, publication)).resolves.toMatchObject({ state: "pending", attemptOrdinal: 2 });
  });
  it("rejects a mismatched allocated attempt number without writes", async () => {
    const f: any = await fixture("guided_practice");
    const pending: any = await startQuadraticFormulaAttemptHandler(f.ctx as never, { userId: f.userId, activityId: f.activityId, mode: "guided_practice" }, publication);
    const before = structuredClone(f.table("activity_submissions"));
    await expect(createServerOwnedSubmissionHandler(f.ctx as never, { userId: f.userId, activityId: f.activityId, pendingSubmissionId: pending.pendingSubmissionId, idempotencyKey: pending.idempotencyKey, submissionData: envelope(f.activityId, "guided_practice", 1, 99) } as never, publication)).rejects.toThrow(/pending/);
    expect(f.table("activity_submissions")).toEqual(before);
  });
  it("keeps exact finite keys and seeds", () => {
    expect(IM3_QF_VARIANT_SCHEDULES.guided_practice).toEqual([1, 7, 12, 4]);
    expect(IM3_QF_VARIANT_SCHEDULES.independent_practice).toEqual([
      2, 8, 14, 30,
    ]);
    expect(quadraticFormulaVariantKey("guided_practice", 3)).toMatch(
      /\.variant\.3$/,
    );
    expect(() => quadraticFormulaVariantKey("guided_practice", 4)).toThrow(
      /exhausted/,
    );
  });
});
