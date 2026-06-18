// Red tests for Phase 4 — Task 1: First-run student flow routing.
//
// Per spec.md FR4: First-run flow that routes new students into the
// placement diagnostic, then to their assigned work.
// Per spec.md AC3: New students are routed into placement; initial
// knowledge state is seeded.
// Per test-strategy.md §6 Phase 4: "Pure flow-router test: new student
// with no placement → `runNewStudentPlacementFlow` invoked once;
// returning student → bypass."
// Per test-strategy.md §4 (item 4): "Placement seeding (FR4 / AC3)
// couples Phase 4 router to existing `runNewStudentPlacementFlow`;
// test must use the existing flow's public types — no parallel
// implementation."
//
// This file targets the pure flow-router that lives in
//   apps/integrated-math-3/lib/onboarding/student-flow.ts
// which does NOT exist yet (Red phase). The Green-phase implementer
// creates that module exporting `routeStudent` and the supporting
// types (`StudentFlowContext`, `StudentFlowDecision`,
// `StudentFlowRouterDeps`, `StudentFlowDestination`,
// `StudentFlowReason`).
//
// Test approach: dependency injection. The router accepts a
// `runPlacement` function as part of its `deps` so the test can
// stub it (count invocations, inject outcomes, simulate failures).
// In production `runPlacement` wraps `runNewStudentPlacementFlow`
// from `@/lib/placement/placement-flow` — the integration is a
// wiring concern for the Green author; this test pins the router's
// pure branching behavior only.

import { describe, it, expect, vi } from 'vitest';

// Public types from the existing placement-flow module — these are
// the types the Phase 4 router composes against (per test-strategy
// §4 item 4: "use the existing flow's public types — no parallel
// implementation").
import type {
  PlacementFlowOutcome,
} from '@/lib/placement/placement-flow';

// Production module — does not exist yet (Red phase).
// The Green-phase implementer creates
//   apps/integrated-math-3/lib/onboarding/student-flow.ts
// exporting routeStudent and the supporting types.
import {
  routeStudent,
  type StudentFlowContext,
  type StudentFlowDecision,
  type StudentFlowRouterDeps,
} from '@/lib/onboarding/student-flow';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const NEW_STUDENT = 'student-new-001';
const RETURNING_STUDENT = 'student-returning-001';

function buildPlacedOutcome(): PlacementFlowOutcome {
  return {
    status: 'placed',
    results: [
      {
        nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
        masteryEstimate: 0.55,
        confidence: 'medium',
      },
    ],
    probesPerformed: 1,
  };
}

function buildSkippedOutcome(): PlacementFlowOutcome {
  return {
    status: 'skipped',
    reason: 'already-placed',
    results: [],
    probesPerformed: 0,
  };
}

interface RecordingDeps extends StudentFlowRouterDeps {
  __callCount: number;
  __callArgs: Array<{ studentId: string; force?: boolean }>;
  __outcome: PlacementFlowOutcome;
}

function makeRecordingDeps(outcome: PlacementFlowOutcome): RecordingDeps {
  const callArgs: Array<{ studentId: string; force?: boolean }> = [];
  return {
    __callCount: 0,
    get callCount() {
      return callArgs.length;
    },
    __callArgs: callArgs,
    __outcome: outcome,
    async runPlacement(studentId, options) {
      callArgs.push({ studentId, force: options?.force });
      this.__callCount = callArgs.length;
      return outcome;
    },
  } as RecordingDeps;
}

function newContext(studentId: string, hasExistingPlacement: boolean): StudentFlowContext {
  return { studentId, hasExistingPlacement };
}

// ---------------------------------------------------------------------------
// Task 4.1.a — New-student routing (FR4 / AC3)
// ---------------------------------------------------------------------------

