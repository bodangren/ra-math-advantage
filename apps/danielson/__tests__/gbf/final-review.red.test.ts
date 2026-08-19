import { computeWeightedReadiness } from '@math-platform/knowledge-space-core';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { GbfEdgeCandidate, GbfGraphRelease, GbfTeacherAssignment } from '../../lib/gbf/contracts';
import {
  GBF_GRAPH_RELEASE,
  composeAssignedGbfGraph,
  resolveAssignedGbfGraph,
  resolveGbfGraphRelease,
  validateGbfGraphRelease,
} from '../../lib/gbf/graph';
import { projectGbfProgress } from '../../lib/gbf/progress';
import {
  GBF_MAPPING_RELEASE,
  GBF_SEQUENCE_RELEASE,
  GBF_UNSEQUENCED_SKILL_IDS,
  validateGbfSourceRelease,
} from '../../lib/gbf/source';
import { buildDanielsonGraph } from '../../lib/proficiency/graph';

const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const V1_SEQUENCE_RELEASE = 'danielson.gbf.sequence.2026-08-19.v1';
const V1_GRAPH_RELEASE = 'danielson.gbf.graph.2026-08-19.v1';
const V2_SEQUENCE_RELEASE = 'danielson.gbf.sequence.2026-09-01.v2';
const V2_GRAPH_RELEASE = 'danielson.gbf.graph.2026-09-01.v2';

function assignment(): GbfTeacherAssignment {
  return {
    assignmentId: 'teacher_gbf_assignments:history-v1',
    organizationId: 'organizations:one',
    teacherProfileId: 'teacher_profiles:one',
    sequenceReleaseId: V1_SEQUENCE_RELEASE,
    graphReleaseId: V1_GRAPH_RELEASE,
    assignedSkillIds: ['danielson.tlac.skill.routine-building'],
    unresolvedGapSkillIds: ['danielson.tlac.skill.knowledge-organizers'],
    assignedByAccountId: 'accounts:leader',
    requestId: 'request:history-v1',
    assignedAt: Date.parse('2026-08-20T00:00:00.000Z'),
  };
}

function draftPrerequisite(release: GbfGraphRelease): GbfEdgeCandidate {
  const candidate = release.edgeCandidates.find((edge) => (
    edge.type === 'prerequisite_for' && edge.reviewStatus === 'draft'
  ));
  if (!candidate) throw new Error('Expected a draft prerequisite candidate.');
  return candidate;
}

function knowledgeState(nodeId: string, mastery: number) {
  return {
    nodeId,
    mastery,
    retention: mastery,
    isProficient: mastery >= 0.9,
    state: mastery >= 0.9 ? 'mastered' as const : mastery > 0 ? 'inProgress' as const : 'untouched' as const,
  };
}

afterEach(() => {
  vi.doUnmock('../../lib/gbf/source');
  vi.doUnmock('../../lib/gbf/graph');
  vi.resetModules();
});

