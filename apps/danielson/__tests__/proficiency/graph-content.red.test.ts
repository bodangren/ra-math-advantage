import { describe, expect, it } from 'vitest';

import {
  APPROVED_STANDALONE_SOURCE_HASH,
  COMPONENT_1E,
  DANIELSON_COMPONENT_IDS,
  RUNTIME_ARRAY_SOURCE_HASH,
  RUNTIME_ONLY_TECHNIQUES,
  createFixtureGraph,
  type FixtureEdge,
  type FixtureNode,
} from './fixtures';

const graphModule = () => import('../../lib/proficiency/graph');

type SourceManifest = {
  stableId: string;
  source: string;
  version: string;
  effectiveDate: string;
  contentHash: string;
  reviewStatus: string;
};

type ReviewQueueItem = {
  id: string;
  source: string;
};

describe('Danielson graph content', () => {
  it('builds the approved Danielson hierarchy and imports each standalone TLAC skill once', async () => {
    const { buildDanielsonGraph, validateDanielsonGraph } = await graphModule();

    const result = buildDanielsonGraph();
    const nodes = result.graph.nodes;
    const edges = result.graph.edges;
    const rootNodes = nodes.filter((node: FixtureNode) => node.kind === 'domain');
    const domainNodes = nodes.filter((node: FixtureNode) => node.kind === 'content_group');
    const componentNodes = nodes.filter((node: FixtureNode) => node.kind === 'instructional_unit');
    const approvedSkills = nodes.filter((node: FixtureNode) => (
      node.kind === 'skill' && node.reviewStatus === 'approved'
    ));

    expect(rootNodes).toHaveLength(1);
    expect(domainNodes).toHaveLength(4);
    expect(componentNodes).toHaveLength(22);
    expect(componentNodes.map((node: FixtureNode) => node.metadata.componentId).sort())
      .toEqual([...DANIELSON_COMPONENT_IDS].sort());
    expect(approvedSkills).toHaveLength(63);
    expect(new Set(approvedSkills.map((node: FixtureNode) => node.id)).size).toBe(63);
    expect(approvedSkills.every((node: FixtureNode) => node.sourceRefs.some((ref) => (
      typeof ref === 'string' ? ref === 'Teach Like a Champion 3.0' : ref.source === 'Teach Like a Champion 3.0'
    )))).toBe(true);

    for (const item of [...nodes, ...edges] as Array<FixtureNode | FixtureEdge>) {
      expect(item.sourceRefs.length).toBeGreaterThan(0);
      expect(item.reviewStatus).toBeDefined();
    }
    expect(edges.some((edge: FixtureEdge) => edge.type === 'prerequisite_for')).toBe(false);
    expect(validateDanielsonGraph(result.graph)).toMatchObject({ valid: true, issues: [] });
  });

  it('freezes both source manifests and preserves every runtime-only source label in the review queue', async () => {
    const { buildDanielsonGraph } = await graphModule();

    const result = buildDanielsonGraph();
    const manifestHashes = result.sourceManifests.map((manifest: SourceManifest) => manifest.contentHash);
    const reviewRows = result.reviewQueue.map((item: ReviewQueueItem) => ({ id: item.id, source: item.source }));

    expect(manifestHashes).toEqual(expect.arrayContaining([
      APPROVED_STANDALONE_SOURCE_HASH,
      RUNTIME_ARRAY_SOURCE_HASH,
    ]));
    for (const manifest of result.sourceManifests as SourceManifest[]) {
      expect(manifest.stableId).toEqual(expect.any(String));
      expect(manifest.source).toEqual(expect.any(String));
      expect(manifest.version).toEqual(expect.any(String));
      expect(manifest.effectiveDate).toEqual(expect.any(String));
      expect(manifest.contentHash).toMatch(/^[a-f0-9]{64}$/);
      expect(manifest.reviewStatus).toBeDefined();
    }
    expect(reviewRows).toEqual(RUNTIME_ONLY_TECHNIQUES);
  });

  it('rejects duplicate IDs, dangling endpoints, invalid containment, cycles, and active GBF prerequisites', async () => {
    const { validateDanielsonGraph } = await graphModule();
    const validGraph = createFixtureGraph();

    expect(validateDanielsonGraph(validGraph)).toMatchObject({ valid: true, issues: [] });

    const duplicateNode = structuredClone(validGraph);
    duplicateNode.nodes.push(structuredClone(duplicateNode.nodes[0]));
    expect(validateDanielsonGraph(duplicateNode)).toMatchObject({ valid: false });

    const danglingEndpoint = structuredClone(validGraph);
    danglingEndpoint.edges[0].targetId = 'danielson.framework.missing.node';
    expect(validateDanielsonGraph(danglingEndpoint)).toMatchObject({ valid: false });

    const invalidContainment = structuredClone(validGraph);
    invalidContainment.edges[0].targetId = 'danielson.tlac.skill.double-plan';
    expect(validateDanielsonGraph(invalidContainment)).toMatchObject({ valid: false });

    const cycle = structuredClone(validGraph);
    cycle.edges.push({
      id: 'danielson.edge.contains.prohibited-cycle',
      type: 'contains',
      sourceId: COMPONENT_1E,
      targetId: 'danielson.framework.2022',
      weight: 1,
      confidence: 'high',
      sourceRefs: [{ source: 'test' }],
      reviewStatus: 'approved',
      metadata: {},
    });
    expect(validateDanielsonGraph(cycle)).toMatchObject({ valid: false });

    const activePrerequisite = structuredClone(validGraph);
    activePrerequisite.edges.push({
      id: 'danielson.edge.prerequisite.not-track-two',
      type: 'prerequisite_for',
      sourceId: 'danielson.tlac.skill.double-plan',
      targetId: 'danielson.tlac.skill.change-the-pace',
      weight: 1,
      confidence: 'high',
      sourceRefs: [{ source: 'GBF 2.0' }],
      reviewStatus: 'reviewed',
      metadata: {},
    });
    expect(validateDanielsonGraph(activePrerequisite)).toMatchObject({ valid: false });
  });
});
