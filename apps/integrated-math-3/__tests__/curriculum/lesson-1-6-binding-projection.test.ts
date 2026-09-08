import { describe, expect, it } from 'vitest';
import {
  knowledgeBlueprintSchema,
  projectActivityMap,
  projectSrsInputs,
  projectTeacherEvidence,
  validateBlueprintGeneratorReadiness,
  validateGradingCompatibility,
  validateModeSupport,
  validateRendererCompatibility,
  type KnowledgeBlueprint,
} from '@math-platform/knowledge-space-practice';
import { getRenderer } from '@math-platform/math-content/knowledge-space';
import type {
  KnowledgeSpaceEdge,
  KnowledgeSpaceNode,
} from '@math-platform/knowledge-space-core';
import nodesJson from '../../curriculum/skill-graph/nodes.json';
import moduleNodesJson from '../../curriculum/skill-graph/module-1/nodes.json';
import draftNodesJson from '../../curriculum/skill-graph/draft-nodes.json';
import edgesJson from '../../curriculum/skill-graph/edges.json';
import moduleEdgesJson from '../../curriculum/skill-graph/module-1/edges.json';
import standardEdgesJson from '../../curriculum/skill-graph/standard-edges.json';
import blueprintsJson from '../../curriculum/skill-graph/blueprints.json';
import moduleBlueprintsJson from '../../curriculum/skill-graph/module-1/blueprints.json';
import activityMapJson from '../../curriculum/skill-graph/projection/practice-v1-activity-map.json';
import moduleActivityMapJson from '../../curriculum/skill-graph/module-1/projection/practice-v1-activity-map.json';
import teacherMapJson from '../../curriculum/skill-graph/projection/teacher-evidence-map.json';
import srsInputJson from '../../curriculum/skill-graph/projection/srs-input.json';
import { buildIm3QuadraticFormulaDraftDocuments } from '../../convex/seed/seed_lesson_1_6';

const QF =
  'math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations';
const DISCRIMINANT =
  'math.im3.skill.1.6.use-the-discriminant-to-determine-the-number-and-type-of-sol';
const QF_RENDERER = 'math.im3.renderer.quadratic-formula';
const OWNED = new Set([QF, DISCRIMINANT]);

type JsonRecord = Record<string, any>;

const nodeCatalogs = [
  nodesJson.nodes,
  moduleNodesJson.nodes,
  draftNodesJson.nodes,
  edgesJson.nodes,
  standardEdgesJson.nodes,
] as JsonRecord[][];
const rendererNodeCatalogs = [
  nodesJson.nodes,
  moduleNodesJson.nodes,
  edgesJson.nodes,
] as JsonRecord[][];

function one<T extends JsonRecord>(rows: T[], key: string, value: string): T {
  const matches = rows.filter((row) => row[key] === value);
  expect(matches).toHaveLength(1);
  return matches[0]!;
}

function ownedRows(rows: JsonRecord[]): JsonRecord[] {
  return rows.filter((row) => OWNED.has(row.nodeId));
}

function storedShape<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