describe('routeStudent — new student (no prior placement)', () => {
  it('calls runPlacement exactly once for a student with hasExistingPlacement=false', async () => {
    const deps = makeRecordingDeps(buildPlacedOutcome());
    const decision = await routeStudent(newContext(NEW_STUDENT, false), deps);

    expect(deps.callCount).toBe(1);
    expect(deps.__callArgs[0]?.studentId).toBe(NEW_STUDENT);
  });

  it('routes to destination="placement" with reason="new-student"', async () => {
    const deps = makeRecordingDeps(buildPlacedOutcome());
    const decision = await routeStudent(newContext(NEW_STUDENT, false), deps);

    expect(decision.destination).toBe('placement');
    expect(decision.reason).toBe('new-student');
  });

  it('returns the placement outcome from runPlacement on the decision', async () => {
    const outcome = buildPlacedOutcome();
    const deps = makeRecordingDeps(outcome);
    const decision = await routeStudent(newContext(NEW_STUDENT, false), deps);

    expect(decision.placementOutcome).toEqual(outcome);
  });

  it('does not pass force:true to runPlacement for a fresh new student', async () => {
    const deps = makeRecordingDeps(buildPlacedOutcome());
    await routeStudent(newContext(NEW_STUDENT, false), deps);

    expect(deps.__callArgs[0]?.force).toBeUndefined();
  });

  it('does not pass force:true when force is not supplied in the call', async () => {
    const deps = makeRecordingDeps(buildPlacedOutcome());
    await routeStudent(newContext(NEW_STUDENT, false), deps);

    expect(deps.__callArgs[0]?.force).toBeFalsy();
  });
});

// ---------------------------------------------------------------------------
// Task 4.1.b — Returning-student bypass (FR4 / AC3)
// ---------------------------------------------------------------------------
//
// Per test-strategy §4 (item 4): "Placement seeding (FR4 / AC3) couples
// Phase 4 router to existing runNewStudentPlacementFlow". The existing
// flow already short-circuits returning students inside itself — but
// the Phase 4 caller-side guard is the layer that decides whether to
// invoke the flow at all. For returning students the router MUST
// bypass placement entirely (no adapter.probe, no store.upsert).

