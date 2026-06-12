// Phase 3 — Task 1: Replace IM1 STUB blueprints with real
// worked-example/guided/independent blueprints wired to generators.
// Phase 3 — Task 2: Re-run projection; verify activities resolve to
// live generators, not stubs. Red phase (TDD).
//
// Contract under test (per measure/tracks/im1-practice-readiness_20260609/
// {plan,spec,test-strategy}.md):
//
//   plan.md Phase 3 — Real Blueprints:
//     - Replace IM1 STUB blueprints with real worked-example/guided/
//       independent blueprints wired to generators
//     - Re-run projection; verify activities resolve to live
//       generators, not stubs
//
//   spec.md FR3 / AC2:
//     "Replace IM1 STUB blueprints with real worked-example/guided/
//      independent blueprints wired to the generators."
//     "IM1 blueprint coverage > 0% (target: the vertical-slice module
//      fully real, remainder tracked with explicit per-skill status)."
//
//   test-strategy.md §1 row Phase 3:
//     Unit: "blueprint zod parse"
//     Contract: "knowledgeBlueprintSchema + generatorKey resolves"
//     Integration: "projection: 0 STUBs in vertical slice"
//   test-strategy.md §5 P3:
//     "Replace each STUB with a real blueprint; assert generatorKey
//      resolves and projectActivities() returns 0 STUBs for the slice
//      module."
//   test-strategy.md §4 guardrails:
//     "Blueprints validate against knowledgeBlueprintSchema
//      (packages/knowledge-space-practice/src/blueprints/schemas.ts)."
//   test-strategy.md §7 Phase 3 Red command:
//     "npm run -w packages/math-content test
//      -- problem-families/im1/__tests__/blueprints" — this file.
//   test-strategy.md §7 Phase 3 Green/closeout gate:
//     "full npm run -w packages/math-content test + bounded
//      projection smoke `node scripts/project-im1-vertical-slice.ts
//      --module=<locked>` (exits non-zero on any STUB)" — Kind B
//      (live-behavior).
//
// Red signal at HEAD (current state per
// apps/integrated-math-1/curriculum/skill-graph/blueprints.json + the
// 2026-05-10 IM1 rollout audit):
//
//   * 138/138 IM1 blueprints carry
//     `"exceptions": [{ "type": "generator", "reason": "Generator not
//     yet implemented for IM1 rollout" }]`
//   * Every `workedExampleSpec` / `guidedPracticeSpec` /
//     `independentPracticeSpec` is the empty object `{}`
//   * No blueprint has a `generatorKey` field at all
//   * The hand-authored projection at
//     `apps/integrated-math-1/curriculum/skill-graph/projection/
//     practice-v1-activity-map.json` therefore renders each activity
//     as a placeholder prompt — proof that the pipeline cannot serve
//     any of the 138 skills today.
//
// All four assertions below target the *production* projection
// (`projectActivityMap` from
// `@math-platform/knowledge-space-practice`) and the production
// zod schema (`knowledgeBlueprintSchema`), not hand-rolled constants.
// This is the Kind B live-behavior proof required by test-strategy §7.
//
// Bounded scope (test-strategy §3 / §7): every filter reads the
// vertical-slice module id from
// `measure/tracks/im1-practice-readiness_20260609/metadata.json
// .verticalSliceModule`. At HEAD that is locked to "1" (six skills).
// A Green commit that "fixes" a non-vertical-slice blueprint will not
// flip these tests, so the contract is tight to the locked scope.
//
// Boundary lint (test-strategy §4): this file lives under
// `packages/math-content/src/problem-families/im1/` and only imports
// (a) sibling modules (`../generators`, `../index`) — both inside
// the package, and (b) `@math-platform/knowledge-space-practice` for
// the projection + schema (a sibling `packages/*` import, explicitly
// permitted by the boundary rule which forbids `apps/*` and
// `convex/_generated/*` only). No app imports. No npm install
// required: knowledge-space-practice is symlinked into the
// monorepo root node_modules and the import already resolves for
// `ci-gate.test.ts` in this package.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { IM1_GENERATORS, type IM1GeneratorEntry } from '../generators';
import {
  knowledgeBlueprintSchema,
  projectActivityMap,
  type ProjectedActivity,
  type KnowledgeBlueprint,
} from '@math-platform/knowledge-space-practice';

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------

