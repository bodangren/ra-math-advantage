import canonicalNodes from "@/curriculum/skill-graph/nodes.json";
import canonicalBlueprints from "@/curriculum/skill-graph/blueprints.json";
import { describe, expect, it, vi } from "vitest";
import { generateQuadraticFormula } from "@math-platform/math-content";
import { convexToJson, jsonToConvex } from "convex/values";
import {
  checkQuadraticFormulaDiscriminantHandler as rawCheckQuadraticFormulaDiscriminantHandler,
  createServerOwnedSubmissionHandler as rawCreateServerOwnedSubmissionHandler,
  startQuadraticFormulaAttemptHandler,
  submitActivity,
  submitAssessment,
} from "@/convex/activities";
import { getActivityById } from "@/convex/activities";
import {
  buildIm3QuadraticFormulaDraftDocuments,
  upsertIm3QuadraticFormulaDrafts,
} from "@/convex/seed/seed_lesson_1_6";
import {
  IM3_QF_DRAFT_MAPPINGS,
  IM3_QF_NODE,
  quadraticFormulaPublicProps,
} from "@/lib/activities/server-grading";
import { getLessonProgress } from "@/convex/student";
import {
  getObjectiveProficiencyHandler,
  getStudentProficiencySummaryHandler,
  getTeacherClassProficiencyHandler,
} from "@/convex/objectiveProficiency";
import { getStudentKnowledgeStateHandler } from "@/convex/student/knowledge_state";
import { submitIm3PublishedEvidenceHandler } from "@/convex/learningEvidence";

function memoryContext() {
  const rows: Record<string, Array<Record<string, any>>> = {};
  let next = 1;
  const table = (name: string) => rows[name] ??= [];
  const db = {
    get: async (...args: string[]) => {
      const id = args.at(-1);
      if (typeof id !== "string" || !id.includes(":")) throw new Error("Invalid Convex ID");
      return (
        Object.values(rows)
          .flat()
        .find((row) => row._id === id) ?? null
      );
    },
    normalizeId: (name: string, id: string) => id.startsWith(`${name}:`) ? id : null,
    query(name: string) {
      return {
        collect: async () => table(name),
        take: async (n: number) => table(name).slice(0, n),
        withIndex(_i: string, configure: (q: any) => unknown) {
          const conditions = new Map<string, unknown>();
          const q = {
            eq(k: string, v: unknown) {
              conditions.set(k, v);
              return q;
            },
          };
          configure(q);
          const selected = () =>
            table(name).filter((row) =>
              [...conditions].every(([k, v]) => row[k] === v),
            );
          return {
            unique: async () => {
              const a = selected();
              if (a.length > 1) throw new Error("non-unique");
              return a[0] ?? null;
            },
            first: async () => selected().at(-1) ?? null,
            collect: async () => selected(),
            take: async (n: number) => selected().slice(0, n),
            order: () => ({ first: async () => selected().at(-1) ?? null, take: async (n: number) => [...selected()].reverse().slice(0, n) }),
            async *[Symbol.asyncIterator]() {
              yield* selected();
            },
          };
        },
      };
    },
    insert: async (name: string, doc: Record<string, unknown>) => {
      const id = `${name}:${next++}`;
      table(name).push({ _id: id, ...structuredClone(doc) });
      return id;
    },
    patch: async (id: string, update: Record<string, unknown>) =>
      Object.assign(
        Object.values(rows)
          .flat()
          .find((row) => row._id === id)!,
        structuredClone(update),
      ),
  };
  const scheduled: unknown[] = [];
  return { ctx: { db, scheduler: { runAfter: async (...args: unknown[]) => { scheduled.push(args); } } }, table, scheduled };
}
const publication = {
  nodes: [{ id: IM3_QF_NODE, kind: "skill", reviewStatus: "draft" }],
  blueprints: [{ nodeId: IM3_QF_NODE, reviewStatus: "draft" }],
};
const pendingByRequest = new WeakMap<
  object,
  Map<string, { id: string; key: string }>
>();

