import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';
import type {
  KnowledgeBlueprint,
  ProjectedActivity,
  SrsProjectionEntry,
} from '@math-platform/knowledge-space-practice';
import {
  projectActivityMap,
  projectSrsInputs,
} from '@math-platform/knowledge-space-practice';
import {
  getPropsSchema,
  polynomialLimitNotationEndBehaviorSchema,
  SCHEMA_REGISTRY,
} from '@math-platform/math-content/schemas';
import { generateTopic16LimitNotationEndBehaviorOutput } from '@math-platform/math-content/knowledge-space';

const GRAPH_DIR = path.join(process.cwd(), 'curriculum/skill-graph');
const NODE_ID =
  'math.precalc.skill.1.6.write-polynomial-end-behavior-in-limit-notation';
const SOURCE_ID = 'math.precalc.example.1.6.004';
const ALIGNMENT_IDS = [
  'math.standard.ccss.hsf-if-b-4',
  'math.standard.ccss.hsf-if-c-7c',
] as const;
const RENDERER_KEY = 'polynomial-limit-notation-end-behavior';
const GENERATOR_KEY = 'topic16-limit-notation-end-behavior';
const MODES = [
  'worked_example',
  'guided_practice',
  'independent_practice',
] as const;
const PART_IDS = [
  'a_leftLimit',
  'a_rightLimit',
  'b_leftLimit',
  'b_rightLimit',
] as const;
const GUIDED_STEPS = [
  'Identify the leading term for each polynomial.',
  'Use degree parity and the leading coefficient.',
  'Write the left-end and right-end limit statements.',
] as const;
const FIELD_HELP =
  'Choose positive infinity or negative infinity for each formal limit statement.';

type StoredSrsRow = SrsProjectionEntry & {
  apTopic?: unknown;
  calculatorRequired?: unknown;
  frqTaskModel?: unknown;
};

type ProjectionDocument = {
  activities?: ProjectedActivity[];
  inputs?: StoredSrsRow[];
  srsInputs?: SrsProjectionEntry[];
};

type GraphDocument = {
  edges?: Array<Record<string, unknown>>;
  nodes?: Array<Record<string, unknown>>;
  blueprints?: KnowledgeBlueprint[];
};

function readJson(fileName: string): ProjectionDocument & GraphDocument {
  return JSON.parse(
    fs.readFileSync(path.join(GRAPH_DIR, fileName), 'utf8'),
  ) as ProjectionDocument & GraphDocument;
}

function expectNoAuthority(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach(expectNoAuthority);
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    expect([
      'answer',
      'answerKey',
      'correctAnswer',
      'correctAnswers',
      'expectedAnswer',
      'grading',
      'gradingMetadata',
      'isCorrect',
      'normalizedAnswer',
      'score',
      'solution',
      'solutionSteps',
      'steps',
      'finalAnswer',
      'authority',
    ]).not.toContain(key);
    expectNoAuthority(child);
  }
}