const HERE = fileURLToPath(import.meta.url);
const PKG_ROOT = resolve(HERE, '../../../../../../..');
const IM1_ROLLOUT_DIR = resolve(
  PKG_ROOT,
  'apps/integrated-math-1/curriculum/skill-graph',
);
const BLUEPRINTS_JSON = resolve(IM1_ROLLOUT_DIR, 'blueprints.json');
const NODES_JSON = resolve(IM1_ROLLOUT_DIR, 'nodes.json');
const EDGES_JSON = resolve(IM1_ROLLOUT_DIR, 'edges.json');
const METADATA_JSON = resolve(
  PKG_ROOT,
  'measure/tracks/im1-practice-readiness_20260609/metadata.json',
);

const STUB_GENERATOR_REASON = 'Generator not yet implemented for IM1 rollout';
const STUB_GENERATOR_TYPE = 'generator';
const PLACEHOLDER_PROMPT_PREFIX = 'Placeholder: generator not yet available';

type RolloutBlueprint = {
  nodeId: string;
  sourceNodeIds: string[];
  alignmentNodeIds: string[];
  rendererKey: string;
  rendererModeMap: Record<string, string>;
  workedExampleSpec?: Record<string, unknown>;
  guidedPracticeSpec?: Record<string, unknown>;
  independentPracticeSpec?: Record<string, unknown>;
  generatorKey?: string;
  exceptions?: Array<{ type: string; reason: string }>;
  reviewStatus: string;
  metadata: Record<string, unknown>;
};

type BlueprintsFile = { blueprints: RolloutBlueprint[] };

type Node = { id: string; kind: string };
type NodesFile = { nodes: Node[] };
type Edge = {
  sourceId: string;
  targetId: string;
  type: string;
};
type EdgesFile = { edges: Edge[] };

/**
 * Load the vertical-slice module ID from track metadata.
 * @returns Module ID string
 */
function loadVerticalSliceModule(): string {
  const meta = JSON.parse(readFileSync(METADATA_JSON, 'utf-8')) as {
    verticalSliceModule?: string;
  };
  const vsm = String(meta.verticalSliceModule);
  if (!/^[0-9]+$/.test(vsm)) {
    throw new Error(
      `metadata.json.verticalSliceModule is not a numeric module id: ${vsm}`,
    );
  }
  return vsm;
}

/**
 * Load all blueprints from the IM1 rollout blueprints.json.
 * @returns Array of rollout blueprints
 */
function loadBlueprints(): RolloutBlueprint[] {
  const file = JSON.parse(readFileSync(BLUEPRINTS_JSON, 'utf-8')) as BlueprintsFile;
  return file.blueprints;
}

/**
 * Load the IM1 skill graph nodes and edges from rollout JSON files.
 * @returns Object with nodes and edges arrays
 */
function loadGraph(): { nodes: Node[]; edges: Edge[] } {
  return {
    nodes: (JSON.parse(readFileSync(NODES_JSON, 'utf-8')) as NodesFile).nodes,
    edges: (JSON.parse(readFileSync(EDGES_JSON, 'utf-8')) as EdgesFile).edges,
  };
}

/**
 * Load blueprints filtered to the locked vertical-slice module.
 * @returns Array of blueprints for the vertical-slice module
 */
function loadVerticalSliceBlueprints(): RolloutBlueprint[] {
  const vsm = loadVerticalSliceModule();
  return loadBlueprints().filter(
    (b) => String(b.metadata?.module ?? '') === vsm,
  );
}