async function createServerOwnedSubmissionHandler(
  ctx: any,
  args: any,
  graph: any = publication,
) {
  const requestKey = `${args.userId}|${args.activityId}|${args.idempotencyKey}`;
  const known = pendingByRequest.get(ctx)?.get(requestKey);
  if (known)
    return rawCreateServerOwnedSubmissionHandler(
      ctx,
      { ...args, pendingSubmissionId: known.id, idempotencyKey: known.key },
      graph,
    );
  const replay = await ctx.db
    .query("activity_submissions")
    .withIndex("by_user_activity_idempotency_key", (q: any) =>
      q
        .eq("userId", args.userId)
        .eq("activityId", args.activityId)
        .eq("idempotencyKey", args.idempotencyKey),
    )
    .unique();
  if (replay) return rawCreateServerOwnedSubmissionHandler(ctx, args, graph);
  const pending = await startQuadraticFormulaAttemptHandler(
    ctx,
    {
      userId: args.userId,
      activityId: args.activityId,
      mode: args.submissionData.mode,
    },
    graph,
  );
  if (pending.state !== "pending")
    throw new Error("Expected pending test attempt");
  const requests = pendingByRequest.get(ctx) ?? new Map();
  requests.set(requestKey, {
    id: pending.pendingSubmissionId,
    key: pending.idempotencyKey,
  });
  pendingByRequest.set(ctx, requests);
  return rawCreateServerOwnedSubmissionHandler(
    ctx,
    {
      ...args,
      pendingSubmissionId: pending.pendingSubmissionId,
      idempotencyKey: pending.idempotencyKey,
      submissionData: { ...args.submissionData, attemptNumber: pending.attemptOrdinal },
    },
    graph,
  );
}

async function checkQuadraticFormulaDiscriminantHandler(
  ctx: any,
  args: any,
  graph: any = publication,
) {
  if (typeof args.rawAnswer !== "string" || args.rawAnswer.length > 160) {
    return rawCheckQuadraticFormulaDiscriminantHandler(ctx, args, graph);
  }
  const pending = await startQuadraticFormulaAttemptHandler(
    ctx,
    {
      userId: args.userId,
      activityId: args.activityId,
      mode: "guided_practice",
    },
    graph,
  );
  if (pending.state !== "pending")
    throw new Error("Expected pending test attempt");
  return rawCheckQuadraticFormulaDiscriminantHandler(
    ctx,
    { ...args, pendingSubmissionId: pending.pendingSubmissionId },
    graph,
  );
}

async function fixture(mode: keyof typeof IM3_QF_DRAFT_MAPPINGS) {
  const mem = memoryContext();
  const userId = "profiles:student";
  mem.table("profiles").push({
    _id: userId,
    username: "student",
    role: "student",
    organizationId: "org",
  });
  mem.table("auth_credentials").push({
    _id: "auth:1",
    profileId: userId,
    username: "student",
    role: "student",
    organizationId: "org",
    isActive: true,
  });
  const activityId = "activities:qf";
  const docs = buildIm3QuadraticFormulaDraftDocuments(
    mode,
    activityId as never,
    1,
  );
  mem.table("activities").push({ _id: activityId, ...docs.activity });
  mem
    .table("practice_variants")
    .push({ _id: "practice_variants:qf", ...docs.variant });
  mem.table("practice_items").push({ _id: "practice_items:qf", ...docs.item });
  const problem = generateQuadraticFormula({
    seed: IM3_QF_DRAFT_MAPPINGS[mode].seed,
  });
  const [x1, x2 = ""] = problem.roots.map((r) => r.value);
  const submissionData = {
    contractVersion: "practice.v1",
    activityId,
    mode,
    status: "submitted",
    attemptNumber: 1,
    submittedAt: "2026-09-09T00:00:00.000Z",
    answers: { discriminant: problem.discriminant, x1, x2 },
    parts: [
      { partId: "x2", rawAnswer: x2 },
      { partId: "discriminant", rawAnswer: problem.discriminant, hintsUsed: 2 },
      { partId: "x1", rawAnswer: x1 },
    ],
  };
  return { ...mem, userId, activityId, submissionData };
}

function addLessonSection(
  f: Awaited<ReturnType<typeof fixture>>,
  content: Record<string, unknown> = {
    componentKey: "quadratic-formula",
    activityId: f.activityId,
  },
) {
  f.table("lessons").push({ _id: "lessons:qf", slug: "qf-projection", title: "QF", unitNumber: 1, orderIndex: 6 });
  f.table("lesson_versions").push({ _id: "lesson_versions:qf", lessonId: "lessons:qf", version: 1, status: "published" });
  f.table("phase_versions").push({ _id: "phase_versions:qf", lessonVersionId: "lesson_versions:qf", phaseNumber: 1, phaseType: "guided_practice" });
  f.table("phase_sections").push({ _id: "phase_sections:qf", phaseVersionId: "phase_versions:qf", sequenceOrder: 1, sectionType: "activity", content: structuredClone(content) });
}

