import { describe, expect, it } from 'vitest';
import type {
  KnowledgeSpaceEdge,
  KnowledgeSpaceNode,
} from '@math-platform/knowledge-space-core';
import {
  projectActivityMap,
  projectTeacherEvidence,
  projectSrsInputs,
  type KnowledgeBlueprint,
  type ProjectedActivity,
  type SrsProjectionEntry,
} from '@math-platform/knowledge-space-practice';
import rootNodesJson from '../nodes.json';
import rootBlueprintsJson from '../blueprints.json';
import rootProjectionJson from '../projection/practice-v1-activity-map.json';
import standaloneSrsJson from '../projection/srs-input.json';
import standaloneTeacherEvidenceJson from '../projection/teacher-evidence-map.json';
import moduleNodesJson from '../module-1/nodes.json';
import moduleEdgesJson from '../module-1/edges.json';
import moduleStandardEdgesJson from '../module-1/standard-edges.json';
import courseEdgesJson from '../edges.json';
import moduleBlueprintsJson from '../module-1/blueprints.json';
import moduleProjectionJson from '../module-1/projection/practice-v1-activity-map.json';

const moduleNodes = (moduleNodesJson as { nodes: KnowledgeSpaceNode[] }).nodes;
const moduleBlueprintDocument =
  moduleBlueprintsJson as unknown as { blueprints: KnowledgeBlueprint[] };
const moduleBlueprints = moduleBlueprintDocument.blueprints;
const rootBlueprintDocument =
  rootBlueprintsJson as unknown as { blueprints: KnowledgeBlueprint[] };
const rootBlueprints = rootBlueprintDocument.blueprints;
const moduleSkillIds = new Set(
  moduleNodes
    .filter((node) => node.kind === 'skill' && node.metadata?.module === '1')
    .map((node) => node.id),
);

function moduleGraph(): {
  nodes: KnowledgeSpaceNode[];
  edges: KnowledgeSpaceEdge[];
} {
  const ownedNodes = moduleNodes.filter(
    (node) => node.metadata?.module === '1' || node.kind === 'domain',
  );
  const ownedNodeIds = new Set(ownedNodes.map((node) => node.id));
  const standards = (
    moduleStandardEdgesJson as { nodes: KnowledgeSpaceNode[] }
  ).nodes.filter((node) => node.kind === 'standard');
  const nodes = [
    ...ownedNodes,
    ...standards.filter((node) => !ownedNodeIds.has(node.id)),
  ];
  const edges = [
    ...(moduleEdgesJson as { edges: KnowledgeSpaceEdge[] }).edges.filter(
      (edge) => ownedNodeIds.has(edge.sourceId) || ownedNodeIds.has(edge.targetId),
    ),
    ...(moduleStandardEdgesJson as { edges: KnowledgeSpaceEdge[] }).edges.filter(
      (edge) => ownedNodeIds.has(edge.sourceId),
    ),
  ];
  return { nodes, edges };
}

function embeddedRootGraph(): {
  nodes: KnowledgeSpaceNode[];
  edges: KnowledgeSpaceEdge[];
} {
  return courseEdgesJson as { nodes: KnowledgeSpaceNode[]; edges: KnowledgeSpaceEdge[] };
}