/**
 * Check if a blueprint's exceptions array contains a STUB generator marker.
 * @param exceptions - Blueprint exceptions array
 * @returns True if a STUB exception is present
 */
function isStubException(exceptions: RolloutBlueprint['exceptions']): boolean {
  if (!Array.isArray(exceptions) || exceptions.length === 0) return false;
  return exceptions.some(
    (e) =>
      e?.type === STUB_GENERATOR_TYPE &&
      typeof e?.reason === 'string' &&
      e.reason.includes('not yet implemented'),
  );
}

/**
 * Convert a rollout blueprint to the KnowledgeBlueprint schema shape.
 * @param b - Rollout blueprint to convert
 * @returns KnowledgeBlueprint-compatible object
 */
function asBlueprint(b: RolloutBlueprint): KnowledgeBlueprint {
  return {
    nodeId: b.nodeId,
    sourceNodeIds: b.sourceNodeIds,
    alignmentNodeIds: b.alignmentNodeIds,
    rendererKey: b.rendererKey,
    rendererModeMap: b.rendererModeMap,
    workedExampleSpec: b.workedExampleSpec as KnowledgeBlueprint['workedExampleSpec'],
    guidedPracticeSpec: b.guidedPracticeSpec as KnowledgeBlueprint['guidedPracticeSpec'],
    independentPracticeSpec: b.independentPracticeSpec as KnowledgeBlueprint['independentPracticeSpec'],
    generatorKey: b.generatorKey,
    reviewStatus: b.reviewStatus as KnowledgeBlueprint['reviewStatus'],
    metadata: b.metadata,
  };
}

/**
 * Build a set of all registered IM1 generator skill ID keys and node IDs.
 * @returns Set of registered identifier strings
 */
function registeredSkillIdKeys(): Set<string> {
  const set = new Set<string>();
  for (const entry of IM1_GENERATORS as Iterable<IM1GeneratorEntry>) {
    set.add(entry.skillIdKey);
    for (const nodeId of entry.nodeIds) set.add(nodeId);
  }
  return set;
}

/**
 * Project activity map from blueprints using the production projector.
 * @param blueprints - Array of rollout blueprints
 * @returns Array of projected activities
 */
function projectionFor(blueprints: RolloutBlueprint[]): ProjectedActivity[] {
  const { nodes, edges } = loadGraph();
  return projectActivityMap(
    nodes as unknown as Parameters<typeof projectActivityMap>[0],
    edges as unknown as Parameters<typeof projectActivityMap>[1],
    blueprints.map(asBlueprint),
  );
}

// ---------------------------------------------------------------------------
// 1. STUB marker must be gone from the vertical-slice blueprints.
//    (Phase 3 Task 1: "Replace IM1 STUB blueprints with real
//    worked-example/guided/independent blueprints".)
//
//    Red signal at HEAD: every vertical-slice blueprint carries the
//    "Generator not yet implemented for IM1 rollout" exception. The
//    test asserts zero STUBs in the slice.
// ---------------------------------------------------------------------------