async function projectedQfContent(f: Awaited<ReturnType<typeof fixture>>) {
  const result = await (getLessonProgress as unknown as { _handler(ctx: unknown, args: unknown): Promise<any> })._handler(f.ctx, { userId: f.userId, lessonIdentifier: "qf-projection" });
  return result.phases[0].sections[0].content as Record<string, unknown>;
}

describe("draft quadratic-formula server writer", () => {
  it.each(["guided_practice", "independent_practice"] as const)("projects the exact public %s identity into a minimal lesson section", async mode => {
    const f = await fixture(mode);
    addLessonSection(f);
    const content = await projectedQfContent(f);
    expect(content).toEqual({
      activityId: f.activityId,
      componentKey: "quadratic-formula",
      stableActivityId: IM3_QF_DRAFT_MAPPINGS[mode].stableActivityId,
      masteryNodeId: IM3_QF_NODE,
      learningEvidenceMode: mode,
      srsEligible: false,
      activityProps: quadraticFormulaPublicProps(mode, IM3_QF_DRAFT_MAPPINGS[mode].seed),
    });
    expect(JSON.stringify(content)).not.toMatch(/seed|variantKey|privateSentinel|canonicalRoots|gradingConfig|approval/);
  });

  it("derives the mode from the physical stable activity ID", async () => {
    const f = await fixture("guided_practice");
    addLessonSection(f, {
      activityId: f.activityId,
      componentKey: "quadratic-formula",
      stableActivityId: IM3_QF_DRAFT_MAPPINGS.independent_practice.stableActivityId,
      learningEvidenceMode: "independent_practice",
    });
    const content = await projectedQfContent(f);
    expect(content).toMatchObject({
      stableActivityId: IM3_QF_DRAFT_MAPPINGS.guided_practice.stableActivityId,
      learningEvidenceMode: "guided_practice",
      activityProps: { presentationMode: "guided" },
    });
  });

  it.each([
    ["stable ID", (activity: Record<string, any>) => { activity.stableActivityId = "wrong"; }],
    ["component key", (activity: Record<string, any>) => { activity.componentKey = "step-by-step-solver"; }],
    ["mastery node", (activity: Record<string, any>) => { activity.masteryNodeId = "wrong"; }],
    ["SRS flag", (activity: Record<string, any>) => { activity.srsEligible = true; }],
    ["approval", (activity: Record<string, any>) => { activity.approval = { status: "approved" }; }],
    ["public props", (activity: Record<string, any>) => { activity.props.prompt = "changed"; }],
    ["presentation mode", (activity: Record<string, any>) => { activity.props.presentationMode = "independent"; }],
  ])("makes a claimed QF section unavailable for an incoherent %s", async (_label, change) => {
    const f = await fixture("guided_practice");
    const activity = f.table("activities")[0];
    change(activity);
    addLessonSection(f, { activityId: f.activityId, componentKey: "quadratic-formula", stableActivityId: IM3_QF_DRAFT_MAPPINGS.independent_practice.stableActivityId, masteryNodeId: IM3_QF_NODE, learningEvidenceMode: "independent_practice", srsEligible: false, activityProps: quadraticFormulaPublicProps("independent_practice", IM3_QF_DRAFT_MAPPINGS.independent_practice.seed) });
    expect(await projectedQfContent(f)).toEqual({ activityId: f.activityId, componentKey: "unavailable" });
  });

  it("makes a missing claimed QF activity unavailable", async () => {
    const f = await fixture("guided_practice");
    f.table("activities").length = 0;
    addLessonSection(f);
    expect(await projectedQfContent(f)).toEqual({ activityId: f.activityId, componentKey: "unavailable" });
  });

  it("makes a malformed QF activity ID unavailable without a raw database read", async () => {
    const f = await fixture("guided_practice");
    addLessonSection(f, { activityId: "not-a-convex-id", componentKey: "quadratic-formula" });
    await expect(projectedQfContent(f)).resolves.toEqual({ activityId: "not-a-convex-id", componentKey: "unavailable" });
  });

  it("leaves an unrelated activity section unchanged", async () => {
    const f = await fixture("guided_practice");
    const content = { activityId: "activities:other", componentKey: "step-by-step-solver" };
    addLessonSection(f, content);
    expect(await projectedQfContent(f)).toEqual(content);
  });

  it("fails closed for a mastery-node-only QF claim with an unrelated physical activity", async () => {
    const f = await fixture("guided_practice");
    const activity = f.table("activities")[0];
    activity.componentKey = "step-by-step-solver";
    activity.stableActivityId = "other.activity";
    activity.masteryNodeId = "other.node";
    addLessonSection(f, { activityId: f.activityId, componentKey: "step-by-step-solver", masteryNodeId: IM3_QF_NODE });
    expect(await projectedQfContent(f)).toEqual({ activityId: f.activityId, componentKey: "unavailable" });
  });

  it("constructs the QF projection without cached section fields", async () => {
    const f = await fixture("guided_practice");
    addLessonSection(f, {
      activityId: f.activityId,
      componentKey: "quadratic-formula",
      privateSeed: 99,
      variantKey: "private.variant",
      gradingConfig: { answer: "private" },
      approval: { status: "approved" },
    });
    expect(await projectedQfContent(f)).toEqual({
      activityId: f.activityId,
      componentKey: "quadratic-formula",
      stableActivityId: IM3_QF_DRAFT_MAPPINGS.guided_practice.stableActivityId,
      masteryNodeId: IM3_QF_NODE,
      learningEvidenceMode: "guided_practice",
      srsEligible: false,
      activityProps: quadraticFormulaPublicProps("guided_practice", IM3_QF_DRAFT_MAPPINGS.guided_practice.seed),
    });
  });

  it("does not let QF identity bypass the protected selected Worked source", async () => {
    const f = await fixture("guided_practice");
    f.table("lessons").push({ _id: "lessons:qf", slug: "module-1-lesson-1", title: "QF", unitNumber: 1, orderIndex: 1 });
    f.table("lesson_versions").push({ _id: "lesson_versions:qf", lessonId: "lessons:qf", version: 1, status: "published" });
    f.table("phase_versions").push({ _id: "phase_versions:qf", lessonVersionId: "lesson_versions:qf", phaseNumber: 4, phaseType: "guided_practice" });
    f.table("phase_sections").push({ _id: "phase_sections:qf", phaseVersionId: "phase_versions:qf", sequenceOrder: 2, sectionType: "activity", content: { activityId: f.activityId, componentKey: "quadratic-formula" } });
    const result = await (getLessonProgress as unknown as { _handler(ctx: unknown, args: unknown): Promise<any> })._handler(f.ctx, { userId: f.userId, lessonIdentifier: "module-1-lesson-1" });
    expect(result.phases[0].sections[0].content).toEqual({ activityId: f.activityId, componentKey: "unavailable" });
  });
  it("creates, round-trips, replays, and keeps request attempt telemetry separate from ordinal", async () => {
    const f = await fixture("guided_practice");
    const input = {
      userId: f.userId,
      activityId: f.activityId,
      idempotencyKey: "same",
      submissionData: f.submissionData,
    };
    const first = await createServerOwnedSubmissionHandler(
      f.ctx as never,
      input as never,
      publication,
    );
    const stored = jsonToConvex(
      convexToJson(f.table("activity_submissions")[0]),
    ) as Record<string, any>;
    f.table("activity_submissions")[0] = stored;
    const replay = await createServerOwnedSubmissionHandler(
      f.ctx as never,
      input as never,
      publication,
    );
    expect(replay).toEqual(first);
    expect(stored.attemptOrdinal).toBe(1);
    expect(stored.submissionData.attemptNumber).toBe(1);
    expect(stored.masteryContractVersion).toBeUndefined();
    const second = await createServerOwnedSubmissionHandler(
      f.ctx as never,
      { ...input, idempotencyKey: "next" } as never,
      publication,
    );
    expect(second.submissionId).not.toBe(first.submissionId);
    expect(f.table("activity_submissions")[1].attemptOrdinal).toBe(2);
    expect(
      f.table("activity_submissions")[1].submissionData.attemptNumber,
    ).toBe(2);
  });

  it.each(['attemptNumber', 'submittedAt', 'partTelemetry'] as const)('rejects replay changes to %s', async field => {
    const f = await fixture('independent_practice'); const input = { userId: f.userId, activityId: f.activityId, idempotencyKey: 'same', submissionData: f.submissionData };
    await createServerOwnedSubmissionHandler(f.ctx as never, input as never, publication);
    const changed = structuredClone(f.submissionData);
    if (field === 'attemptNumber') changed.attemptNumber++;
    if (field === 'submittedAt') changed.submittedAt = '2026-09-09T00:00:01.000Z';
    if (field === 'partTelemetry') changed.parts[0].hintsUsed = 8;
    await expect(createServerOwnedSubmissionHandler(f.ctx as never, { ...input, submissionData: changed } as never, publication)).rejects.toThrow('idempotency_conflict');
  });

  it('requires exact unreviewed storage and draft publication', async () => {
    const f = await fixture('guided_practice'); const input = { userId: f.userId, activityId: f.activityId, idempotencyKey: 'k', submissionData: f.submissionData };
    f.table('activities')[0].approval.status = 'approved';
    await expect(createServerOwnedSubmissionHandler(f.ctx as never, input as never, publication)).rejects.toThrow(/authority/);
    f.table('activities')[0].approval.status = 'unreviewed'; f.table('practice_items').push({ ...f.table('practice_items')[0], _id: 'practice_items:duplicate' });
    await expect(createServerOwnedSubmissionHandler(f.ctx as never, input as never, publication)).rejects.toThrow(/relation/);
  });

  it('blocks both generic client-owned write paths', async () => {
    for (const mutation of [submitActivity, submitAssessment]) {
      const f = await fixture('guided_practice'); const handler = mutation as unknown as { _handler(ctx: unknown, args: unknown): Promise<unknown> };
      await expect(handler._handler(f.ctx, { userId: f.userId, activityId: f.activityId, submissionData: f.submissionData, score: 3, maxScore: 3 })).rejects.toThrow(/server-owned create path/);
      expect(f.table('activity_submissions')).toHaveLength(0);
    }
  });

  it('blocks generic writes when only the physical item relation identifies QF', async () => {
    for (const mutation of [submitActivity, submitAssessment]) {
      const f = await fixture('guided_practice');
      Object.assign(f.table('activities')[0], { stableActivityId: 'other', masteryNodeId: 'other', componentKey: 'other' });
      const handler = mutation as unknown as { _handler(ctx: unknown, args: unknown): Promise<unknown> };
      await expect(handler._handler(f.ctx, { userId: f.userId, activityId: f.activityId, submissionData: f.submissionData, score: 3, maxScore: 3 })).rejects.toThrow(/server-owned create path/);
      expect(f.table('activity_submissions')).toHaveLength(0);
    }
  });

  it('blocks duplicate physical links that include QF and permits unrelated valid multi-item activity links', async () => {
    for (const mutation of [submitActivity, submitAssessment]) {
      const f = await fixture('guided_practice');
      Object.assign(f.table('activities')[0], { stableActivityId: 'other', masteryNodeId: 'other', componentKey: 'other' });
      f.table('practice_items').push({ _id: 'practice_items:other', activityId: f.activityId, variantKey: 'other' });
      f.table('practice_variants').push({ _id: 'practice_variants:other', variantKey: 'other', componentKey: 'other' });
      const handler = mutation as unknown as { _handler(ctx: unknown, args: unknown): Promise<unknown> };
      await expect(handler._handler(f.ctx, { userId: f.userId, activityId: f.activityId, submissionData: f.submissionData, score: 3, maxScore: 3 })).rejects.toThrow(/server-owned create path/);
    }
    const f = await fixture('guided_practice');
    Object.assign(f.table('activities')[0], { stableActivityId: 'other', masteryNodeId: 'other', componentKey: 'other' });
    f.table('practice_variants')[0].componentKey = 'other';
    f.table('practice_items').push({ _id: 'practice_items:other', activityId: f.activityId, variantKey: 'other-2' });
    f.table('practice_variants').push({ _id: 'practice_variants:other', variantKey: 'other-2', componentKey: 'other' });
    const handler = submitAssessment as unknown as { _handler(ctx: unknown, args: unknown): Promise<unknown> };
    await expect(handler._handler(f.ctx, { userId: f.userId, activityId: f.activityId, submissionData: f.submissionData, score: 3, maxScore: 3 })).resolves.toBeTruthy();
  });

  it('finds a QF relation after two unrelated physical links', async () => {
    for (const mutation of [submitActivity, submitAssessment]) {
      const f = await fixture('guided_practice');
      Object.assign(f.table('activities')[0], { stableActivityId: 'other', masteryNodeId: 'other', componentKey: 'other' });
      const qfItem = f.table('practice_items').shift()!;
      for (const suffix of ['a', 'b']) {
        f.table('practice_items').push({ _id: `practice_items:${suffix}`, activityId: f.activityId, variantKey: `other-${suffix}` });
        f.table('practice_variants').push({ _id: `practice_variants:${suffix}`, variantKey: `other-${suffix}`, componentKey: 'other' });
      }
      f.table('practice_items').push(qfItem);
      const handler = mutation as unknown as { _handler(ctx: unknown, args: unknown): Promise<unknown> };
      await expect(handler._handler(f.ctx, { userId: f.userId, activityId: f.activityId, submissionData: f.submissionData, score: 3, maxScore: 3 })).rejects.toThrow(/server-owned create path/);
      expect(f.table('activity_submissions')).toHaveLength(0);
    }
  });

  it('rejects an approved graph state', async () => {
    const f = await fixture('guided_practice');
    await expect(createServerOwnedSubmissionHandler(f.ctx as never, { userId: f.userId, activityId: f.activityId, idempotencyKey: 'k', submissionData: f.submissionData } as never, {
      nodes: [{ id: IM3_QF_NODE, kind: 'skill', reviewStatus: 'approved' }], blueprints: [{ nodeId: IM3_QF_NODE, reviewStatus: 'approved' }],
    })).rejects.toThrow(/draft graph state/);
  });

  it.each([
    { nodes: [], blueprints: [{ nodeId: IM3_QF_NODE, reviewStatus: 'draft' }] },
    { nodes: [{ id: IM3_QF_NODE, kind: 'concept', reviewStatus: 'draft' }], blueprints: [{ nodeId: IM3_QF_NODE, reviewStatus: 'draft' }] },
    { nodes: [{ id: IM3_QF_NODE, kind: 'skill', reviewStatus: 'draft' }, { id: IM3_QF_NODE, kind: 'skill', reviewStatus: 'draft' }], blueprints: [{ nodeId: IM3_QF_NODE, reviewStatus: 'draft' }] },
    { nodes: [{ id: IM3_QF_NODE, kind: 'skill', reviewStatus: 'draft' }], blueprints: [{ nodeId: IM3_QF_NODE, reviewStatus: 'draft' }, { nodeId: IM3_QF_NODE, reviewStatus: 'draft' }] },
  ])('rejects missing, malformed, or duplicate publication authority', async badPublication => {
    const f = await fixture('guided_practice');
    await expect(createServerOwnedSubmissionHandler(f.ctx as never, { userId: f.userId, activityId: f.activityId, idempotencyKey: 'k', submissionData: f.submissionData } as never, badPublication)).rejects.toThrow(/draft graph state/);
  });

  it('executes draft upserts, replays coherently, and rejects changed public content', async () => {
    const f = memoryContext();
    await upsertIm3QuadraticFormulaDrafts(f.ctx as never, 10);
    expect(f.table('activities')).toHaveLength(2); expect(f.table('practice_variants')).toHaveLength(2); expect(f.table('practice_items')).toHaveLength(2);
    await upsertIm3QuadraticFormulaDrafts(f.ctx as never, 20);
    expect(f.table('activities')).toHaveLength(2); expect(f.table('practice_variants')).toHaveLength(2); expect(f.table('practice_items')).toHaveLength(2);
    const before = structuredClone(f.table('activities')[0]);
    f.table('activities')[0].props.equation = 'changed = 0';
    await expect(upsertIm3QuadraticFormulaDrafts(f.ctx as never, 30)).rejects.toThrow(/content changed/);
    expect(f.table('activities')[0].props.equation).toBe('changed = 0');
    expect(f.table('practice_variants')).toHaveLength(2);
    expect(before._id).toBe(f.table('activities')[0]._id);
  });

  it('keeps private QF variant metadata out of all named read consumers', async () => {
    const f = await fixture('guided_practice');
    f.table('practice_variants')[0].metadata.privateSentinel = 'PRIVATE-QF-SEED';
    f.table('lessons').push({ _id: 'lessons:1', slug: 'module-1-lesson-6', title: 'L1.6', unitNumber: 1, orderIndex: 6 });
    f.table('lesson_versions').push({ _id: 'lesson_versions:1', lessonId: 'lessons:1', version: 1, status: 'published' });
    f.table('phase_versions').push({ _id: 'phase_versions:1', lessonVersionId: 'lesson_versions:1', phaseNumber: 1, title: 'Synthetic read fixture', phaseType: 'learn' });
    f.table('phase_sections').push({ _id: 'phase_sections:1', phaseVersionId: 'phase_versions:1', sequenceOrder: 1, sectionType: 'activity', content: { componentKey: 'quadratic-formula', activityId: f.activityId, props: f.table('activities')[0].props } });
    f.table('srs_cards').push({ _id: 'srs_cards:qf', studentId: f.userId, objectiveId: IM3_QF_NODE, variantKey: f.table('practice_variants')[0].variantKey, stability: 1, difficulty: 5, state: 'new', dueDate: '2026-09-09', elapsedDays: 0, scheduledDays: 0, reps: 0, lapses: 0, createdAt: 1, updatedAt: 1 });
    f.table('class_enrollments').push({ _id: 'class_enrollments:1', classId: 'classes:1', studentId: f.userId, status: 'active' });
    const activityRead = await (getActivityById as unknown as { _handler(ctx: unknown, args: unknown): Promise<unknown> })._handler(f.ctx, { activityId: f.activityId });
    const lessonRead = await (getLessonProgress as unknown as { _handler(ctx: unknown, args: unknown): Promise<unknown> })._handler(f.ctx, { userId: f.userId, lessonIdentifier: 'module-1-lesson-6' });
    const objective = await getObjectiveProficiencyHandler(f.ctx as never, { studentId: f.userId, objectiveId: IM3_QF_NODE });
    const student = await getStudentProficiencySummaryHandler(f.ctx as never, { studentId: f.userId });
    const teacher = await getTeacherClassProficiencyHandler(f.ctx as never, { classId: 'classes:1' });
    const knowledge = await getStudentKnowledgeStateHandler(f.ctx as never, { studentId: f.userId as never });
    expect(activityRead).toMatchObject({ id: f.activityId, componentKey: 'quadratic-formula' });
    expect((lessonRead as any).phases[0].sections[0].content.activityId).toBe(f.activityId);
    expect(objective).toMatchObject({ objectiveId: IM3_QF_NODE });
    expect(JSON.stringify(student)).toContain(IM3_QF_NODE);
    expect(JSON.stringify(teacher)).toContain(IM3_QF_NODE);
    expect(JSON.stringify(knowledge)).toContain(IM3_QF_NODE);
    for (const result of [activityRead, lessonRead, objective, student, teacher, knowledge]) {
      const serialized = JSON.stringify(result);
      expect(serialized).not.toContain('PRIVATE-QF-SEED');
      expect(serialized).not.toContain('privateSentinel');
      expect(serialized).not.toContain('canonicalRoots');
    }
  });

  it('rejects draft QF learning evidence with zero effects', async () => {
    const f = await fixture('guided_practice');
    const stored = await createServerOwnedSubmissionHandler(f.ctx as never, { userId: f.userId, activityId: f.activityId, idempotencyKey: 'evidence', submissionData: f.submissionData } as never, publication);
    await expect(submitIm3PublishedEvidenceHandler(f.ctx as never, { learnerId: f.userId as never, submissionId: stored.submissionId as never })).resolves.toEqual({ accepted: false, reason: 'submission_not_found' });
    for (const table of ['learning_evidence', 'learning_evidence_receipts', 'student_competency', 'srs_cards', 'srs_review_log']) expect(f.table(table)).toHaveLength(0);
    expect(f.scheduled).toHaveLength(0);
  });
});


