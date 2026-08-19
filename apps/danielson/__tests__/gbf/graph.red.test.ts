import { getPrerequisiteCycles } from '@math-platform/knowledge-space-core';
import { describe, expect, it } from 'vitest';

import {
  GBF_GRAPH_RELEASE,
  buildGbfEdgeCandidates,
  composeAssignedGbfGraph,
  validateGbfGraphRelease,
} from '../../lib/gbf/graph';
import { buildDanielsonGraph } from '../../lib/proficiency/graph';

describe('GBF graph release', () => {
  it('creates the exact support and consecutive-step prerequisite candidates', () => {
    const candidates = buildGbfEdgeCandidates();
    const support = candidates.filter((edge) => edge.type === 'supports');
    const prerequisites = candidates.filter((edge) => edge.type === 'prerequisite_for');

    expect(support).toHaveLength(46);
    expect(prerequisites).toHaveLength(23);
    expect(new Set(candidates.map((edge) => edge.id)).size).toBe(candidates.length);
    expect(candidates.every((edge) => edge.weight > 0 && edge.weight < 1)).toBe(true);
    expect(candidates.every((edge) => edge.activationState === 'inactive')).toBe(true);
    expect(prerequisites.every((edge) => edge.sourceTrajectory === edge.targetTrajectory)).toBe(true);
  });

  it('rejects the four unsafe prerequisite candidates and activates none by default', () => {
    const prerequisites = GBF_GRAPH_RELEASE.edgeCandidates
      .filter((edge) => edge.type === 'prerequisite_for');
    const rejected = prerequisites.filter((edge) => edge.reviewStatus === 'rejected');

    expect(rejected).toHaveLength(4);
    expect(rejected.map((edge) => [edge.sourceId, edge.targetId])).toEqual(expect.arrayContaining([
      ['danielson.tlac.skill.double-plan', 'danielson.tlac.skill.double-plan'],
      ['danielson.tlac.skill.what-to-do', 'danielson.tlac.skill.routine-building'],
      ['danielson.tlac.skill.least-invasive-intervention', 'danielson.tlac.skill.means-of-participation'],
      ['danielson.tlac.skill.habits-of-discussion', 'danielson.tlac.skill.break-it-down'],
    ]));
    expect(GBF_GRAPH_RELEASE.edgeCandidates.some((edge) => edge.activationState === 'active'))
      .toBe(false);
    expect(validateGbfGraphRelease(GBF_GRAPH_RELEASE)).toEqual({ valid: true, issues: [] });
  });

  it('adds only approved active prerequisites to an assigned KST graph', () => {
    const release = structuredClone(GBF_GRAPH_RELEASE);
    const safe = release.edgeCandidates.find((edge) => (
      edge.type === 'prerequisite_for' && edge.reviewStatus === 'draft'
    ));
    expect(safe).toBeDefined();
    if (!safe) return;
    safe.reviewStatus = 'approved';
    safe.activationState = 'active';

    const graph = composeAssignedGbfGraph(buildDanielsonGraph().graph, release);
    const prerequisites = graph.edges.filter((edge) => edge.type === 'prerequisite_for');

    expect(prerequisites).toHaveLength(1);
    expect(prerequisites[0]).toMatchObject({ id: safe.id, reviewStatus: 'approved' });
    expect(getPrerequisiteCycles(graph, { includeLowConfidence: true })).toEqual([]);
    expect(graph.edges.some((edge) => edge.type === 'supports')).toBe(false);
  });

  it('rejects unsafe activation, cross-path edges, duplicates, dangling endpoints, and low-confidence cycles', () => {
    const activeDraft = structuredClone(GBF_GRAPH_RELEASE);
    activeDraft.edgeCandidates[0].activationState = 'active';
    expect(validateGbfGraphRelease(activeDraft).valid).toBe(false);

    const crossPath = structuredClone(GBF_GRAPH_RELEASE);
    const prerequisite = crossPath.edgeCandidates.find((edge) => edge.type === 'prerequisite_for');
    expect(prerequisite).toBeDefined();
    if (!prerequisite) return;
    prerequisite.targetTrajectory = prerequisite.sourceTrajectory === 'management' ? 'rigor' : 'management';
    expect(validateGbfGraphRelease(crossPath).valid).toBe(false);

    const duplicate = structuredClone(GBF_GRAPH_RELEASE);
    duplicate.edgeCandidates.push(structuredClone(duplicate.edgeCandidates[0]));
    expect(validateGbfGraphRelease(duplicate).valid).toBe(false);

    const dangling = structuredClone(GBF_GRAPH_RELEASE);
    dangling.edgeCandidates[0].targetId = 'danielson.tlac.skill.not-real';
    expect(validateGbfGraphRelease(dangling).valid).toBe(false);

    const cycle = structuredClone(GBF_GRAPH_RELEASE);
    const first = cycle.edgeCandidates.find((edge) => edge.type === 'prerequisite_for');
    expect(first).toBeDefined();
    if (!first) return;
    first.reviewStatus = 'approved';
    first.activationState = 'active';
    cycle.edgeCandidates.push({
      ...structuredClone(first),
      id: `${first.id}.reverse`,
      sourceId: first.targetId,
      targetId: first.sourceId,
      sourceActionStepId: first.targetActionStepId,
      targetActionStepId: first.sourceActionStepId,
      confidence: 'low',
    });
    expect(validateGbfGraphRelease(cycle)).toMatchObject({
      valid: false,
      issues: expect.arrayContaining([expect.objectContaining({ code: 'PREREQUISITE_CYCLE' })]),
    });
  });
});