describe('GBF release and source validation', () => {
  it('keeps an assigned v1 projection after v2 becomes the current release', async () => {
    const historicAssignment = assignment();
    const baseline = projectGbfProgress({ assignment: historicAssignment, priorities: [] });
    vi.resetModules();
    vi.doMock('../../lib/gbf/source', async (importOriginal) => {
      const actual = await importOriginal() as typeof import('../../lib/gbf/source');
      return {
        ...actual,
        GBF_SEQUENCE_RELEASE: {
          ...actual.GBF_SEQUENCE_RELEASE,
          releaseId: V2_SEQUENCE_RELEASE,
          actionSteps: actual.GBF_SEQUENCE_RELEASE.actionSteps.slice(1),
        },
        GBF_MAPPING_RELEASE: {
          ...actual.GBF_MAPPING_RELEASE,
          releaseId: 'danielson.gbf.mapping.2026-09-01.v2',
          sequenceReleaseId: V2_SEQUENCE_RELEASE,
          mappings: actual.GBF_MAPPING_RELEASE.mappings.slice(1),
        },
      };
    });
    vi.doMock('../../lib/gbf/graph', async (importOriginal) => {
      const actual = await importOriginal() as typeof import('../../lib/gbf/graph');
      return {
        ...actual,
        GBF_GRAPH_RELEASE: {
          ...actual.GBF_GRAPH_RELEASE,
          releaseId: V2_GRAPH_RELEASE,
          sequenceReleaseId: V2_SEQUENCE_RELEASE,
        },
      };
    });

    const { projectGbfProgress: projectWithV2Current } = await import('../../lib/gbf/progress');
    expect(() => projectWithV2Current({ assignment: historicAssignment, priorities: [] })).not.toThrow();
    expect(projectWithV2Current({ assignment: historicAssignment, priorities: [] }))
      .toEqual(baseline);
  });

  it('rejects changed release links, phase fields, action fields, and action order', () => {
    const variants: Array<{ name: string; change: (input: {
      sequence: typeof GBF_SEQUENCE_RELEASE;
      mapping: typeof GBF_MAPPING_RELEASE;
    }) => void }> = [
      {
        name: 'mapping sequence release link',
        change: ({ mapping }) => { mapping.sequenceReleaseId = 'danielson.gbf.sequence.other'; },
      },
      {
        name: 'phase name and source page',
        change: ({ sequence }) => {
          sequence.phases[0].name = 'Changed phase';
          sequence.phases[0].sourcePage = 99;
        },
      },
      {
        name: 'action phase, page, source number, and name',
        change: ({ sequence }) => {
          sequence.actionSteps[0].phaseId = 'phase_2';
          sequence.actionSteps[0].sourcePage = 2;
          sequence.actionSteps[0].sourceNumber = 99;
          sequence.actionSteps[0].name = 'Changed action';
        },
      },
      {
        name: 'action trajectory',
        change: ({ sequence }) => { sequence.actionSteps[0].trajectory = 'rigor'; },
      },
      {
        name: 'action order',
        change: ({ sequence }) => { sequence.actionSteps.reverse(); },
      },
      {
        name: 'required step path order',
        change: ({ sequence }) => { sequence.actionSteps[0].trajectoryOrder = 99; },
      },
    ];

    for (const variant of variants) {
      const input = {
        sequence: structuredClone(GBF_SEQUENCE_RELEASE),
        mapping: structuredClone(GBF_MAPPING_RELEASE),
      };
      variant.change(input);
      expect(validateGbfSourceRelease(input), variant.name).toMatchObject({ valid: false });
    }
  });

  it('rejects duplicate mapping tuples and an incomplete 63-skill partition', () => {
    const duplicateTuple = structuredClone(GBF_MAPPING_RELEASE);
    const support = duplicateTuple.mappings.find((mapping) => mapping.role === 'support');
    if (!support) throw new Error('Expected a support mapping.');
    duplicateTuple.mappings.push({
      ...support,
      mappingId: `${support.mappingId}.duplicate`,
    });
    expect(validateGbfSourceRelease({
      sequence: GBF_SEQUENCE_RELEASE,
      mapping: duplicateTuple,
    })).toMatchObject({ valid: false });

    const changedTuple = structuredClone(GBF_MAPPING_RELEASE);
    const changedSupport = changedTuple.mappings.find((mapping) => mapping.role === 'support');
    if (!changedSupport) throw new Error('Expected a support mapping.');
    changedSupport.skillId = 'danielson.tlac.skill.strong-voice';
    expect(validateGbfSourceRelease({
      sequence: GBF_SEQUENCE_RELEASE,
      mapping: changedTuple,
    })).toMatchObject({ valid: false });

    const approvedSkillIds = new Set(buildDanielsonGraph().graph.nodes
      .filter((node) => node.kind === 'skill' && node.reviewStatus === 'approved')
      .map((node) => node.id));
    const partition = new Set([
      ...GBF_MAPPING_RELEASE.mappings.map((mapping) => mapping.skillId),
      ...GBF_UNSEQUENCED_SKILL_IDS,
    ]);
    expect(partition).toEqual(approvedSkillIds);
    expect(partition.size).toBe(63);

    const incompletePartition = structuredClone(GBF_MAPPING_RELEASE);
    incompletePartition.unsequencedSkillIds = incompletePartition.unsequencedSkillIds.slice(1);
    expect(validateGbfSourceRelease({
      sequence: GBF_SEQUENCE_RELEASE,
      mapping: incompletePartition,
    })).toMatchObject({ valid: false });
  });

  it('keeps the five preview steps in a distinct source order', () => {
    const previews = GBF_SEQUENCE_RELEASE.actionSteps
      .filter((step) => step.status === 'preview');

    expect(previews.map((step) => step.actionStepId)).toEqual([
      'phase_1.management.preview.least-invasive-intervention',
      'phase_1.management.preview.narrate-positive',
      'phase_1.management.preview.build-momentum',
      'phase_1.management.preview.teacher-radar',
      'phase_1.management.preview.do-it-again',
    ]);
    const previewOrder = previews.map((step) => {
      const orderedStep = step as typeof step & { previewOrder?: number };
      return orderedStep.previewOrder ?? orderedStep.trajectoryOrder;
    });
    expect(new Set(previewOrder).size).toBe(5);
  });
});