describe('IM3 Lesson 1-6 graph bindings', () => {
  it('binds the QF skill to its registered renderer in every node catalog', () => {
    for (const nodes of nodeCatalogs) {
      expect(one(nodes, 'id', QF).rendererKey).toBe('quadratic-formula');
    }
    expect(one(nodesJson.nodes, 'id', DISCRIMINANT).rendererKey).toBe(
      'discriminant-analyzer',
    );
    expect(one(moduleNodesJson.nodes, 'id', DISCRIMINANT).rendererKey).toBe(
      'discriminant-analyzer',
    );
    for (const nodes of rendererNodeCatalogs) {
      expect(one(nodes, 'id', QF_RENDERER)).toMatchObject({
        kind: 'renderer',
        reviewStatus: 'approved',
        metadata: { rendererKey: 'quadratic-formula' },
      });
    }

    expect(one(edgesJson.edges, 'id', 'math.im3.edge.m1.077')).toMatchObject({
      sourceId: QF,
      targetId: QF_RENDERER,
      type: 'rendered_by',
    });
  });

  it('defines one private-safe Guided and Independent QF blueprint', () => {
    const guidedDocument = buildIm3QuadraticFormulaDraftDocuments(
      'guided_practice',
      'activities:guided' as never,
      1,
    );
    const independentDocument = buildIm3QuadraticFormulaDraftDocuments(
      'independent_practice',
      'activities:independent' as never,
      1,
    );
    for (const rows of [blueprintsJson.blueprints, moduleBlueprintsJson.blueprints]) {
      const blueprint = one(rows, 'nodeId', QF) as KnowledgeBlueprint;
      expect(blueprint.sourceNodeIds).toEqual([
        'math.im3.example.1.6.036',
        'math.im3.example.1.6.037',
        'math.im3.example.1.6.038',
      ]);
      expect(blueprint.rendererModeMap).toEqual({
        guidedPractice: 'quadratic-formula',
        independentPractice: 'quadratic-formula',
      });
      expect(blueprint.workedExampleSpec).toBeUndefined();
      expect(blueprint.generatorKey).toBe('quadratic-formula');
      expect(blueprint.reviewStatus).toBe('draft');
      expect(blueprint.independentPracticeSpec?.replayPolicy).toBe('any_seed');
      expect(blueprint.gradingSpec).toEqual({
        partIds: ['discriminant', 'x1', 'x2'],
        partialCredit: true,
      });
      expect(knowledgeBlueprintSchema.safeParse(blueprint).success).toBe(true);
      expect(validateBlueprintGeneratorReadiness(blueprint).valid).toBe(true);
      expect(validateModeSupport(blueprint).valid).toBe(true);
      expect(validateGradingCompatibility(blueprint).valid).toBe(true);
      expect(
        validateRendererCompatibility(blueprint, {
          acceptRendererKey: (key) => Boolean(getRenderer(key)),
          validateProps: (key, props) =>
            getRenderer(key).propsSchema.safeParse(props).success,
        }).valid,
      ).toBe(true);
      expect(
        getRenderer('quadratic-formula').propsSchema.safeParse(
          blueprint.guidedPracticeSpec?.rendererProps,
        ).success,
      ).toBe(true);
      expect(
        getRenderer('quadratic-formula').propsSchema.safeParse(
          blueprint.independentPracticeSpec?.rendererProps,
        ).success,
      ).toBe(true);
      expect(blueprint.guidedPracticeSpec?.rendererProps).toEqual(
        guidedDocument.activity.props,
      );
      expect(blueprint.independentPracticeSpec?.rendererProps).toEqual(
        independentDocument.activity.props,
      );
      expect(JSON.stringify(blueprint)).not.toMatch(
        /"seed"|canonical|expectedAnswer|workedSteps|solutionSteps|roots/,
      );
    }
  });

  it('keeps discriminant classification separate and non-executable', () => {
    for (const rows of [blueprintsJson.blueprints, moduleBlueprintsJson.blueprints]) {
      const blueprint = one(rows, 'nodeId', DISCRIMINANT);
      expect(blueprint.sourceNodeIds).toEqual([
        'math.im3.example.1.6.039',
        'math.im3.example.1.6.040',
      ]);
      expect(blueprint.rendererKey).toBe('discriminant-analyzer');
      expect(blueprint.rendererModeMap).toEqual({});
      expect(blueprint.workedExampleSpec).toBeUndefined();
      expect(blueprint.guidedPracticeSpec).toBeUndefined();
      expect(blueprint.independentPracticeSpec).toBeUndefined();
    }
  });

  it('removes unsupported prerequisite and old renderer edges in both copies', () => {
    for (const rows of [edgesJson.edges, moduleEdgesJson.edges]) {
      expect(rows.some((row) => ['math.im3.edge.m1.062', 'math.im3.edge.m1.063'].includes(row.id))).toBe(false);
      expect(rows.some((row) => row.sourceId === QF && row.targetId === 'math.im3.renderer.step-by-step-solver')).toBe(false);
    }
  });

  it('matches real projector output for only the two touched skills', () => {
    const graphNodes = nodesJson.nodes as KnowledgeSpaceNode[];
    const graphEdges = edgesJson.edges as KnowledgeSpaceEdge[];
    const graphBlueprints = blueprintsJson.blueprints as KnowledgeBlueprint[];
    const moduleNodes = moduleNodesJson.nodes as KnowledgeSpaceNode[];
    const moduleEdges = moduleEdgesJson.edges as KnowledgeSpaceEdge[];
    const moduleBlueprints = moduleBlueprintsJson.blueprints as KnowledgeBlueprint[];

    const projected = projectActivityMap(graphNodes, graphEdges, graphBlueprints);
    const moduleProjected = projectActivityMap(
      moduleNodes,
      moduleEdges,
      moduleBlueprints,
    );
    expect(ownedRows(activityMapJson.activities)).toEqual(
      storedShape(ownedRows(projected)),
    );
    expect(ownedRows(moduleActivityMapJson.activities)).toEqual(
      storedShape(ownedRows(moduleProjected)),
    );
    expect(ownedRows(projected).map((row) => row.mode)).toEqual([
      'guided_practice',
      'independent_practice',
    ]);
    expect(ownedRows(projected).every((row) => row.srsEligible === false)).toBe(true);

    const srs = projectSrsInputs(graphNodes, graphEdges, graphBlueprints);
    expect(ownedRows(activityMapJson.srsInputs)).toEqual(ownedRows(srs));
    expect(ownedRows(srsInputJson.srsInputs)).toEqual(ownedRows(srs));
    expect(one(srs as JsonRecord[], 'nodeId', QF).generatorReady).toBe(true);
    expect(one(srs as JsonRecord[], 'nodeId', DISCRIMINANT).generatorReady).toBe(false);

    const teacher = projectTeacherEvidence(graphNodes, graphEdges);
    const moduleTeacher = projectTeacherEvidence(moduleNodes, moduleEdges);
    expect(ownedRows(activityMapJson.teacherEvidence.skills)).toEqual(
      ownedRows(teacher.skills),
    );
    expect(ownedRows(moduleActivityMapJson.teacherEvidence.skills)).toEqual(
      ownedRows(moduleTeacher.skills),
    );
    expect(ownedRows(teacherMapJson.skills)).toEqual(ownedRows(teacher.skills));
    expect(ownedRows(teacher.skills).every((row) => row.independentPracticeReady === false)).toBe(true);
    expect(
      (teacherMapJson.prerequisiteGaps as JsonRecord[]).some((row) =>
        OWNED.has(row.nodeId),
      ),
    ).toBe(false);
    expect(
      (activityMapJson.teacherEvidence.prerequisiteGaps as JsonRecord[]).some(
        (row) => OWNED.has(row.nodeId),
      ),
    ).toBe(false);
    expect(
      (
        moduleActivityMapJson.teacherEvidence
          .prerequisiteGaps as JsonRecord[]
      ).some((row) => OWNED.has(row.nodeId)),
    ).toBe(false);
  });
});