describe('Guided discriminant check', () => {
  const check = (f: Awaited<ReturnType<typeof fixture>>, rawAnswer: string, graph = publication) =>
    checkQuadraticFormulaDiscriminantHandler(f.ctx as never, { userId: f.userId, activityId: f.activityId, fieldId: 'discriminant', rawAnswer } as never, graph);

  it("returns only correctness and does not write or schedule", async () => {
    const f = await fixture("guided_practice");
    expect(
      await check(f, String(f.submissionData.answers.discriminant)),
    ).toEqual({ isCorrect: true });
    const insert = vi.spyOn(f.ctx.db, "insert");
    const patch = vi.spyOn(f.ctx.db, "patch");
    const before = structuredClone(
      [
        "activities",
        "practice_items",
        "practice_variants",
        "activity_submissions",
      ].map(f.table),
    );
    expect(await check(f, "not a number")).toEqual({ isCorrect: false });
    expect(
      await check(f, String(f.submissionData.answers.discriminant + 1)),
    ).toEqual({ isCorrect: false });
    expect(
      [
        "activities",
        "practice_items",
        "practice_variants",
        "activity_submissions",
      ].map(f.table),
    ).toEqual(before);
    expect(insert).not.toHaveBeenCalled();
    expect(patch).not.toHaveBeenCalled();
    expect(f.scheduled).toEqual([]);
  });

  it.each(['inactive', 'identity', 'independent', 'missingItem', 'duplicateItem', 'reverseItem', 'missingVariant', 'duplicateVariant', 'seed', 'equation', 'approval', 'oversize', 'graph'] as const)('rejects %s before producing a decision', async cause => {
    const f = await fixture(cause === 'independent' ? 'independent_practice' : 'guided_practice');
    if (cause === 'inactive') f.table('auth_credentials')[0].isActive = false;
    if (cause === 'identity') f.table('auth_credentials')[0].profileId = 'profiles:other';
    if (cause === 'missingItem') f.table('practice_items').length = 0;
    if (cause === 'duplicateItem') f.table('practice_items').push({ ...f.table('practice_items')[0], _id: 'practice_items:copy' });
    if (cause === 'reverseItem') f.table('practice_items').push({ ...f.table('practice_items')[0], _id: 'practice_items:other', activityId: 'activities:other' });
    if (cause === 'missingVariant') f.table('practice_variants').length = 0;
    if (cause === 'duplicateVariant') f.table('practice_variants').push({ ...f.table('practice_variants')[0], _id: 'practice_variants:copy' });
    if (cause === 'seed') f.table('practice_variants')[0].metadata.seed++;
    if (cause === 'equation') f.table('activities')[0].props.equation = 'x^2 = 0';
    if (cause === 'approval') f.table('activities')[0].approval.status = 'approved';
    const graph = cause === 'graph' ? { ...publication, nodes: [...publication.nodes, ...publication.nodes] } : publication;
    await expect(check(f, cause === 'oversize' ? '1'.repeat(161) : '1', graph)).rejects.toThrow();
    expect(f.table('activity_submissions')).toHaveLength(0);
    expect(f.scheduled).toEqual([]);
  });
});