describe('IM1 vertical-slice blueprints — STUB removal (Phase 3 Task 1)', () => {
  it('the locked vertical-slice module is non-empty (sanity)', () => {
    const slice = loadVerticalSliceBlueprints();
    expect(slice.length).toBeGreaterThan(0);
  });

  it('no vertical-slice blueprint carries the IM1 STUB generator exception', () => {
    const slice = loadVerticalSliceBlueprints();
    const offenders = slice.filter((b) => isStubException(b.exceptions));
    expect(offenders).toEqual([]);
  });

  it('every vertical-slice blueprint has a non-empty generatorKey wired to a registered IM1 generator', () => {
    const slice = loadVerticalSliceBlueprints();
    const registered = registeredSkillIdKeys();

    const missing: Array<{ nodeId: string; reason: string }> = [];
    for (const b of slice) {
      if (!b.generatorKey || b.generatorKey.length === 0) {
        missing.push({ nodeId: b.nodeId, reason: 'missing generatorKey' });
        continue;
      }
      if (!registered.has(b.generatorKey)) {
        missing.push({
          nodeId: b.nodeId,
          reason: `generatorKey "${b.generatorKey}" does not match any IM1_GENERATORS skillIdKey or nodeIds entry`,
        });
      }
    }

    expect(missing).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 2. Spec content is non-stub: every vertical-slice blueprint must carry
//    real workedExampleSpec / guidedPracticeSpec / independentPracticeSpec
//    (or be explicitly opted out of a mode by the rendererModeMap).
//
//    Red signal at HEAD: every spec is the empty object `{}`.
// ---------------------------------------------------------------------------

describe('IM1 vertical-slice blueprints — spec content (Phase 3 Task 1)', () => {
  it('every vertical-slice blueprint validates against knowledgeBlueprintSchema', () => {
    const slice = loadVerticalSliceBlueprints();
    const offenders = slice
      .map((b) => ({ blueprint: b, result: knowledgeBlueprintSchema.safeParse(asBlueprint(b)) }))
      .filter(({ result }) => !result.success)
      .map(({ blueprint, result }) => ({
        nodeId: blueprint.nodeId,
        issues: result.error?.issues.map((issue) => issue.message) ?? [],
      }));

    expect(offenders).toEqual([]);
  });

  it('every worked rendererModeMap entry has a non-empty workedExampleSpec.prompt', () => {
    const slice = loadVerticalSliceBlueprints();
    const offenders: Array<{ nodeId: string; reason: string }> = [];
    for (const b of slice) {
      if (!b.rendererModeMap?.worked) continue;
      const prompt = (b.workedExampleSpec as { prompt?: unknown } | undefined)?.prompt;
      if (typeof prompt !== 'string' || prompt.trim().length === 0) {
        offenders.push({
          nodeId: b.nodeId,
          reason: `workedExampleSpec.prompt is empty/missing (rendererModeMap.worked="${b.rendererModeMap.worked}")`,
        });
      }
    }
    expect(offenders).toEqual([]);
  });

  it('every guided rendererModeMap entry has a non-empty guidedPracticeSpec.scaffoldedPrompt', () => {
    const slice = loadVerticalSliceBlueprints();
    const offenders: Array<{ nodeId: string; reason: string }> = [];
    for (const b of slice) {
      if (!b.rendererModeMap?.guidedPractice) continue;
      const prompt = (b.guidedPracticeSpec as { scaffoldedPrompt?: unknown } | undefined)
        ?.scaffoldedPrompt;
      if (typeof prompt !== 'string' || prompt.trim().length === 0) {
        offenders.push({
          nodeId: b.nodeId,
          reason: `guidedPracticeSpec.scaffoldedPrompt is empty/missing (rendererModeMap.guidedPractice="${b.rendererModeMap.guidedPractice}")`,
        });
      }
    }
    expect(offenders).toEqual([]);
  });

  it('every independent rendererModeMap entry has a non-empty independentPracticeSpec.answerSchema', () => {
    const slice = loadVerticalSliceBlueprints();
    const offenders: Array<{ nodeId: string; reason: string }> = [];
    for (const b of slice) {
      if (!b.rendererModeMap?.independentPractice) continue;
      const answerSchema = (
        b.independentPracticeSpec as { answerSchema?: unknown } | undefined
      )?.answerSchema;
      const isEmpty =
        answerSchema == null ||
        (typeof answerSchema === 'object' &&
          Object.keys(answerSchema as Record<string, unknown>).length === 0);
      if (isEmpty) {
        offenders.push({
          nodeId: b.nodeId,
          reason: `independentPracticeSpec.answerSchema is empty/missing (rendererModeMap.independentPractice="${b.rendererModeMap.independentPractice}")`,
        });
      }
    }
    expect(offenders).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 3. Projection smoke (Phase 3 Task 2: "Re-run projection; verify
//    activities resolve to live generators, not stubs"). Live-behavior
//    Kind B per test-strategy §7: this runs the production
//    `projectActivityMap` over the rollout JSON + the production graph.
//
//    Red signal at HEAD:
//      * Worked/guided/independent rows for a STUB blueprint have
//        `props.prompt` / `scaffoldedPrompt` undefined or empty
//        (because the spec is `{}`).
//      * `srsEligible` is false on every row because the STUB has no
//        `generatorKey` and no `independentPracticeSpec`.
//      * The hand-authored projection today is a separate artifact
//        (apps/integrated-math-1/.../practice-v1-activity-map.json) and
//        uses placeholder prompts — proof that the pipeline still
//        needs replacing. This test runs the production projector and
//        demands a real pipeline output.
// ---------------------------------------------------------------------------

describe('IM1 vertical-slice projection — 0 STUBs (Phase 3 Task 2)', () => {
  it('projectActivityMap produces no placeholder-prompt rows for the vertical slice', () => {
    const slice = loadVerticalSliceBlueprints();
    const rows = projectionFor(slice);

    expect(rows.length).toBeGreaterThan(0);

    const placeholderRows: Array<{
      stableActivityId: string;
      nodeId: string;
      mode: ProjectedActivity['mode'];
      prompt: unknown;
    }> = [];
    for (const row of rows) {
      const prompt = (row.props as { prompt?: unknown; scaffoldedPrompt?: unknown })
        .prompt
        ?? (row.props as { prompt?: unknown; scaffoldedPrompt?: unknown })
          .scaffoldedPrompt;
      if (typeof prompt === 'string' && prompt.startsWith(PLACEHOLDER_PROMPT_PREFIX)) {
        placeholderRows.push({
          stableActivityId: row.stableActivityId,
          nodeId: row.nodeId,
          mode: row.mode,
          prompt,
        });
      }
    }
    expect(placeholderRows).toEqual([]);
  });

  it('every independent_practice projected row for the vertical slice carries a non-empty props.answerSchema (live generator wired)', () => {
    // Stronger signal than `srsEligible === true` alone: the
    // production projector flips srsEligible true whenever
    // independentPracticeSpec is non-null, but STUBs ship the empty
    // object `{}` which is non-null. The only way for the projected
    // answerSchema to be a real, populated object is for the
    // underlying blueprint to carry a real spec — i.e. a real
    // generator wired up. This is the live-behavior gate required by
    // test-strategy §7 row Phase 3.
    const slice = loadVerticalSliceBlueprints();
    const rows = projectionFor(slice);

    const independentRows = rows.filter((r) => r.mode === 'independent_practice');
    expect(independentRows.length).toBeGreaterThan(0);

    const offenders = independentRows
      .filter((r) => {
        const answerSchema = (r.props as { answerSchema?: unknown }).answerSchema;
        return (
          answerSchema == null ||
          typeof answerSchema !== 'object' ||
          Object.keys(answerSchema as Record<string, unknown>).length === 0
        );
      })
      .map((r) => ({
        stableActivityId: r.stableActivityId,
        nodeId: r.nodeId,
        props: r.props,
      }));

    expect(offenders).toEqual([]);
  });

  it('every worked_example projected row for the vertical slice has a non-empty props.prompt', () => {
    const slice = loadVerticalSliceBlueprints();
    const rows = projectionFor(slice);

    const workedRows = rows.filter((r) => r.mode === 'worked_example');
    expect(workedRows.length).toBeGreaterThan(0);

    const offenders = workedRows.filter((r) => {
      const prompt = (r.props as { prompt?: unknown }).prompt;
      return typeof prompt !== 'string' || prompt.trim().length === 0;
    });
    expect(offenders).toEqual([]);
  });
});