describe('IM3 Module 1 integration', () => {
  it('keeps Module 1 source nodes and blueprints identical in the course graph', () => {
    const rootNodes = new Map(
      (rootNodesJson as { nodes: KnowledgeSpaceNode[] }).nodes.map((node) => [node.id, node]),
    );
    const rootBlueprintMap = new Map(
      rootBlueprints.map((blueprint) => [blueprint.nodeId, blueprint]),
    );

    for (const node of moduleNodes.filter((candidate) => candidate.metadata?.module === '1')) {
      expect(rootNodes.get(node.id)).toEqual(node);
    }
    for (const blueprint of moduleBlueprints) {
      expect(rootBlueprintMap.get(blueprint.nodeId)).toEqual(blueprint);
    }
  });

  it('stores the exact current Module 1 activity and SRS projections', () => {
    const graph = moduleGraph();
    const expectedActivities = projectActivityMap(graph.nodes, graph.edges, moduleBlueprints);
    const expectedSrsInputs = JSON.parse(
      JSON.stringify(projectSrsInputs(graph.nodes, graph.edges, moduleBlueprints)),
    ) as SrsProjectionEntry[];
    const moduleProjection = moduleProjectionJson as unknown as {
      activities: ProjectedActivity[];
      srsInputs: SrsProjectionEntry[];
    };

    expect(moduleProjection.activities).toEqual(expectedActivities);
    expect(moduleProjection.srsInputs).toEqual(expectedSrsInputs);
  });

  it('stores the exact ready equation-rate activity rows in both projection mirrors', () => {
    const graph = moduleGraph();
    const equationRateNodeId = 'math.im3.skill.1.1.calculate-average-rate-of-change-from-an-equation';
    const expectedRows = projectActivityMap(graph.nodes, graph.edges, moduleBlueprints)
      .filter((activity) => activity.nodeId === equationRateNodeId);
    const moduleProjection = moduleProjectionJson as { activities: ProjectedActivity[] };
    const rootProjection = rootProjectionJson as { activities: ProjectedActivity[] };
    const moduleRows = moduleProjection.activities.filter(
      (activity) => activity.nodeId === equationRateNodeId,
    );
    const rootRows = rootProjection.activities.filter(
      (activity) => activity.nodeId === equationRateNodeId,
    );

    expect(expectedRows).toHaveLength(3);
    expect(expectedRows.map((activity) => activity.srsEligible)).toEqual([false, true, true]);
    expect(moduleRows).toEqual(expectedRows);
    expect(rootRows).toEqual(expectedRows);
    expect(moduleRows).toEqual(rootRows);
  });

  it('stores the exact ready equation-rate SRS row in all three projection mirrors', () => {
    const graph = moduleGraph();
    const equationRateNodeId = 'math.im3.skill.1.1.calculate-average-rate-of-change-from-an-equation';
    const expectedRows = projectSrsInputs(graph.nodes, graph.edges, moduleBlueprints)
      .filter((entry) => entry.nodeId === equationRateNodeId);
    const moduleProjection = moduleProjectionJson as { srsInputs: SrsProjectionEntry[] };
    const rootProjection = rootProjectionJson as { srsInputs: SrsProjectionEntry[] };
    const standaloneProjection = standaloneSrsJson as { srsInputs: SrsProjectionEntry[] };
    const expectedRow = {
      nodeId: equationRateNodeId,
      blueprintId: `${equationRateNodeId}.blueprint`,
      standards: ['math.standard.ccss.hsf-if-b-6'],
      prerequisites: [],
      difficulty: 0.5,
      generatorReady: true,
      generatorKey: 'average-rate-of-change',
      equivalentNodeIds: [],
    };

    expect(expectedRows).toEqual([expectedRow]);
    expect(moduleProjection.srsInputs.filter((entry) => entry.nodeId === equationRateNodeId))
      .toEqual(expectedRows);
    expect(rootProjection.srsInputs.filter((entry) => entry.nodeId === equationRateNodeId))
      .toEqual(expectedRows);
    expect(standaloneProjection.srsInputs.filter((entry) => entry.nodeId === equationRateNodeId))
      .toEqual(expectedRows);
  });

  it('stores the exact current graph skill activity and teacher evidence rows', () => {
    const graph = moduleGraph();
    const graphNodeId = 'math.im3.skill.1.1.graph-quadratic-functions';
    const expectedActivities = projectActivityMap(graph.nodes, graph.edges, moduleBlueprints)
      .filter((activity) => activity.nodeId === graphNodeId);
    const expectedAttemptArtifacts = projectTeacherEvidence(graph.nodes, graph.edges)
      .attemptArtifacts
      .filter((artifact) => artifact.nodeId === graphNodeId);
    const expectedSkillRows = projectTeacherEvidence(graph.nodes, graph.edges)
      .skills
      .filter((skill) => skill.nodeId === graphNodeId);
    const moduleProjection = moduleProjectionJson as unknown as {
      activities: ProjectedActivity[];
      teacherEvidence: {
        skills: ReturnType<typeof projectTeacherEvidence>['skills'];
        attemptArtifacts: Array<{ nodeId: string; partIds: string[]; submissionProvenance: string }>;
      };
    };
    const rootProjection = rootProjectionJson as unknown as {
      activities: ProjectedActivity[];
      teacherEvidence: {
        skills: ReturnType<typeof projectTeacherEvidence>['skills'];
        attemptArtifacts: Array<{ nodeId: string; partIds: string[]; submissionProvenance: string }>;
      };
    };

    expect(moduleProjection.activities.filter((activity) => activity.nodeId === graphNodeId))
      .toEqual(expectedActivities);
    expect(rootProjection.activities.filter((activity) => activity.nodeId === graphNodeId))
      .toEqual(expectedActivities);
    expect(moduleProjection.teacherEvidence.attemptArtifacts.filter((artifact) => artifact.nodeId === graphNodeId))
      .toEqual(expectedAttemptArtifacts);
    expect(rootProjection.teacherEvidence.attemptArtifacts.filter((artifact) => artifact.nodeId === graphNodeId))
      .toEqual(expectedAttemptArtifacts);
    expect(moduleProjection.teacherEvidence.skills.filter((skill) => skill.nodeId === graphNodeId))
      .toEqual(expectedSkillRows);
    expect(rootProjection.teacherEvidence.skills.filter((skill) => skill.nodeId === graphNodeId))
      .toEqual(expectedSkillRows);
  });

  it('stores the exact equation-rate teacher-evidence rows in all three projection mirrors', () => {
    const graph = moduleGraph();
    const equationRateNodeId =
      'math.im3.skill.1.1.calculate-average-rate-of-change-from-an-equation';
    const standardId = 'math.standard.ccss.hsf-if-b-6';
    const expectedTeacherEvidence = projectTeacherEvidence(graph.nodes, graph.edges);
    const expectedSkillRows = expectedTeacherEvidence.skills.filter(
      (skill) => skill.nodeId === equationRateNodeId,
    );
    const expectedStandardRows = expectedTeacherEvidence.standards.filter(
      (standard) => standard.standardId === standardId,
    );
    const expectedAttemptArtifacts = expectedTeacherEvidence.attemptArtifacts.filter(
      (artifact) => artifact.nodeId === equationRateNodeId,
    );
    const moduleProjection = moduleProjectionJson as unknown as {
      teacherEvidence: ReturnType<typeof projectTeacherEvidence>;
    };
    const rootProjection = rootProjectionJson as unknown as {
      teacherEvidence: ReturnType<typeof projectTeacherEvidence>;
    };
    const standaloneProjection = standaloneTeacherEvidenceJson as unknown as ReturnType<
      typeof projectTeacherEvidence
    >;

    expect(expectedSkillRows).toHaveLength(1);
    expect(expectedStandardRows).toHaveLength(1);
    expect(expectedAttemptArtifacts).toEqual([]);

    for (const teacherEvidence of [
      moduleProjection.teacherEvidence,
      rootProjection.teacherEvidence,
      standaloneProjection,
    ]) {
      expect(
        teacherEvidence.skills.filter((skill) => skill.nodeId === equationRateNodeId),
      ).toEqual(expectedSkillRows);
      expect(
        teacherEvidence.standards.filter((standard) => standard.standardId === standardId),
      ).toEqual(expectedStandardRows);
      expect(
        teacherEvidence.attemptArtifacts.filter((artifact) => artifact.nodeId === equationRateNodeId),
      ).toEqual(expectedAttemptArtifacts);
    }
  });

  it('stores the exact domain-and-range teacher-evidence rows in all three projection mirrors', () => {
    const moduleEvidence = projectTeacherEvidence(moduleGraph().nodes, moduleGraph().edges);
    const rootEvidence = projectTeacherEvidence(
      embeddedRootGraph().nodes,
      embeddedRootGraph().edges,
    );
    const targetNodeId =
      'math.im3.skill.1.1.state-the-domain-and-range-of-a-quadratic-from-its-graph';
    const hsfIfB4 = 'math.standard.ccss.hsf-if-b-4';
    const hsfIfB5 = 'math.standard.ccss.hsf-if-b-5';
    const expectedTargetSkill = {
      nodeId: targetNodeId,
      title: 'State the domain and range of a quadratic function from its graph',
      kind: 'skill' as const,
      standardsCovered: [hsfIfB5, hsfIfB4],
      prerequisitesMet: true,
      independentPracticeReady: true,
      equivalentNodeIds: [],
    };
    const expectedModuleStandardRows = moduleEvidence.standards.filter((standard) =>
      [hsfIfB4, hsfIfB5].includes(standard.standardId),
    );
    const expectedRootStandardRows = rootEvidence.standards.filter((standard) =>
      [hsfIfB4, hsfIfB5].includes(standard.standardId),
    );
    const moduleProjection = moduleProjectionJson as unknown as {
      teacherEvidence: ReturnType<typeof projectTeacherEvidence>;
    };
    const rootProjection = rootProjectionJson as unknown as {
      teacherEvidence: ReturnType<typeof projectTeacherEvidence>;
    };
    const standaloneProjection = standaloneTeacherEvidenceJson as unknown as ReturnType<
      typeof projectTeacherEvidence
    >;

    expect(moduleEvidence.skills.filter((skill) => skill.nodeId === targetNodeId))
      .toEqual([expectedTargetSkill]);
    expect(rootEvidence.skills.filter((skill) => skill.nodeId === targetNodeId))
      .toEqual([expectedTargetSkill]);
    expect(expectedModuleStandardRows.map((standard) => standard.standardId)).toEqual([hsfIfB4, hsfIfB5]);
    expect(expectedRootStandardRows.map((standard) => standard.standardId)).toEqual([hsfIfB4, hsfIfB5]);
    expect(expectedModuleStandardRows.find((standard) => standard.standardId === hsfIfB5)).toEqual({
      standardId: hsfIfB5,
      standardTitle: 'HSF-IF.B.5: Relate the domain of a function to its graph and, where applicable, to the quantitative relationship it describes.',
      nodeIds: [
        'math.im3.example.1.1.003',
        'math.im3.skill.1.1.determine-the-contextual-domain-and-range-of-a-quadratic-model',
        targetNodeId,
      ],
      workedExampleCount: 1,
      guidedPracticeCount: 0,
      independentPracticeCount: 0,
    });
    expect(expectedRootStandardRows.find((standard) => standard.standardId === hsfIfB5)).toEqual({
      standardId: hsfIfB5,
      standardTitle: 'HSF-IF.B.5: Relate the domain of a function to its graph and, where applicable, to the quantitative relationship it describes.',
      nodeIds: [
        'math.im3.example.1.1.003',
        targetNodeId,
        'math.im3.skill.1.1.determine-the-contextual-domain-and-range-of-a-quadratic-model',
      ],
      workedExampleCount: 1,
      guidedPracticeCount: 0,
      independentPracticeCount: 0,
    });
    expect(expectedRootStandardRows.find((standard) => standard.standardId === hsfIfB4)?.nodeIds)
      .toHaveLength(21);
    expect(expectedRootStandardRows.find((standard) => standard.standardId === hsfIfB4)).toMatchObject({
      workedExampleCount: 11,
      guidedPracticeCount: 0,
      independentPracticeCount: 0,
    });

    type TeacherEvidenceCase = {
      teacherEvidence: ReturnType<typeof projectTeacherEvidence>;
      expectedStandardRows: ReturnType<typeof projectTeacherEvidence>['standards'];
    };

    const teacherEvidenceCases: TeacherEvidenceCase[] = [
      { teacherEvidence: moduleProjection.teacherEvidence, expectedStandardRows: expectedModuleStandardRows },
      { teacherEvidence: rootProjection.teacherEvidence, expectedStandardRows: expectedRootStandardRows },
      { teacherEvidence: standaloneProjection, expectedStandardRows: expectedRootStandardRows },
    ];

    for (const { teacherEvidence, expectedStandardRows } of teacherEvidenceCases) {
      expect(teacherEvidence.skills.filter((skill) => skill.nodeId === targetNodeId))
        .toEqual([expectedTargetSkill]);
      expect(teacherEvidence.skills.map((skill) => skill.nodeId)).toEqual(
        [...teacherEvidence.skills.map((skill) => skill.nodeId)].sort((a, b) => a.localeCompare(b)),
      );
      expect(
        teacherEvidence.standards.filter((standard) =>
          [hsfIfB4, hsfIfB5].includes(standard.standardId),
        ),
      ).toEqual(expectedStandardRows);
      expect(
        teacherEvidence.standards.filter((standard) => standard.nodeIds.includes(targetNodeId))
          .map((standard) => standard.standardId),
      ).toEqual([hsfIfB4, hsfIfB5]);
      expect(
        teacherEvidence.attemptArtifacts.filter((artifact) => artifact.nodeId === targetNodeId),
      ).toEqual([]);
    }
  });

  it('stores the exact legacy average-rate teacher-evidence rows in all three mirrors', () => {
    const graph = moduleGraph();
    const targetNodeId = 'math.im3.skill.1.1.find-and-interpret-the-average-rate-of-change';
    const obsoleteStandardIds = [
      'math.standard.ccss.hsf-if-c-7c',
      'math.standard.ccss.hsa-sse-b-3',
      'math.standard.ccss.hsa-rei-b-4',
      'math.standard.ccss.hsf-if-a-2',
      'math.standard.ccss.n-cn-a-1',
      'math.standard.ccss.n-cn-c-7',
    ];
    const correctStandardId = 'math.standard.ccss.hsf-if-b-6';
    const expectedTeacherEvidence = projectTeacherEvidence(graph.nodes, graph.edges);
    const expectedSkillRows = expectedTeacherEvidence.skills.filter(
      (skill) => skill.nodeId === targetNodeId,
    );
    const expectedStandardRows = expectedTeacherEvidence.standards.filter(
      (standard) => standard.standardId === correctStandardId,
    );
    const moduleProjection = moduleProjectionJson as unknown as {
      teacherEvidence: ReturnType<typeof projectTeacherEvidence>;
    };
    const rootProjection = rootProjectionJson as unknown as {
      teacherEvidence: ReturnType<typeof projectTeacherEvidence>;
    };
    const standaloneProjection = standaloneTeacherEvidenceJson as unknown as ReturnType<
      typeof projectTeacherEvidence
    >;

    expect(expectedSkillRows).toEqual([{
      nodeId: targetNodeId,
      title: '1b: Find and interpret the average rate of change',
      kind: 'skill',
      standardsCovered: [correctStandardId],
      prerequisitesMet: true,
      independentPracticeReady: false,
      equivalentNodeIds: [],
    }]);
    expect(expectedStandardRows).toEqual([{
      standardId: correctStandardId,
      standardTitle: 'HSF-IF.B.6: Calculate and interpret the average rate of change of a function (presented symbolically or as a table) over a specified interval. Estimate the rate of change from a graph.',
      nodeIds: [
        targetNodeId,
        'math.im3.skill.1.1.calculate-average-rate-of-change-from-an-equation',
        'math.im3.skill.1.1.calculate-average-rate-of-change-from-a-table',
        'math.im3.skill.1.1.estimate-and-verify-average-rate-of-change-from-a-graph',
        'math.im3.skill.1.1.interpret-average-rate-of-change-in-context',
      ],
      workedExampleCount: 0,
      guidedPracticeCount: 0,
      independentPracticeCount: 0,
    }]);

    for (const teacherEvidence of [
      moduleProjection.teacherEvidence,
      rootProjection.teacherEvidence,
      standaloneProjection,
    ] as const) {
      expect(teacherEvidence.skills.filter((skill) => skill.nodeId === targetNodeId))
        .toEqual(expectedSkillRows);
      expect(teacherEvidence.standards.filter(
        (standard) => standard.standardId === correctStandardId,
      )).toEqual(expectedStandardRows);
      for (const obsoleteStandardId of obsoleteStandardIds) {
        const obsoleteRows = teacherEvidence.standards.filter(
          (standard) => standard.standardId === obsoleteStandardId,
        );
        expect(obsoleteRows).toHaveLength(1);
        expect(obsoleteRows[0].nodeIds).not.toContain(targetNodeId);
      }
      expect(teacherEvidence.standards.filter((standard) =>
        standard.nodeIds.includes(targetNodeId),
      ).map((standard) => standard.standardId)).toEqual([correctStandardId]);
      expect(teacherEvidence.attemptArtifacts.filter((artifact) => artifact.nodeId === targetNodeId))
        .toEqual([]);
    }
  });

  it('stores the exact maximum-profit teacher-evidence rows in all three mirrors', () => {
    const moduleEvidence = projectTeacherEvidence(moduleGraph().nodes, moduleGraph().edges);
    const rootGraph = embeddedRootGraph();
    const rootEvidence = projectTeacherEvidence(rootGraph.nodes, rootGraph.edges);
    const targetNodeId =
      'math.im3.skill.1.1.find-and-interpret-the-maximum-of-a-quadratic-profit-model';
    const hsfIfA2 = 'math.standard.ccss.hsf-if-a-2';
    const hsfIfB4 = 'math.standard.ccss.hsf-if-b-4';
    const expectedTargetSkill = {
      nodeId: targetNodeId,
      title: 'Find and interpret the maximum of a quadratic profit model',
      kind: 'skill' as const,
      standardsCovered: [hsfIfB4, hsfIfA2],
      prerequisitesMet: true,
      independentPracticeReady: true,
      equivalentNodeIds: [],
    };
    const expectedModuleStandardRows = [
      {
        standardId: hsfIfA2,
        standardTitle:
          'HSF-IF.A.2: Use function notation, evaluate functions for inputs in their domains, and interpret statements that use function notation in terms of a context',
        nodeIds: [
          'math.im3.example.1.1.002',
          'math.im3.example.1.1.003',
          'math.im3.example.1.1.004',
          'math.im3.example.1.1.005',
          'math.im3.example.1.1.006',
          targetNodeId,
        ],
        workedExampleCount: 5,
        guidedPracticeCount: 0,
        independentPracticeCount: 0,
      },
      {
        standardId: hsfIfB4,
        standardTitle: 'HSF-IF.B.4: Interpreting key features of functions from graphs and tables',
        nodeIds: [
          'math.im3.example.1.1.003',
          'math.im3.skill.1.1.identify-a-quadratic-maximum-from-its-graph',
          targetNodeId,
          'math.im3.skill.1.1.determine-the-contextual-domain-and-range-of-a-quadratic-model',
          'math.im3.skill.1.1.state-the-domain-and-range-of-a-quadratic-from-its-graph',
        ],
        workedExampleCount: 1,
        guidedPracticeCount: 0,
        independentPracticeCount: 0,
      },
    ];
    const expectedRootStandardRows = [
      {
        standardId: hsfIfA2,
        standardTitle:
          'HSF-IF.A.2: Use function notation, evaluate functions for inputs in their domains, and interpret statements that use function notation in terms of a context',
        nodeIds: [
          'math.im3.example.1.1.002',
          'math.im3.example.1.1.003',
          'math.im3.example.1.1.004',
          'math.im3.example.1.1.005',
          'math.im3.example.1.1.006',
          'math.im3.example.3.1.001',
          'math.im3.example.3.1.002',
          'math.im3.skill.3.1.solve-polynomial-equations-by-graphing',
          targetNodeId,
        ],
        workedExampleCount: 7,
        guidedPracticeCount: 0,
        independentPracticeCount: 0,
      },
      {
        standardId: hsfIfB4,
        standardTitle: 'HSF-IF.B.4: Interpreting key features of functions from graphs and tables',
        nodeIds: [
          'math.im3.skill.1.1.identify-a-quadratic-maximum-from-its-graph',
          'math.im3.example.1.1.003',
          'math.im3.example.2.1.001',
          'math.im3.example.2.1.002',
          'math.im3.example.2.1.003',
          'math.im3.example.2.1.004',
          'math.im3.example.2.1.005',
          'math.im3.example.2.1.006',
          'math.im3.example.2.2.007',
          'math.im3.example.2.2.008',
          'math.im3.example.4.1.001',
          'math.im3.example.4.1.002',
          'math.im3.skill.2.1.graph-and-analyze-polynomial-functions',
          'math.im3.skill.2.1.graph-and-analyze-power-functions',
          'math.im3.skill.2.2.approximate-zeros-by-graphing-polynomial-functions',
          'math.im3.skill.2.2.find-extrema-of-polynomial-functions',
          'math.im3.skill.4.1.find-compositions-of-functions',
          'math.im3.skill.4.1.find-sums-differences-products-and-quotients-of-functions',
          targetNodeId,
          'math.im3.skill.1.1.state-the-domain-and-range-of-a-quadratic-from-its-graph',
          'math.im3.skill.1.1.determine-the-contextual-domain-and-range-of-a-quadratic-model',
        ],
        workedExampleCount: 11,
        guidedPracticeCount: 0,
        independentPracticeCount: 0,
      },
    ];

    expect(moduleEvidence.skills.filter((skill) => skill.nodeId === targetNodeId))
      .toEqual([expectedTargetSkill]);
    expect(rootEvidence.skills.filter((skill) => skill.nodeId === targetNodeId))
      .toEqual([expectedTargetSkill]);
    expect(moduleEvidence.standards.filter((standard) =>
      [hsfIfA2, hsfIfB4].includes(standard.standardId),
    )).toEqual(expectedModuleStandardRows);
    expect(rootEvidence.standards.filter((standard) =>
      [hsfIfA2, hsfIfB4].includes(standard.standardId),
    )).toEqual(expectedRootStandardRows);

    const moduleProjection = moduleProjectionJson as unknown as {
      teacherEvidence: ReturnType<typeof projectTeacherEvidence>;
    };
    const rootProjection = rootProjectionJson as unknown as {
      teacherEvidence: ReturnType<typeof projectTeacherEvidence>;
    };
    const standaloneProjection = standaloneTeacherEvidenceJson as unknown as ReturnType<
      typeof projectTeacherEvidence
    >;

    for (const [teacherEvidence, expectedStandardRows] of [
      [moduleProjection.teacherEvidence, expectedModuleStandardRows],
      [rootProjection.teacherEvidence, expectedRootStandardRows],
      [standaloneProjection, expectedRootStandardRows],
    ] as Array<[ReturnType<typeof projectTeacherEvidence>, typeof expectedModuleStandardRows]>) {
      const targetSkillRows = teacherEvidence.skills.filter((skill) => skill.nodeId === targetNodeId);
      expect(targetSkillRows).toEqual([expectedTargetSkill]);
      expect(teacherEvidence.skills.map((skill) => skill.nodeId)).toEqual(
        [...teacherEvidence.skills.map((skill) => skill.nodeId)].sort((a, b) => a.localeCompare(b)),
      );
      expect(teacherEvidence.standards.filter((standard) =>
        [hsfIfA2, hsfIfB4].includes(standard.standardId),
      )).toEqual(expectedStandardRows);
      expect(teacherEvidence.standards.filter((standard) =>
        standard.nodeIds.includes(targetNodeId),
      ).map((standard) => standard.standardId)).toEqual([hsfIfA2, hsfIfB4]);
      expect(teacherEvidence.attemptArtifacts.filter((artifact) => artifact.nodeId === targetNodeId))
        .toEqual([]);
    }
  });

  it('stores the exact IM3 Example 1 teacher-evidence scope in all three projection mirrors', () => {
    const moduleGraphData = moduleGraph();
    const rootGraphData = embeddedRootGraph();
    const moduleEvidence = projectTeacherEvidence(moduleGraphData.nodes, moduleGraphData.edges);
    const rootEvidence = projectTeacherEvidence(rootGraphData.nodes, rootGraphData.edges);
    const sourceExampleNodeId = 'math.im3.example.1.1.001';
    const graphSkillNodeId = 'math.im3.skill.1.1.graph-quadratic-functions';
    const domainRangeSkillNodeId =
      'math.im3.skill.1.1.state-the-domain-and-range-of-a-quadratic-from-its-graph';
    const scopedNodeIds = [sourceExampleNodeId, graphSkillNodeId, domainRangeSkillNodeId];
    const scopedSkillNodeIds = new Set([graphSkillNodeId, domainRangeSkillNodeId]);
    const moduleScopedSkills = moduleEvidence.skills.filter((skill) =>
      scopedSkillNodeIds.has(skill.nodeId),
    );
    const rootScopedSkills = rootEvidence.skills.filter((skill) =>
      scopedSkillNodeIds.has(skill.nodeId),
    );
    const moduleScopedArtifacts = moduleEvidence.attemptArtifacts.filter((artifact) =>
      scopedNodeIds.includes(artifact.nodeId),
    );
    const rootScopedArtifacts = rootEvidence.attemptArtifacts.filter((artifact) =>
      scopedNodeIds.includes(artifact.nodeId),
    );
    const moduleProjection = moduleProjectionJson as unknown as {
      teacherEvidence: ReturnType<typeof projectTeacherEvidence>;
    };
    const rootProjection = rootProjectionJson as unknown as {
      teacherEvidence: ReturnType<typeof projectTeacherEvidence>;
    };
    const standaloneProjection = standaloneTeacherEvidenceJson as unknown as ReturnType<
      typeof projectTeacherEvidence
    >;

    expect(moduleScopedSkills).toHaveLength(2);
    expect(rootScopedSkills).toEqual(moduleScopedSkills);
    expect(moduleScopedArtifacts).toEqual([{
      nodeId: sourceExampleNodeId,
      partIds: [],
      submissionProvenance: 'knowledge-space.math.im3',
    }]);
    expect(rootScopedArtifacts).toEqual(moduleScopedArtifacts);

    for (const [teacherEvidence, expectedEvidence] of [
      [moduleProjection.teacherEvidence, moduleEvidence],
      [rootProjection.teacherEvidence, rootEvidence],
      [standaloneProjection, rootEvidence],
    ] as Array<[
      ReturnType<typeof projectTeacherEvidence>,
      ReturnType<typeof projectTeacherEvidence>,
    ]>) {
      expect(teacherEvidence.skills.filter((skill) => scopedSkillNodeIds.has(skill.nodeId)))
        .toEqual(expectedEvidence.skills.filter((skill) => scopedSkillNodeIds.has(skill.nodeId)));
      expect(teacherEvidence.standards.filter((standard) =>
        standard.nodeIds.some((nodeId) => scopedNodeIds.includes(nodeId)),
      )).toEqual(expectedEvidence.standards.filter((standard) =>
        standard.nodeIds.some((nodeId) => scopedNodeIds.includes(nodeId)),
      ));
      expect(teacherEvidence.attemptArtifacts.filter((artifact) =>
        scopedNodeIds.includes(artifact.nodeId),
      )).toEqual(expectedEvidence.attemptArtifacts.filter((artifact) =>
        scopedNodeIds.includes(artifact.nodeId),
      ));
    }
  });

  it('stores the exact atomic-rate SRS rows in all three projection mirrors', () => {
    const graph = moduleGraph();
    const atomicRateNodeIds = [
      'math.im3.skill.1.1.calculate-average-rate-of-change-from-a-table',
      'math.im3.skill.1.1.calculate-average-rate-of-change-from-an-equation',
      'math.im3.skill.1.1.estimate-and-verify-average-rate-of-change-from-a-graph',
      'math.im3.skill.1.1.interpret-average-rate-of-change-in-context',
    ];
    const expectedRows = projectSrsInputs(graph.nodes, graph.edges, moduleBlueprints).filter(
      (entry) => atomicRateNodeIds.includes(entry.nodeId),
    );
    const moduleProjection = moduleProjectionJson as { srsInputs: SrsProjectionEntry[] };
    const rootProjection = rootProjectionJson as { srsInputs: SrsProjectionEntry[] };
    const standaloneProjection = standaloneSrsJson as { srsInputs: SrsProjectionEntry[] };

    expect(expectedRows).toHaveLength(4);
    expect(expectedRows.map((entry) => entry.nodeId)).toEqual(atomicRateNodeIds);
    expect(expectedRows.map((entry) => entry.generatorReady)).toEqual([
      false,
      true,
      false,
      false,
    ]);
    expect(expectedRows[0].generatorKey).toBeUndefined();
    expect(expectedRows[1]).toHaveProperty('generatorKey', 'average-rate-of-change');
    expect(expectedRows[2].generatorKey).toBeUndefined();
    expect(expectedRows[3].generatorKey).toBeUndefined();

    for (const projection of [moduleProjection, rootProjection, standaloneProjection]) {
      expect(projection.srsInputs.filter((entry) => atomicRateNodeIds.includes(entry.nodeId)))
        .toEqual(expectedRows);
    }
  });

  it('replaces only Module 1 activity and SRS rows in the course projection', () => {
    const graph = moduleGraph();
    const expectedActivities = projectActivityMap(graph.nodes, graph.edges, moduleBlueprints);
    const expectedSrsInputs = JSON.parse(
      JSON.stringify(projectSrsInputs(graph.nodes, graph.edges, moduleBlueprints)),
    ) as SrsProjectionEntry[];
    const rootProjection = rootProjectionJson as {
      activities: ProjectedActivity[];
      srsInputs: SrsProjectionEntry[];
    };

    expect(
      rootProjection.activities.filter((activity) => moduleSkillIds.has(activity.nodeId)),
    ).toEqual(expectedActivities);
    expect(
      rootProjection.srsInputs.filter((entry) => moduleSkillIds.has(entry.nodeId)),
    ).toEqual(expectedSrsInputs);
  });

  it('stores the exact domain-and-range activity and SRS projection subject in all mirrors', () => {
    const graph = moduleGraph();
    const targetNodeId =
      'math.im3.skill.1.1.state-the-domain-and-range-of-a-quadratic-from-its-graph';
    const expectedActivities = projectActivityMap(graph.nodes, graph.edges, moduleBlueprints)
      .filter((activity) => activity.nodeId === targetNodeId);
    const expectedSrsInputs = JSON.parse(
      JSON.stringify(
        projectSrsInputs(graph.nodes, graph.edges, moduleBlueprints)
          .filter((entry) => entry.nodeId === targetNodeId),
      ),
    ) as SrsProjectionEntry[];
    const moduleProjection = moduleProjectionJson as {
      activities: ProjectedActivity[];
      srsInputs: SrsProjectionEntry[];
    };
    const rootProjection = rootProjectionJson as {
      activities: ProjectedActivity[];
      srsInputs: SrsProjectionEntry[];
    };
    const standaloneProjection = standaloneSrsJson as {
      srsInputs: SrsProjectionEntry[];
    };

    expect(expectedActivities).toHaveLength(3);
    expect(expectedActivities.map((activity) => activity.mode)).toEqual([
      'worked_example',
      'guided_practice',
      'independent_practice',
    ]);
    expect(expectedActivities.map((activity) => activity.srsEligible)).toEqual([false, true, true]);
    expect(moduleProjection.activities.filter((activity) => activity.nodeId === targetNodeId))
      .toEqual(expectedActivities);
    expect(rootProjection.activities.filter((activity) => activity.nodeId === targetNodeId))
      .toEqual(expectedActivities);
    expect(moduleProjection.activities.filter((activity) => activity.nodeId === targetNodeId))
      .toEqual(rootProjection.activities.filter((activity) => activity.nodeId === targetNodeId));
    expect(expectedSrsInputs).toHaveLength(1);
    expect(expectedSrsInputs[0]).toEqual({
      nodeId: targetNodeId,
      blueprintId: `${targetNodeId}.blueprint`,
      standards: [
        'math.standard.ccss.hsf-if-b-5',
        'math.standard.ccss.hsf-if-b-4',
      ],
      prerequisites: [],
      difficulty: 0.5,
      generatorKey: 'quadratic-graph-analysis',
      generatorReady: true,
      equivalentNodeIds: [],
    });
    expect(moduleProjection.srsInputs.filter((entry) => entry.nodeId === targetNodeId))
      .toEqual(expectedSrsInputs);
    expect(rootProjection.srsInputs.filter((entry) => entry.nodeId === targetNodeId))
      .toEqual(expectedSrsInputs);
    expect(standaloneProjection.srsInputs.filter((entry) => entry.nodeId === targetNodeId))
      .toEqual(expectedSrsInputs);
  });

  it('stores the exact maximum-reading activity and SRS rows in all three projection mirrors', () => {
    const graph = moduleGraph();
    const targetNodeId =
      'math.im3.skill.1.1.identify-a-quadratic-maximum-from-its-graph';
    const expectedActivities = projectActivityMap(graph.nodes, graph.edges, moduleBlueprints)
      .filter((activity) => activity.nodeId === targetNodeId);
    const expectedSrsInputs = projectSrsInputs(graph.nodes, graph.edges, moduleBlueprints)
      .filter((entry) => entry.nodeId === targetNodeId);
    const moduleProjection = moduleProjectionJson as {
      activities: ProjectedActivity[];
      srsInputs: SrsProjectionEntry[];
    };
    const rootProjection = rootProjectionJson as {
      activities: ProjectedActivity[];
      srsInputs: SrsProjectionEntry[];
    };
    const standaloneProjection = standaloneSrsJson as {
      srsInputs: SrsProjectionEntry[];
    };

    expect(expectedActivities).toHaveLength(3);
    expect(expectedActivities.map((activity) => activity.mode)).toEqual([
      'worked_example',
      'guided_practice',
      'independent_practice',
    ]);
    expect(expectedActivities.map((activity) => activity.stableActivityId)).toEqual([
      `${targetNodeId}.worked_example`,
      `${targetNodeId}.guided_practice`,
      `${targetNodeId}.independent_practice`,
    ]);
    expect(expectedActivities.map((activity) => activity.srsEligible)).toEqual([
      false,
      true,
      true,
    ]);
    expect(expectedActivities[0]).toMatchObject({
      sourceNodeIds: ['math.im3.example.1.1.002'],
      rendererKey: 'graphing-explorer',
      props: {
        equation: 'f(x) = -x^2 + 6x - 4',
        variant: 'plot_from_equation',
        responseVariant: 'maximum_value',
        domain: [-2, 8],
        range: [-3, 7],
      },
      gradingConfig: {
        partIds: ['maximum_value'],
        passingScore: 1,
        partialCredit: false,
        rubric: [{
          criteria: 'Identify the maximum value from the displayed graph.',
          points: 1,
          partId: 'maximum_value',
        }],
      },
    });
    expect(expectedActivities[1]?.props).toEqual({
      equation: 'y = -x^2 - 1',
      variant: 'plot_from_equation',
      responseVariant: 'maximum_value',
      domain: [-5, 5],
      range: [-10, 10],
    });
    expect(expectedActivities[2]?.props).toEqual({
      equation: 'y = -x^2 + 2',
      variant: 'plot_from_equation',
      responseVariant: 'maximum_value',
      domain: [-5, 5],
      range: [-10, 10],
    });
    expect(expectedSrsInputs).toEqual([{
      nodeId: targetNodeId,
      blueprintId: `${targetNodeId}.blueprint`,
      standards: ['math.standard.ccss.hsf-if-b-4'],
      prerequisites: [],
      difficulty: 0.5,
      generatorKey: 'quadratic-graph-analysis',
      generatorReady: true,
      equivalentNodeIds: [],
    }]);
    expect(moduleProjection.activities.filter((activity) => activity.nodeId === targetNodeId))
      .toEqual(expectedActivities);
    expect(rootProjection.activities.filter((activity) => activity.nodeId === targetNodeId))
      .toEqual(expectedActivities);
    expect(moduleProjection.activities.filter((activity) => activity.nodeId === targetNodeId))
      .toEqual(rootProjection.activities.filter((activity) => activity.nodeId === targetNodeId));
    const moduleTargetSrsInputs = moduleProjection.srsInputs.filter(
      (entry) => entry.nodeId === targetNodeId,
    );
    const rootTargetSrsInputs = rootProjection.srsInputs.filter(
      (entry) => entry.nodeId === targetNodeId,
    );
    const standaloneTargetSrsInputs = standaloneProjection.srsInputs.filter(
      (entry) => entry.nodeId === targetNodeId,
    );
    expect(moduleTargetSrsInputs).toHaveLength(1);
    expect(rootTargetSrsInputs).toHaveLength(1);
    expect(standaloneTargetSrsInputs).toHaveLength(1);
    expect(moduleTargetSrsInputs).toEqual(expectedSrsInputs);
    expect(rootTargetSrsInputs).toEqual(expectedSrsInputs);
    expect(standaloneTargetSrsInputs).toEqual(expectedSrsInputs);
    expect(moduleTargetSrsInputs).toEqual(rootTargetSrsInputs);
    expect(moduleTargetSrsInputs).toEqual(standaloneTargetSrsInputs);
  });

  it('stores the exact symmetry activity and SRS rows in all three projection mirrors', () => {
    const graph = moduleGraph();
    const targetNodeId =
      'math.im3.skill.1.1.graph-a-quadratic-from-a-vertex-and-y-intercept-using-symmetry';
    const expectedActivities = projectActivityMap(graph.nodes, graph.edges, moduleBlueprints)
      .filter((activity) => activity.nodeId === targetNodeId);
    const expectedSrsInputs = projectSrsInputs(graph.nodes, graph.edges, moduleBlueprints)
      .filter((entry) => entry.nodeId === targetNodeId);
    const moduleProjection = moduleProjectionJson as {
      activities: ProjectedActivity[];
      srsInputs: SrsProjectionEntry[];
    };
    const rootProjection = rootProjectionJson as {
      activities: ProjectedActivity[];
      srsInputs: SrsProjectionEntry[];
    };
    const standaloneProjection = standaloneSrsJson as {
      srsInputs: SrsProjectionEntry[];
    };

    expect(expectedActivities).toHaveLength(3);
    expect(expectedActivities.map((activity) => activity.mode)).toEqual([
      'worked_example',
      'guided_practice',
      'independent_practice',
    ]);
    expect(expectedActivities.map((activity) => activity.stableActivityId)).toEqual([
      `${targetNodeId}.worked_example`,
      `${targetNodeId}.guided_practice`,
      `${targetNodeId}.independent_practice`,
    ]);
    expect(expectedActivities.map((activity) => activity.srsEligible)).toEqual([
      false,
      true,
      true,
    ]);
    expect(expectedActivities.map((activity) => ({
      nodeId: activity.nodeId,
      sourceNodeIds: activity.sourceNodeIds,
      rendererKey: activity.rendererKey,
      alignmentNodeIds: activity.alignmentNodeIds,
      props: activity.props,
      gradingConfig: activity.gradingConfig,
    }))).toEqual([
      {
        nodeId: targetNodeId,
        sourceNodeIds: ['math.im3.example.1.1.002'],
        rendererKey: 'graphing-explorer',
        alignmentNodeIds: ['math.standard.ccss.hsf-if-c-7a'],
        props: {
          equation: 'g(x) = -3x^2 + 6x - 1',
          variant: 'plot_from_equation',
          responseVariant: 'symmetry_graph',
          vertex: [1, 2],
          yIntercept: [0, -1],
          domain: [-3, 5],
          range: [-10, 5],
        },
        gradingConfig: {
          partIds: ['placed_points'],
          passingScore: 1,
          partialCredit: false,
          rubric: [{
            criteria: 'Place the vertex, the y-intercept, and the reflected point.',
            points: 1,
            partId: 'placed_points',
          }],
        },
      },
      {
        nodeId: targetNodeId,
        sourceNodeIds: ['math.im3.example.1.1.002'],
        rendererKey: 'graphing-explorer',
        alignmentNodeIds: ['math.standard.ccss.hsf-if-c-7a'],
        props: {
          equation: 'y = -x^2 + 4x - 1',
          variant: 'plot_from_equation',
          responseVariant: 'symmetry_graph',
          vertex: [2, 3],
          yIntercept: [0, -1],
          domain: [-3, 7],
          range: [-10, 6],
        },
        gradingConfig: {
          partIds: ['placed_points'],
          passingScore: 1,
          partialCredit: false,
          rubric: [{
            criteria: 'Place the vertex, the y-intercept, and the reflected point.',
            points: 1,
            partId: 'placed_points',
          }],
        },
      },
      {
        nodeId: targetNodeId,
        sourceNodeIds: ['math.im3.example.1.1.002'],
        rendererKey: 'graphing-explorer',
        alignmentNodeIds: ['math.standard.ccss.hsf-if-c-7a'],
        props: {
          equation: 'g(x) = -3x^2 + 6x - 1',
          variant: 'plot_from_equation',
          responseVariant: 'symmetry_graph',
          vertex: [1, 2],
          yIntercept: [0, -1],
          domain: [-3, 5],
          range: [-10, 5],
        },
        gradingConfig: {
          partIds: ['placed_points'],
          passingScore: 1,
          partialCredit: false,
          rubric: [{
            criteria: 'Place the vertex, the y-intercept, and the reflected point.',
            points: 1,
            partId: 'placed_points',
          }],
        },
      },
    ]);
    expect(expectedSrsInputs).toEqual([{
      nodeId: targetNodeId,
      blueprintId: `${targetNodeId}.blueprint`,
      standards: ['math.standard.ccss.hsf-if-c-7a'],
      prerequisites: [],
      difficulty: 0.5,
      generatorKey: 'quadratic-graph-analysis',
      generatorReady: true,
      equivalentNodeIds: [],
    }]);

    const moduleTargetActivities = moduleProjection.activities.filter(
      (activity) => activity.nodeId === targetNodeId,
    );
    const rootTargetActivities = rootProjection.activities.filter(
      (activity) => activity.nodeId === targetNodeId,
    );
    const moduleTargetSrsInputs = moduleProjection.srsInputs.filter(
      (entry) => entry.nodeId === targetNodeId,
    );
    const rootTargetSrsInputs = rootProjection.srsInputs.filter(
      (entry) => entry.nodeId === targetNodeId,
    );
    const standaloneTargetSrsInputs = standaloneProjection.srsInputs.filter(
      (entry) => entry.nodeId === targetNodeId,
    );

    expect(moduleTargetActivities).toHaveLength(3);
    expect(rootTargetActivities).toHaveLength(3);
    expect(moduleTargetSrsInputs).toHaveLength(1);
    expect(rootTargetSrsInputs).toHaveLength(1);
    expect(standaloneTargetSrsInputs).toHaveLength(1);
    expect(moduleTargetActivities).toEqual(expectedActivities);
    expect(rootTargetActivities).toEqual(expectedActivities);
    expect(moduleTargetActivities).toEqual(rootTargetActivities);
    expect(moduleTargetSrsInputs).toEqual(expectedSrsInputs);
    expect(rootTargetSrsInputs).toEqual(expectedSrsInputs);
    expect(moduleTargetSrsInputs).toEqual(rootTargetSrsInputs);
    expect(standaloneTargetSrsInputs).toEqual(expectedSrsInputs);
    expect(moduleTargetSrsInputs).toEqual(standaloneTargetSrsInputs);
  });

  it('stores the exact compare-maximum activity and SRS rows in all projection mirrors', () => {
    const graph = moduleGraph();
    const targetNodeId =
      'math.im3.skill.1.1.compare-maximum-values-of-quadratic-functions';
    const expectedActivities = projectActivityMap(graph.nodes, graph.edges, moduleBlueprints)
      .filter((activity) => activity.nodeId === targetNodeId);
    const expectedSrsInputs = projectSrsInputs(graph.nodes, graph.edges, moduleBlueprints)
      .filter((entry) => entry.nodeId === targetNodeId);
    const moduleProjection = moduleProjectionJson as {
      activities: ProjectedActivity[];
      srsInputs: SrsProjectionEntry[];
    };
    const rootProjection = rootProjectionJson as {
      activities: ProjectedActivity[];
      srsInputs: SrsProjectionEntry[];
    };
    const standaloneProjection = standaloneSrsJson as {
      srsInputs: SrsProjectionEntry[];
    };

    expect(expectedActivities).toEqual([
      {
        stableActivityId: `${targetNodeId}.worked_example`,
        nodeId: targetNodeId,
        sourceNodeIds: ['math.im3.example.1.1.002'],
        rendererKey: 'graphing-explorer',
        mode: 'worked_example',
        alignmentNodeIds: ['math.standard.ccss.hsf-if-c-9'],
        props: {
          equation: 'y = -x^2 + 6x - 4',
          variant: 'compare_functions',
          responseVariant: 'compare_maximums',
          comparisonEquation: 'y = -3x^2 + 6x - 1',
          comparisonQuestion: 'The graph of f(x) is shown. Function g has a y-intercept of -1 and a vertex at (1, 2). Which function has the greater maximum value?',
          comparisonAnswer: 'first',
          vertex: [1, 2],
          yIntercept: [0, -1],
          domain: [-2, 6],
          range: [-6, 8],
        },
        gradingConfig: {
          partIds: ['greater_maximum'],
          passingScore: 1,
          partialCredit: false,
          rubric: [{
            criteria: 'Identify the function with the greater maximum.',
            points: 1,
            partId: 'greater_maximum',
          }],
        },
        srsEligible: false,
      },
      {
        stableActivityId: `${targetNodeId}.guided_practice`,
        nodeId: targetNodeId,
        sourceNodeIds: ['math.im3.example.1.1.002'],
        rendererKey: 'graphing-explorer',
        mode: 'guided_practice',
        alignmentNodeIds: ['math.standard.ccss.hsf-if-c-9'],
        props: {
          equation: 'y = -3x^2 + 12x - 13',
          variant: 'compare_functions',
          responseVariant: 'compare_maximums',
          comparisonEquation: 'y = -3x^2 + 12x - 10',
          comparisonQuestion: 'The graph of f(x) is shown. Function g has a y-intercept of -10 and a vertex at (2, 2). Which function has the greater maximum value?',
          comparisonAnswer: 'second',
          vertex: [2, 2],
          yIntercept: [0, -10],
          domain: [-2, 6],
          range: [-13, 5],
        },
        gradingConfig: {
          partIds: ['greater_maximum'],
          passingScore: 1,
          partialCredit: false,
          rubric: [{
            criteria: 'Identify the function with the greater maximum.',
            points: 1,
            partId: 'greater_maximum',
          }],
        },
        srsEligible: true,
      },
      {
        stableActivityId: `${targetNodeId}.independent_practice`,
        nodeId: targetNodeId,
        sourceNodeIds: ['math.im3.example.1.1.002'],
        rendererKey: 'graphing-explorer',
        mode: 'independent_practice',
        alignmentNodeIds: ['math.standard.ccss.hsf-if-c-9'],
        props: {
          equation: 'y = -3x^2 + 6x + 2',
          variant: 'compare_functions',
          responseVariant: 'compare_maximums',
          comparisonEquation: 'y = -x^2 + 2x + 3',
          comparisonQuestion: 'The graph of f(x) is shown. Function g has a y-intercept of 3 and a vertex at (1, 4). Which function has the greater maximum value?',
          comparisonAnswer: 'first',
          vertex: [1, 4],
          yIntercept: [0, 3],
          domain: [-2, 6],
          range: [0, 8],
        },
        gradingConfig: {
          partIds: ['greater_maximum'],
          passingScore: 1,
          partialCredit: false,
          rubric: [{
            criteria: 'Identify the function with the greater maximum.',
            points: 1,
            partId: 'greater_maximum',
          }],
        },
        srsEligible: true,
      },
    ]);
    expect(expectedSrsInputs).toEqual([{
      nodeId: targetNodeId,
      blueprintId: `${targetNodeId}.blueprint`,
      standards: ['math.standard.ccss.hsf-if-c-9'],
      prerequisites: [],
      difficulty: 0.5,
      generatorKey: 'quadratic-graph-analysis',
      generatorReady: true,
      equivalentNodeIds: [],
    }]);

    const moduleTargetActivities = moduleProjection.activities.filter(
      (activity) => activity.nodeId === targetNodeId,
    );
    const rootTargetActivities = rootProjection.activities.filter(
      (activity) => activity.nodeId === targetNodeId,
    );
    const moduleTargetSrsInputs = moduleProjection.srsInputs.filter(
      (entry) => entry.nodeId === targetNodeId,
    );
    const rootTargetSrsInputs = rootProjection.srsInputs.filter(
      (entry) => entry.nodeId === targetNodeId,
    );
    const standaloneTargetSrsInputs = standaloneProjection.srsInputs.filter(
      (entry) => entry.nodeId === targetNodeId,
    );

    expect(moduleTargetActivities).toHaveLength(3);
    expect(rootTargetActivities).toHaveLength(3);
    expect(moduleTargetSrsInputs).toHaveLength(1);
    expect(rootTargetSrsInputs).toHaveLength(1);
    expect(standaloneTargetSrsInputs).toHaveLength(1);
    expect(moduleTargetActivities).toEqual(expectedActivities);
    expect(rootTargetActivities).toEqual(expectedActivities);
    expect(moduleTargetActivities).toEqual(rootTargetActivities);
    expect(moduleTargetSrsInputs).toEqual(expectedSrsInputs);
    expect(rootTargetSrsInputs).toEqual(expectedSrsInputs);
    expect(moduleTargetSrsInputs).toEqual(rootTargetSrsInputs);
    expect(standaloneTargetSrsInputs).toEqual(expectedSrsInputs);
    expect(moduleTargetSrsInputs).toEqual(standaloneTargetSrsInputs);
  });

  it('stores the exact ready profit-model activity and SRS rows in all mirrors', () => {
    const graph = moduleGraph();
    const targetNodeId =
      'math.im3.skill.1.1.build-and-simplify-a-quadratic-profit-model-from-context';
    const expectedActivities = projectActivityMap(graph.nodes, graph.edges, moduleBlueprints)
      .filter((activity) => activity.nodeId === targetNodeId);
    const expectedSrsInputs = JSON.parse(
      JSON.stringify(
        projectSrsInputs(graph.nodes, graph.edges, moduleBlueprints)
          .filter((entry) => entry.nodeId === targetNodeId),
      ),
    ) as SrsProjectionEntry[];
    const moduleProjection = moduleProjectionJson as {
      activities: ProjectedActivity[];
      srsInputs: SrsProjectionEntry[];
    };
    const rootProjection = rootProjectionJson as {
      activities: ProjectedActivity[];
      srsInputs: SrsProjectionEntry[];
    };
    const standaloneProjection = standaloneSrsJson as {
      srsInputs: SrsProjectionEntry[];
    };

    expect(expectedActivities).toHaveLength(3);
    expect(expectedActivities.map((activity) => activity.mode)).toEqual([
      'worked_example',
      'guided_practice',
      'independent_practice',
    ]);
    expect(expectedActivities.map((activity) => activity.srsEligible)).toEqual([false, true, true]);
    expect(expectedSrsInputs).toEqual([{
      nodeId: targetNodeId,
      blueprintId: `${targetNodeId}.blueprint`,
      standards: [
        'math.standard.ccss.hsf-bf-a-1a',
        'math.standard.ccss.hsa-apr-a-1',
      ],
      prerequisites: [],
      difficulty: 0.5,
      generatorKey: 'quadratic-profit-model',
      generatorReady: true,
      equivalentNodeIds: [],
    }]);

    for (const projection of [moduleProjection, rootProjection]) {
      expect(projection.activities.filter((activity) => activity.nodeId === targetNodeId))
        .toEqual(expectedActivities);
      expect(projection.srsInputs.filter((entry) => entry.nodeId === targetNodeId))
        .toEqual(expectedSrsInputs);
    }
    expect(standaloneProjection.srsInputs.filter((entry) => entry.nodeId === targetNodeId))
      .toEqual(expectedSrsInputs);
  });

  it('stores the exact legacy average-rate activity and SRS rows in all mirrors', () => {
    const graph = moduleGraph();
    const targetNodeId = 'math.im3.skill.1.1.find-and-interpret-the-average-rate-of-change';
    const expectedActivities = projectActivityMap(graph.nodes, graph.edges, moduleBlueprints);
    const expectedTargetActivities = expectedActivities.filter(
      (activity) => activity.nodeId === targetNodeId,
    );
    const expectedSrsInputs = JSON.parse(
      JSON.stringify(projectSrsInputs(graph.nodes, graph.edges, moduleBlueprints)),
    ) as SrsProjectionEntry[];
    const expectedTargetSrsInputs = expectedSrsInputs.filter(
      (entry) => entry.nodeId === targetNodeId,
    );
    const moduleProjection = moduleProjectionJson as unknown as {
      activities: ProjectedActivity[];
      srsInputs: SrsProjectionEntry[];
    };
    const rootProjection = rootProjectionJson as unknown as {
      activities: ProjectedActivity[];
      srsInputs: SrsProjectionEntry[];
    };
    const standaloneProjection = standaloneSrsJson as { srsInputs: SrsProjectionEntry[] };
    const targetNodes = graph.nodes.filter((node) => node.id === targetNodeId);

    expect(targetNodes).toHaveLength(1);
    expect(targetNodes[0]).not.toHaveProperty('independentPracticeReady');
    expect(expectedTargetActivities).toHaveLength(2);
    expect(expectedTargetActivities.map((activity) => activity.mode)).toEqual([
      'worked_example',
      'guided_practice',
    ]);
    expect(expectedTargetActivities.map((activity) => activity.stableActivityId)).toEqual([
      `${targetNodeId}.worked_example`,
      `${targetNodeId}.guided_practice`,
    ]);
    expect(expectedTargetActivities.map((activity) => activity.alignmentNodeIds)).toEqual([
      ['math.standard.ccss.hsf-if-b-6'],
      ['math.standard.ccss.hsf-if-b-6'],
    ]);
    expect(expectedTargetActivities.map((activity) => activity.srsEligible)).toEqual([
      false,
      false,
    ]);
    expect(expectedTargetSrsInputs).toEqual([{
      nodeId: targetNodeId,
      blueprintId: `${targetNodeId}.blueprint`,
      standards: ['math.standard.ccss.hsf-if-b-6'],
      prerequisites: [],
      difficulty: 0.5,
      generatorReady: false,
      equivalentNodeIds: [],
    }]);
    expect(expectedTargetSrsInputs[0]).not.toHaveProperty('generatorKey');

    expect(moduleProjection.activities.filter((activity) => activity.nodeId === targetNodeId))
      .toEqual(expectedTargetActivities);
    expect(rootProjection.activities.filter((activity) => activity.nodeId === targetNodeId))
      .toEqual(expectedTargetActivities);
    expect(moduleProjection.srsInputs.filter((entry) => entry.nodeId === targetNodeId))
      .toEqual(expectedTargetSrsInputs);
    expect(rootProjection.srsInputs.filter((entry) => entry.nodeId === targetNodeId))
      .toEqual(expectedTargetSrsInputs);
    expect(standaloneProjection.srsInputs.filter((entry) => entry.nodeId === targetNodeId))
      .toEqual(expectedTargetSrsInputs);

    for (const projection of [moduleProjection, rootProjection]) {
      const targetIndex = projection.activities.findIndex(
        (activity) => activity.nodeId === targetNodeId,
      );
      expect(projection.activities.slice(targetIndex, targetIndex + 2)).toEqual(
        expectedTargetActivities,
      );
      expect(projection.activities[targetIndex - 1]?.stableActivityId).toBe(
        'math.im3.skill.1.1.compare-maximum-values-of-quadratic-functions.independent_practice',
      );
      expect(projection.activities[targetIndex - 4]?.stableActivityId).toBe(
        'math.im3.skill.1.1.calculate-average-rate-of-change-from-an-equation.independent_practice',
      );
      expect(projection.activities[targetIndex + 2]?.stableActivityId).toBe(
        'math.im3.skill.1.1.find-and-interpret-the-maximum-of-a-quadratic-profit-model.worked_example',
      );
    }
    for (const projection of [moduleProjection, rootProjection, standaloneProjection]) {
      const targetIndex = projection.srsInputs.findIndex(
        (entry) => entry.nodeId === targetNodeId,
      );
      expect(projection.srsInputs[targetIndex - 1]?.nodeId).toBe(
        'math.im3.skill.1.1.estimate-and-verify-average-rate-of-change-from-a-graph',
      );
      expect(projection.srsInputs[targetIndex + 1]?.nodeId).toBe(
        'math.im3.skill.1.1.find-and-interpret-the-maximum-of-a-quadratic-profit-model',
      );
    }
  });

  it('stores the exact maximum-profit activity and SRS rows in all mirrors', () => {
    const graph = moduleGraph();
    const targetNodeId =
      'math.im3.skill.1.1.find-and-interpret-the-maximum-of-a-quadratic-profit-model';
    const expectedRows = projectActivityMap(graph.nodes, graph.edges, moduleBlueprints)
      .filter((activity) => activity.nodeId === targetNodeId);
    const expectedSrsRows = projectSrsInputs(graph.nodes, graph.edges, moduleBlueprints)
      .filter((entry) => entry.nodeId === targetNodeId);
    const moduleProjection = moduleProjectionJson as unknown as {
      metadata: {
        course: string;
        module: string;
        generatedAt: string;
        description: string;
      };
      activities: ProjectedActivity[];
      srsInputs: SrsProjectionEntry[];
    };
    const rootProjection = rootProjectionJson as unknown as {
      metadata: {
        course: string;
        generatedAt: string;
        description: string;
      };
      activities: ProjectedActivity[];
      srsInputs: SrsProjectionEntry[];
    };

    expect(expectedRows).toHaveLength(3);
    expect(expectedRows.map((activity) => activity.mode)).toEqual([
      'worked_example',
      'guided_practice',
      'independent_practice',
    ]);
    expect(expectedRows.map((activity) => activity.stableActivityId)).toEqual([
      `${targetNodeId}.worked_example`,
      `${targetNodeId}.guided_practice`,
      `${targetNodeId}.independent_practice`,
    ]);
    expect(expectedRows.map((activity) => activity.srsEligible)).toEqual([false, true, true]);
    expect(expectedSrsRows).toEqual([{
      nodeId: targetNodeId,
      blueprintId: `${targetNodeId}.blueprint`,
      standards: [
        'math.standard.ccss.hsf-if-b-4',
        'math.standard.ccss.hsf-if-a-2',
      ],
      prerequisites: [],
      difficulty: 0.5,
      generatorKey: 'quadratic-profit-model',
      generatorReady: true,
      equivalentNodeIds: [],
    }]);
    expect(moduleProjection.metadata).toEqual({
      course: 'im3',
      module: '1',
      generatedAt: '2026-05-09T23:07:46.606Z',
      description: 'Module 1 practice.v1 activity map projection from skill graph',
    });
    expect(rootProjection.metadata).toEqual({
      course: 'im3',
      generatedAt: '2026-05-10T06:43:17.586758+00:00',
      description: 'Full IM3 course practice.v1 activity map projection from skill graph (Modules 1-9)',
    });

    for (const projection of [moduleProjection, rootProjection]) {
      const storedRows = projection.activities.filter((activity) => activity.nodeId === targetNodeId);
      expect(storedRows).toEqual(expectedRows);
      const targetIndex = projection.activities.findIndex((activity) => activity.nodeId === targetNodeId);
      expect(projection.activities.slice(targetIndex, targetIndex + 3)).toEqual(expectedRows);
      expect(projection.activities[targetIndex - 1]?.stableActivityId).toBe(
        'math.im3.skill.1.1.find-and-interpret-the-average-rate-of-change.guided_practice',
      );
      expect(projection.activities[targetIndex + 1]?.stableActivityId).toBe(
        `${targetNodeId}.guided_practice`,
      );
      expect(projection.activities[targetIndex + 3]?.stableActivityId).toBe(
        'math.im3.skill.1.1.graph-a-quadratic-from-a-vertex-and-y-intercept-using-symmetry.worked_example',
      );
      expect(projection.srsInputs.filter((entry) => entry.nodeId === targetNodeId))
        .toEqual(expectedSrsRows);
    }
    expect(moduleProjection.activities.filter((activity) => activity.nodeId === targetNodeId))
      .toEqual(rootProjection.activities.filter((activity) => activity.nodeId === targetNodeId));
    expect(moduleProjection.srsInputs.filter((entry) => entry.nodeId === targetNodeId))
      .toEqual(rootProjection.srsInputs.filter((entry) => entry.nodeId === targetNodeId));
    expect(standaloneSrsJson.srsInputs).toBeDefined();
    const standaloneProjection = standaloneSrsJson as { srsInputs: SrsProjectionEntry[] };
    expect(standaloneProjection.srsInputs.filter((entry) => entry.nodeId === targetNodeId))
      .toEqual(expectedSrsRows);

  });

  it('stores the exact profit-model teacher-evidence rows in all mirrors', () => {
    const graph = moduleGraph();
    const targetNodeId =
      'math.im3.skill.1.1.build-and-simplify-a-quadratic-profit-model-from-context';
    const standardIds = [
      'math.standard.ccss.hsa-apr-a-1',
      'math.standard.ccss.hsf-bf-a-1a',
    ];
    const expectedTeacherEvidence = projectTeacherEvidence(graph.nodes, graph.edges);
    const expectedSkillRows = expectedTeacherEvidence.skills.filter(
      (skill) => skill.nodeId === targetNodeId,
    );
    const expectedStandardRows = expectedTeacherEvidence.standards.filter((standard) =>
      standardIds.includes(standard.standardId),
    );
    const expectedAttemptArtifacts = expectedTeacherEvidence.attemptArtifacts.filter(
      (artifact) => artifact.nodeId === targetNodeId,
    );
    const moduleProjection = moduleProjectionJson as unknown as {
      teacherEvidence: ReturnType<typeof projectTeacherEvidence>;
    };
    const rootProjection = rootProjectionJson as unknown as {
      teacherEvidence: ReturnType<typeof projectTeacherEvidence>;
    };
    const standaloneProjection = standaloneTeacherEvidenceJson as unknown as ReturnType<
      typeof projectTeacherEvidence
    >;

    expect(expectedSkillRows).toEqual([{
      nodeId: targetNodeId,
      title: 'Build and simplify a quadratic profit model from context',
      kind: 'skill',
      standardsCovered: [
        'math.standard.ccss.hsf-bf-a-1a',
        'math.standard.ccss.hsa-apr-a-1',
      ],
      prerequisitesMet: true,
      independentPracticeReady: true,
      equivalentNodeIds: [],
    }]);
    expect(expectedStandardRows).toEqual([
      {
        standardId: 'math.standard.ccss.hsa-apr-a-1',
        standardTitle: 'HSA-APR.A.1: Adding, subtracting, and multiplying polynomials',
        nodeIds: [
          'math.im3.example.1.1.003',
          targetNodeId,
        ],
        workedExampleCount: 1,
        guidedPracticeCount: 0,
        independentPracticeCount: 0,
      },
      {
        standardId: 'math.standard.ccss.hsf-bf-a-1a',
        standardTitle: 'HSF-BF.A.1a: Determine an explicit expression, a recursive process, or steps for calculation from a context',
        nodeIds: [
          'math.im3.example.1.1.003',
          targetNodeId,
        ],
        workedExampleCount: 1,
        guidedPracticeCount: 0,
        independentPracticeCount: 0,
      },
    ]);
    expect(expectedAttemptArtifacts).toEqual([]);

    for (const teacherEvidence of [
      moduleProjection.teacherEvidence,
      rootProjection.teacherEvidence,
      standaloneProjection,
    ]) {
      expect(teacherEvidence.skills.filter((skill) => skill.nodeId === targetNodeId))
        .toEqual(expectedSkillRows);
      expect(teacherEvidence.standards.filter((standard) => standardIds.includes(standard.standardId)))
        .toEqual((teacherEvidence === moduleProjection.teacherEvidence
          ? expectedStandardRows
          : projectTeacherEvidence(embeddedRootGraph().nodes, embeddedRootGraph().edges).standards.filter(standard => standardIds.includes(standard.standardId))));
      expect(teacherEvidence.attemptArtifacts.filter((artifact) => artifact.nodeId === targetNodeId))
        .toEqual(expectedAttemptArtifacts);
    }
  });

  it('stores the exact graph skill SRS row in the standalone projection', () => {
    const graph = moduleGraph();
    const targetNodeId = 'math.im3.skill.1.1.graph-quadratic-functions';
    const expectedSrsInputs = JSON.parse(
      JSON.stringify(
        projectSrsInputs(graph.nodes, graph.edges, moduleBlueprints)
          .filter((entry) => entry.nodeId === targetNodeId),
      ),
    ) as SrsProjectionEntry[];
    const standaloneProjection = standaloneSrsJson as { srsInputs: SrsProjectionEntry[] };

    expect(expectedSrsInputs).toHaveLength(1);
    expect(standaloneProjection.srsInputs.filter((entry) => entry.nodeId === targetNodeId))
      .toEqual(expectedSrsInputs);
  });

  it('stores the exact two-real-solutions activity and SRS rows in all projection mirrors', () => {
    const graph = moduleGraph();
    const targetNodeId =
      'math.im3.skill.1.2.find-two-numbers-with-given-sum-and-product-by-graphing';
    const expectedActivities = projectActivityMap(graph.nodes, graph.edges, moduleBlueprints)
      .filter((activity) => activity.nodeId === targetNodeId);
    const expectedSrsInputs = projectSrsInputs(graph.nodes, graph.edges, moduleBlueprints)
      .filter((entry) => entry.nodeId === targetNodeId);
    const moduleProjection = moduleProjectionJson as {
      activities: ProjectedActivity[];
      srsInputs: SrsProjectionEntry[];
    };
    const rootProjection = rootProjectionJson as {
      activities: ProjectedActivity[];
      srsInputs: SrsProjectionEntry[];
    };
    const standaloneProjection = standaloneSrsJson as { srsInputs: SrsProjectionEntry[] };

    expect(expectedActivities).toHaveLength(3);
    expect(expectedActivities.map((activity) => activity.mode)).toEqual([
      'worked_example',
      'guided_practice',
      'independent_practice',
    ]);
    expect(expectedActivities.map((activity) => activity.stableActivityId)).toEqual([
      `${targetNodeId}.worked_example`,
      `${targetNodeId}.guided_practice`,
      `${targetNodeId}.independent_practice`,
    ]);
    expect(expectedActivities.map((activity) => activity.srsEligible)).toEqual([
      false,
      true,
      true,
    ]);
    expect(expectedSrsInputs).toEqual([{
      nodeId: targetNodeId,
      blueprintId: `${targetNodeId}.blueprint`,
      standards: ['math.standard.ccss.hsa-rei-b-4'],
      prerequisites: [],
      difficulty: 0.5,
      generatorKey: 'two-real-solutions-graphing',
      generatorReady: true,
      equivalentNodeIds: [],
    }]);

    const moduleTargetActivities = moduleProjection.activities.filter(
      (activity) => activity.nodeId === targetNodeId,
    );
    const rootTargetActivities = rootProjection.activities.filter(
      (activity) => activity.nodeId === targetNodeId,
    );
    const moduleTargetSrsInputs = moduleProjection.srsInputs.filter(
      (entry) => entry.nodeId === targetNodeId,
    );
    const rootTargetSrsInputs = rootProjection.srsInputs.filter(
      (entry) => entry.nodeId === targetNodeId,
    );
    const standaloneTargetSrsInputs = standaloneProjection.srsInputs.filter(
      (entry) => entry.nodeId === targetNodeId,
    );

    expect(moduleTargetActivities).toEqual(expectedActivities);
    expect(rootTargetActivities).toEqual(expectedActivities);
    expect(moduleTargetActivities).toEqual(rootTargetActivities);
    expect(moduleTargetSrsInputs).toEqual(expectedSrsInputs);
    expect(rootTargetSrsInputs).toEqual(expectedSrsInputs);
    expect(standaloneTargetSrsInputs).toEqual(expectedSrsInputs);
    expect(moduleTargetSrsInputs).toEqual(rootTargetSrsInputs);
    expect(moduleTargetSrsInputs).toEqual(standaloneTargetSrsInputs);
  });
});