describe('Topic 1.6 Example 4 limit-notation projections', () => {
  it('stores exact target projector output without readiness', () => {
    const nodesDocument = readJson('nodes.json');
    const nodes = nodesDocument.nodes! as unknown as Parameters<typeof projectActivityMap>[0];
    const edges = readJson('edges.json').edges! as unknown as Parameters<typeof projectActivityMap>[1];
    const blueprints = readJson('blueprints.json').blueprints!;
    const activityDocument = readJson('projection/practice-v1-activity-map.json');
    const standaloneDocument = readJson('projection/srs-input.json');

    const expectedActivities = projectActivityMap(nodes, edges, blueprints);
    const expectedSrs = projectSrsInputs(nodes, edges, blueprints);
    const actualActivities = activityDocument.activities!;
    const actualCombinedSrs = activityDocument.srsInputs!;
    const actualStandaloneSrs = standaloneDocument.inputs!;
    const expectedTargetActivities = expectedActivities.filter((row) => row.nodeId === NODE_ID);
    const actualTargetActivities = actualActivities.filter((row) => row.nodeId === NODE_ID);
    const expectedTargetSrs = expectedSrs.filter((row) => row.nodeId === NODE_ID);
    const actualTargetCombinedSrs = actualCombinedSrs.filter((row) => row.nodeId === NODE_ID);
    const actualTargetStandaloneSrs = actualStandaloneSrs.filter((row) => row.nodeId === NODE_ID);

    expect(expectedTargetActivities).toHaveLength(3);
    expect(actualTargetActivities).toHaveLength(3);
    expect(actualTargetActivities).toEqual(expectedTargetActivities);
    expect(actualTargetActivities.map((row) => row.mode)).toEqual(MODES);
    expect(actualTargetActivities.map((row) => row.stableActivityId)).toEqual(
      MODES.map((mode) => `${NODE_ID}.${mode}`),
    );
    for (const row of actualTargetActivities) expect(row.sourceNodeIds).toContain(SOURCE_ID);
    expect(actualTargetActivities.map((row) => row.alignmentNodeIds)).toEqual(
      Array.from({ length: 3 }, () => [...ALIGNMENT_IDS]),
    );
    expect(actualTargetActivities.every((row) => row.rendererKey === RENDERER_KEY)).toBe(true);
    expect(actualTargetActivities.map((row) => row.gradingConfig.partIds)).toEqual(
      Array.from({ length: 3 }, () => PART_IDS),
    );
    expect(actualTargetActivities.map((row) => row.gradingConfig.passingScore)).toEqual(
      [4, 4, 4],
    );
    expect(actualTargetActivities.map((row) => row.gradingConfig.partialCredit)).toEqual(
      [true, true, true],
    );
    expect(actualTargetActivities.every((row) => row.gradingConfig.rubric === undefined)).toBe(true);
    expect(actualTargetActivities.map((row) => row.srsEligible)).toEqual([false, false, false]);

    const workedOutput = generateTopic16LimitNotationEndBehaviorOutput(0);
    const guidedOutput = generateTopic16LimitNotationEndBehaviorOutput(1);
    const independentOutput = generateTopic16LimitNotationEndBehaviorOutput(2);
    const workedProps = {
      ...(workedOutput.data.rendererProps as Record<string, unknown>),
      presentationMode: 'worked_example',
      correctAnswers: workedOutput.expectedAnswer,
      steps: workedOutput.solutionSteps.map((step) => step.description),
      finalAnswer: 'The four polynomial end-behavior limit statements are shown above.',
    };
    const guidedProps = {
      ...(guidedOutput.data.rendererProps as Record<string, unknown>),
      presentationMode: 'guided_practice',
      guidedSteps: GUIDED_STEPS,
      fieldHelp: FIELD_HELP,
    };
    const independentProps = independentOutput.data.rendererProps;
    expect(actualTargetActivities.map((row) => row.props)).toEqual([
      workedProps,
      guidedProps,
      independentProps,
    ]);
    expect(actualTargetActivities.map((row) => row.props)).toHaveLength(3);
    for (const props of [workedProps, guidedProps, independentProps]) {
      expect(polynomialLimitNotationEndBehaviorSchema.safeParse(props).success).toBe(true);
    }
    expect(getPropsSchema(RENDERER_KEY)).toBe(polynomialLimitNotationEndBehaviorSchema);
    expect(SCHEMA_REGISTRY[RENDERER_KEY]).toBe(polynomialLimitNotationEndBehaviorSchema);
    expectNoAuthority(guidedProps);
    expectNoAuthority(independentProps);

    expect(expectedTargetSrs).toHaveLength(1);
    expect(actualTargetCombinedSrs).toHaveLength(1);
    expect(actualTargetCombinedSrs).toEqual(expectedTargetSrs);
    expect(actualTargetCombinedSrs[0]).toMatchObject({
      nodeId: NODE_ID,
      blueprintId: `${NODE_ID}.blueprint`,
      generatorKey: GENERATOR_KEY,
      generatorReady: false,
    });
    expect(actualTargetStandaloneSrs).toHaveLength(1);
    const standaloneCore = actualTargetStandaloneSrs[0]!;
    expect(standaloneCore).toEqual(expectedTargetSrs[0]);
    expect(actualTargetStandaloneSrs[0]).toMatchObject({
      generatorKey: GENERATOR_KEY,
      generatorReady: false,
    });

    const activityTargetStart = actualActivities.findIndex((row) => row.nodeId === NODE_ID);
    expect(actualActivities[activityTargetStart - 1]?.stableActivityId).toBe(
      'math.precalc.skill.1.6.determine-polynomial-end-behavior-from-equations.independent_practice',
    );
    expect(actualActivities[activityTargetStart + 3]?.stableActivityId).toBe(
      'math.precalc.skill.1.7.classify-rational-end-behavior-three-cases.worked_example',
    );
    const combinedSrsTargetIndex = actualCombinedSrs.findIndex((row) => row.nodeId === NODE_ID);
    expect(actualCombinedSrs[combinedSrsTargetIndex - 1]?.nodeId).toBe('math.precalc.skill.1.6.sketch-polynomial-functions-from-end-behavior');
    expect(actualCombinedSrs[combinedSrsTargetIndex + 1]?.nodeId).toBe(
      'math.precalc.skill.1.7.classify-rational-end-behavior-three-cases',
    );
    const standaloneSrsTargetIndex = actualStandaloneSrs.findIndex((row) => row.nodeId === NODE_ID);
    expect(actualStandaloneSrs[standaloneSrsTargetIndex - 1]?.nodeId).toBe(
      'math.precalc.skill.1.6.sketch-polynomial-functions-from-end-behavior',
    );
    expect(actualStandaloneSrs[standaloneSrsTargetIndex + 1]?.nodeId).toBe(
      'math.precalc.skill.1.7.classify-rational-end-behavior-three-cases',
    );
    expect(new Set(actualActivities.map((row) => row.stableActivityId)).size)
      .toBe(actualActivities.length);

    const targetNode = nodesDocument.nodes!.filter((node) => node.id === NODE_ID);
    expect(targetNode).toHaveLength(1);
    expect('independentPracticeReady' in (targetNode[0] ?? {})).toBe(false);
  });
});