describe('routeStudent — returning student (already placed)', () => {
  it('does NOT call runPlacement when hasExistingPlacement=true', async () => {
    const deps = makeRecordingDeps(buildSkippedOutcome());
    await routeStudent(newContext(RETURNING_STUDENT, true), deps);

    expect(deps.callCount).toBe(0);
  });

  it('routes to destination="assigned-work" with reason="returning-student"', async () => {
    const deps = makeRecordingDeps(buildSkippedOutcome());
    const decision = await routeStudent(newContext(RETURNING_STUDENT, true), deps);

    expect(decision.destination).toBe('assigned-work');
    expect(decision.reason).toBe('returning-student');
  });

  it('does not attach a placementOutcome on the bypass path', async () => {
    const deps = makeRecordingDeps(buildSkippedOutcome());
    const decision = await routeStudent(newContext(RETURNING_STUDENT, true), deps);

    expect(decision.placementOutcome).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Task 4.1.c — Force re-run (admin/teacher override)
// ---------------------------------------------------------------------------

describe('routeStudent — forced re-run for a returning student', () => {
  it('calls runPlacement once when force=true even for a returning student', async () => {
    const deps = makeRecordingDeps(buildPlacedOutcome());
    const decision = await routeStudent(
      newContext(RETURNING_STUDENT, true),
      deps,
      { force: true },
    );

    expect(deps.callCount).toBe(1);
    expect(deps.__callArgs[0]?.force).toBe(true);
    expect(decision.destination).toBe('placement');
  });

  it('records reason="forced-rerun" when force=true triggers a placement run', async () => {
    const deps = makeRecordingDeps(buildPlacedOutcome());
    const decision = await routeStudent(
      newContext(RETURNING_STUDENT, true),
      deps,
      { force: true },
    );

    expect(decision.reason).toBe('forced-rerun');
  });

  it('returns the fresh placement outcome on a forced re-run', async () => {
    const freshOutcome: PlacementFlowOutcome = {
      status: 'placed',
      results: [
        {
          nodeId: 'math.im3.skill.2.3.multiply-polynomials',
          masteryEstimate: 0.3,
          confidence: 'low',
        },
      ],
      probesPerformed: 3,
    };
    const deps = makeRecordingDeps(freshOutcome);
    const decision = await routeStudent(
      newContext(RETURNING_STUDENT, true),
      deps,
      { force: true },
    );

    expect(decision.placementOutcome).toEqual(freshOutcome);
  });

  it('treats force=true for a new student the same as a new-student run (reason="new-student")', async () => {
    const deps = makeRecordingDeps(buildPlacedOutcome());
    const decision = await routeStudent(
      newContext(NEW_STUDENT, false),
      deps,
      { force: true },
    );

    expect(decision.destination).toBe('placement');
    expect(deps.callCount).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Task 4.1.d — Mixed-batch routing (the spec AC3 requirement)
// ---------------------------------------------------------------------------
//
// Per AC3: "New students are routed into placement; initial knowledge
// state is seeded." A mixed batch of new + returning students in a
// single teacher session must route each to the correct destination.

describe('routeStudent — mixed batch routing (new + returning)', () => {
  it('routes two students with different state to different destinations', async () => {
    const deps = makeRecordingDeps(buildPlacedOutcome());

    const newDecision = await routeStudent(
      newContext('student-A-new', false),
      deps,
    );
    const returningDecision = await routeStudent(
      newContext('student-B-returning', true),
      deps,
    );

    expect(newDecision.destination).toBe('placement');
    expect(returningDecision.destination).toBe('assigned-work');
  });

  it('invokes runPlacement exactly once for the new student and zero times for the returning student', async () => {
    const deps = makeRecordingDeps(buildPlacedOutcome());

    await routeStudent(newContext('student-A-new', false), deps);
    expect(deps.callCount).toBe(1);
    expect(deps.__callArgs[0]?.studentId).toBe('student-A-new');

    await routeStudent(newContext('student-B-returning', true), deps);
    expect(deps.callCount).toBe(1);
  });

  it('preserves the runPlacement call order across mixed-batch invocations', async () => {
    const deps = makeRecordingDeps(buildPlacedOutcome());

    await routeStudent(newContext('a', false), deps);
    await routeStudent(newContext('b', true), deps);
    await routeStudent(newContext('c', false), deps);

    expect(deps.callCount).toBe(2);
    expect(deps.__callArgs[0]?.studentId).toBe('a');
    expect(deps.__callArgs[1]?.studentId).toBe('c');
  });
});

// ---------------------------------------------------------------------------
// Task 4.1.e — Decision shape contract (artifact/contract-strengthening)
// ---------------------------------------------------------------------------
//
// Per test-strategy §4 (item 4): the decision shape is the public API
// the Phase 4 caller (Convex handler / first-run gate) consumes. These
// tests pin the documented shape so future refactors stay compatible.

describe('routeStudent — decision shape contract', () => {
  it('returns a StudentFlowDecision with the documented top-level keys', async () => {
    const deps = makeRecordingDeps(buildPlacedOutcome());
    const decision: StudentFlowDecision = await routeStudent(
      newContext(NEW_STUDENT, false),
      deps,
    );

    expect(decision).toMatchObject({
      destination: expect.stringMatching(/^(placement|assigned-work)$/),
      reason: expect.stringMatching(/^(new-student|returning-student|forced-rerun)$/),
    });
  });

  it('placement-branch decision includes a placementOutcome key', async () => {
    const deps = makeRecordingDeps(buildPlacedOutcome());
    const decision = await routeStudent(
      newContext(NEW_STUDENT, false),
      deps,
    );

    expect(decision).toHaveProperty('placementOutcome');
    expect(decision.placementOutcome).toBeDefined();
  });

  it('bypass-branch decision does NOT include a placementOutcome key', async () => {
    const deps = makeRecordingDeps(buildSkippedOutcome());
    const decision = await routeStudent(
      newContext(RETURNING_STUDENT, true),
      deps,
    );

    expect(decision.placementOutcome).toBeUndefined();
  });

  it('reason field discriminates between the three documented branches', async () => {
    const deps = makeRecordingDeps(buildPlacedOutcome());

    const newDecision = await routeStudent(
      newContext(NEW_STUDENT, false),
      deps,
    );
    const returningDecision = await routeStudent(
      newContext(RETURNING_STUDENT, true),
      deps,
    );
    const forcedDecision = await routeStudent(
      newContext(RETURNING_STUDENT, true),
      deps,
      { force: true },
    );

    expect(newDecision.reason).toBe('new-student');
    expect(returningDecision.reason).toBe('returning-student');
    expect(forcedDecision.reason).toBe('forced-rerun');
  });
});

// ---------------------------------------------------------------------------
// Task 4.1.f — Purity & isolation (the existing lib/placement convention)
// ---------------------------------------------------------------------------

describe('routeStudent — purity & isolation', () => {
  it('does not mutate the input context', async () => {
    const deps = makeRecordingDeps(buildPlacedOutcome());
    const ctx: StudentFlowContext = { studentId: NEW_STUDENT, hasExistingPlacement: false };
    const snapshot = { ...ctx };

    await routeStudent(ctx, deps);

    expect(ctx).toEqual(snapshot);
  });

  it('does not mutate the deps object', async () => {
    const deps = makeRecordingDeps(buildPlacedOutcome());
    const frozenKeys = Object.keys(deps).sort();

    await routeStudent(newContext(NEW_STUDENT, false), deps);

    expect(Object.keys(deps).sort()).toEqual(frozenKeys);
  });

  it('two parallel calls with the same context return identical decisions', async () => {
    const depsA = makeRecordingDeps(buildPlacedOutcome());
    const depsB = makeRecordingDeps(buildPlacedOutcome());

    const [decisionA, decisionB] = await Promise.all([
      routeStudent(newContext(NEW_STUDENT, false), depsA),
      routeStudent(newContext(NEW_STUDENT, false), depsB),
    ]);

    expect(decisionA.destination).toBe(decisionB.destination);
    expect(decisionA.reason).toBe(decisionB.reason);
    expect(decisionA.placementOutcome?.status).toBe(decisionB.placementOutcome?.status);
  });
});

// ---------------------------------------------------------------------------
// Task 4.1.g — Integration surface (proves router composes with the
// existing PlacementFlowOutcome type — no parallel implementation)
// ---------------------------------------------------------------------------

describe('routeStudent — PlacementFlowOutcome round-trip', () => {
  it('passes through the outcome returned by runPlacement without rewriting it', async () => {
    const outcome: PlacementFlowOutcome = {
      status: 'placed',
      results: [
        { nodeId: 'math.im3.skill.3.2.solve-polynomial-equations-by-factoring', masteryEstimate: 0.7, confidence: 'medium' },
        { nodeId: 'math.im3.skill.4.6.solve-radical-equations-in-one-variable-and-identify-extrane', masteryEstimate: 0.4, confidence: 'low' },
      ],
      probesPerformed: 2,
    };
    const deps = makeRecordingDeps(outcome);
    const decision = await routeStudent(newContext(NEW_STUDENT, false), deps);

    expect(decision.placementOutcome).toEqual(outcome);
    expect(decision.placementOutcome?.results).toHaveLength(2);
  });

  it('handles a runPlacement that returns status="skipped" (internal already-placed guard) — decision still records "new-student" reason because the router-level gate fired first', async () => {
    const deps = makeRecordingDeps(buildSkippedOutcome());
    const decision = await routeStudent(newContext(NEW_STUDENT, false), deps);

    expect(decision.destination).toBe('placement');
    expect(decision.reason).toBe('new-student');
    expect(decision.placementOutcome?.status).toBe('skipped');
  });
});