describe('QF canonical graph integration', () => {
  it.each(['guided_practice', 'independent_practice'] as const)('grades %s using the default canonical publication', async mode => {
    const f = await fixture(mode);
    const input = { userId: f.userId, activityId: f.activityId, idempotencyKey: 'canonical', submissionData: f.submissionData };
    const result = await createServerOwnedSubmissionHandler(f.ctx as never, input as never);
    expect(result.score).toBe(result.maxScore);
    expect(result.maxScore).toBeGreaterThan(0);
    const rows = f.table('activity_submissions');
    expect(rows).toHaveLength(1);
    expect(rows[0].masteryContractVersion).toBeUndefined();
    expect(rows[0].submissionData.status).toBe('graded');
    expect(f.scheduled).toEqual([]);
      expect(rows[0].masteryContractVersion).toBeUndefined();
      expect(rows[0].submissionData.status).toBe("graded");
      expect(f.scheduled).toEqual([]);
      if (mode === "guided_practice") {
        const decision = await checkQuadraticFormulaDiscriminantHandler(
          f.ctx as never,
          {
            userId: f.userId,
            activityId: f.activityId,
            fieldId: "discriminant",
            rawAnswer: String(f.submissionData.answers.discriminant),
          } as never,
        );
        expect(decision).toEqual({ isCorrect: false });
        expect(rows).toHaveLength(2);
      }
    },
  );

  it.each(['missing', 'duplicate', 'approved'] as const)('keeps the actual publication guard when the QF blueprint is %s', async invalid => {
    const f = await fixture('guided_practice');
    const blueprint = canonicalBlueprints.blueprints.find(row => row.nodeId === IM3_QF_NODE);
    expect(blueprint).toBeDefined();
    const other = canonicalBlueprints.blueprints.filter(row => row.nodeId !== IM3_QF_NODE);
    const blueprints = invalid === 'missing' ? other : invalid === 'duplicate'
      ? [...other, blueprint!, blueprint!] : [...other, { ...blueprint!, reviewStatus: 'approved' }];
    const brokenPublication = { nodes: canonicalNodes.nodes, blueprints };
    await expect(createServerOwnedSubmissionHandler(f.ctx as never, { userId: f.userId, activityId: f.activityId, idempotencyKey: 'invalid', submissionData: f.submissionData } as never, brokenPublication)).rejects.toThrow(/draft graph state/);
    await expect(checkQuadraticFormulaDiscriminantHandler(f.ctx as never, { userId: f.userId, activityId: f.activityId, fieldId: 'discriminant', rawAnswer: '45' } as never, brokenPublication)).rejects.toThrow(/draft graph state/);
    expect(f.table('activity_submissions')).toHaveLength(0);
    expect(f.scheduled).toEqual([]);
  });
});