describe('GBF graph behavior', () => {
  it('keeps rejected prerequisites out of historical registry graphs after public constants mutate', () => {
    const rejected = GBF_GRAPH_RELEASE.edgeCandidates.find((candidate) => (
      candidate.type === 'prerequisite_for' && candidate.reviewStatus === 'rejected'
    ));
    if (!rejected) throw new Error('Expected a rejected prerequisite candidate.');
    const original = structuredClone(rejected);
    const historicalRelease = resolveGbfGraphRelease({
      sequenceReleaseId: V1_SEQUENCE_RELEASE,
      graphReleaseId: V1_GRAPH_RELEASE,
    });
    if (!historicalRelease) throw new Error('Expected the registered v1 graph release.');

    try {
      rejected.reviewStatus = 'approved';
      rejected.activationState = 'active';

      const resolved = resolveGbfGraphRelease({
        sequenceReleaseId: V1_SEQUENCE_RELEASE,
        graphReleaseId: V1_GRAPH_RELEASE,
      });
      const graph = resolveAssignedGbfGraph(buildDanielsonGraph().graph, assignment());

      expect(resolved).toEqual(historicalRelease);
      expect(resolved?.edgeCandidates.find((candidate) => candidate.id === rejected.id))
        .toMatchObject({ reviewStatus: 'rejected', activationState: 'inactive' });
      expect(graph.edges.find((edge) => edge.id === rejected.id)).toBeUndefined();
    } finally {
      Object.assign(rejected, original);
    }
  });

  it('rejects a missing candidate and a changed candidate rationale', () => {
    const missing = structuredClone(GBF_GRAPH_RELEASE);
    missing.edgeCandidates.pop();
    expect(validateGbfGraphRelease(missing)).toMatchObject({ valid: false });

    const changed = structuredClone(GBF_GRAPH_RELEASE);
    changed.edgeCandidates[0].rationale = 'Changed without a new release.';
    expect(validateGbfGraphRelease(changed)).toMatchObject({ valid: false });
  });

  it('rejects graph release links that no longer refer to frozen source and mapping releases', () => {
    const wrongSequence = structuredClone(GBF_GRAPH_RELEASE);
    wrongSequence.sequenceReleaseId = 'danielson.gbf.sequence.other';
    expect(validateGbfGraphRelease(wrongSequence)).toMatchObject({ valid: false });

    const wrongMapping = structuredClone(GBF_GRAPH_RELEASE);
    wrongMapping.mappingReleaseId = 'danielson.gbf.mapping.other';
    expect(validateGbfGraphRelease(wrongMapping)).toMatchObject({ valid: false });
  });

  it('derives candidate endpoints, order, and trajectories from reviewed source records', () => {
    const variants: Array<{ name: string; change: (candidate: GbfEdgeCandidate) => void }> = [
      {
        name: 'primary mapping mismatch',
        change: (candidate) => { candidate.sourceId = 'danielson.tlac.skill.positive-framing'; },
      },
      {
        name: 'nonconsecutive action step',
        change: (candidate) => {
          candidate.targetActionStepId = 'phase_2.management.1';
          candidate.targetId = 'danielson.tlac.skill.what-to-do';
        },
      },
      {
        name: 'forged trajectory field',
        change: (candidate) => {
          candidate.targetActionStepId = 'phase_1.rigor.1';
          candidate.targetId = 'danielson.tlac.skill.double-plan';
          candidate.sourceTrajectory = 'management';
          candidate.targetTrajectory = 'management';
        },
      },
    ];

    for (const variant of variants) {
      const release = structuredClone(GBF_GRAPH_RELEASE);
      variant.change(draftPrerequisite(release));
      expect(validateGbfGraphRelease(release), variant.name).toMatchObject({ valid: false });
    }
  });

  it('keeps drafts out of KST and proves an active weight 0.5 edge can block readiness', () => {
    const baseGraph = buildDanielsonGraph().graph;
    const candidate = GBF_GRAPH_RELEASE.edgeCandidates.find((edge) => {
      if (edge.type !== 'prerequisite_for' || edge.reviewStatus !== 'draft') return false;
      const release = structuredClone(GBF_GRAPH_RELEASE);
      const active = release.edgeCandidates.find((item) => item.id === edge.id);
      if (!active) return false;
      active.reviewStatus = 'approved';
      active.activationState = 'active';
      return validateGbfGraphRelease(release).valid
        && computeWeightedReadiness(edge.targetId, new Map(), baseGraph).state === 'ready';
    });
    if (!candidate) throw new Error('Expected a calibratable draft prerequisite candidate.');

    const activeRelease = structuredClone(GBF_GRAPH_RELEASE);
    const active = activeRelease.edgeCandidates.find((edge) => edge.id === candidate.id);
    if (!active) throw new Error('Expected the selected candidate.');
    active.reviewStatus = 'approved';
    active.activationState = 'active';
    const state = new Map([[candidate.sourceId, knowledgeState(candidate.sourceId, 0)]]);
    const draftGraph = composeAssignedGbfGraph(baseGraph, GBF_GRAPH_RELEASE);
    const activeGraph = composeAssignedGbfGraph(baseGraph, activeRelease);

    expect(GBF_GRAPH_RELEASE.edgeCandidates.every((edge) => edge.activationState === 'inactive')).toBe(true);
    expect(computeWeightedReadiness(candidate.targetId, state, draftGraph).state).toBe('ready');
    expect(computeWeightedReadiness(candidate.targetId, state, activeGraph)).toEqual({
      score: 0,
      state: 'blocked',
    });
  });

  it('uses the assignment graph resolver in every KST processing and read boundary', () => {
    const requiredCalls = [
      ['convex/proficiency.ts', 2],
      ['convex/observations.ts', 3],
      ['convex/reporting.ts', 2],
    ] as const;

    for (const [file, minimumCalls] of requiredCalls) {
      const source = readFileSync(resolve(APP_ROOT, file), 'utf8');
      const calls = source.match(/\bresolveAssignedGbfGraph\s*\(/g) ?? [];
      expect(calls.length, file).toBeGreaterThanOrEqual(minimumCalls);
    }
  });
});

describe('GBF progress behavior', () => {
  it('does not change an assigned progress projection when no candidate activates', () => {
    const historicAssignment = assignment();
    const first = projectGbfProgress({ assignment: historicAssignment, priorities: [] });
    const second = projectGbfProgress({ assignment: historicAssignment, priorities: [] });

    expect(first).toEqual(second);
    expect(first).toMatchObject({
      sequenceReleaseId: V1_SEQUENCE_RELEASE,
      graphReleaseId: V1_GRAPH_RELEASE,
    });
  });
});
