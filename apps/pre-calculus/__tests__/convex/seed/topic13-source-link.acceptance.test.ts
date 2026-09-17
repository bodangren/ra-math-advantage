import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';
import {
  knowledgeBlueprintSchema,
  projectActivityMap,
  projectSrsInputs,
  validateBlueprintGeneratorReadiness,
  validateGradingCompatibility,
  validateModeSupport,
} from '@math-platform/knowledge-space-practice';
import {
  getPropsSchema,
  concavityFromRateChangeSchema,
  ratePatternClassificationSchema,
} from '@math-platform/math-content';
import {
  generateTopic13ConcavityFromRateChangeOutput,
  generateTopic13RatePatternClassificationOutput,
  TOPIC13_CONCAVITY_FROM_RATE_CHANGE_NODE_ID,
  TOPIC13_RATE_PATTERN_CLASSIFICATION_NODE_ID,
} from '@math-platform/math-content/knowledge-space';
import type { KnowledgeBlueprint } from '@math-platform/knowledge-space-practice';

const EXAMPLE_ONE_ID = 'math.precalc.example.1.3.001';
const EXAMPLE_TWO_ID = 'math.precalc.example.1.3.002';
const CLASSIFICATION_NODE_ID = TOPIC13_RATE_PATTERN_CLASSIFICATION_NODE_ID;
const CONCAVITY_NODE_ID =
  TOPIC13_CONCAVITY_FROM_RATE_CHANGE_NODE_ID;
const SOURCE_REF_ONE =
  'apps/pre-calculus/curriculum/modules/unit-01-polynomial-rational/lesson-1-3/lesson.md (1-3, Example 1)';
const SOURCE_REF_TWO =
  'apps/pre-calculus/curriculum/modules/unit-01-polynomial-rational/lesson-1-3/lesson.md (1-3, Example 2)';
const CLASSIFICATION_RENDERER_KEY = 'rate-pattern-classification';
const CLASSIFICATION_GENERATOR_KEY = 'topic13-rate-pattern-classification';
const CLASSIFICATION_ALIGNMENTS = [
  'math.standard.ccss.hsf-if-b-4',
  'math.standard.ccss.hsf-le-a-1',
] as const;
const GUIDED_STEPS = [
  'Find each input width.',
  'Divide each output change by its input width.',
  'Compare the average rates and their second divided differences.',
  'Classify each function.',
] as const;
const GUIDED_FIELD_HELP =
  'Compute average rates using the actual input widths. Equal first divided differences fit a line. Equal nonzero second divided differences fit a quadratic.';
const BANNED_PRACTICE_KEYS = [
  'correctAnswer',
  'answerKey',
  'hidden',
  'authority',
  'correctOptionId',
  'correctClassifications',
  'expectedAnswer',
  'gradingMetadata',
  'grading',
  'solutionSteps',
  'finalAnswer',
  'solution',
  'steps',
  'relationship',
  'correctness',
  'score',
  'maxScore',
  'isCorrect',
  'differences',
  'secondDifferences',
] as const;
const CONCAVITY_GUIDED_STEPS = [
  'Check whether the input widths are equal.',
  'Find the first differences.',
  'Decide whether the first differences increase, decrease, or reverse direction.',
  "Classify the function's concavity.",
] as const;
const CONCAVITY_FIELD_HELP =
  'Increasing first differences indicate concave up. Decreasing first differences indicate concave down.';

type Catalog = {
  nodes: Array<Record<string, unknown>>;
  edges?: Array<Record<string, unknown>>;
};

function readDocument(fileName: string): unknown {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'curriculum/skill-graph', fileName), 'utf8'),
  ) as unknown;
}

function readCatalog(fileName: string): Catalog {
  return readDocument(fileName) as Catalog;
}

function nodeMatches(catalog: Catalog, nodeId: string): Array<Record<string, unknown>> {
  return catalog.nodes.filter((node) => node.id === nodeId);
}

function serializedKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(serializedKeys);
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, child]) => [key, ...serializedKeys(child)]);
}

describe('Topic 1.3 source-to-skill graph reconciliation', () => {
  it('keeps both authored examples exact and synchronized across graph catalogs', () => {
    const nodesCatalog = readCatalog('nodes.json');
    const draftCatalog = readCatalog('draft-nodes.json');
    const edgesCatalog = readCatalog('edges.json');
    const standardEdgesCatalog = readCatalog('standard-edges.json');

    const expectedRawText = new Map([
      [
        EXAMPLE_ONE_ID,
        'Could each function be linear, quadratic, or neither?\na) [x: 1, 2, 3, 4] → [f(x): 0, 1, 4, 9]\n**Solution:** Successive differences: 1, 3, 5. These increase by 2 (constant second differences). Since input intervals are equal (width 1), [f] could be **quadratic** (concave up).\nb) [x: 1, 2, 5, 10] → [g(x): 0, 1, 4, 9]\n**Solution:** The input widths are 1, 3, and 5. The output changes are also 1, 3, and 5. Each average rate is 1, so g could be linear: g(x) = x - 1.\nc) [x: 1, 1.1, 1.2, 1.3] → [p(x): 1, 7, 11, 13]\n**Solution:** Successive differences: 6, 4, 2. These decrease by 2 (constant second differences of [-2]). Input intervals are equal (width 0.1). [p] could be **quadratic** (concave down).',
      ],
      [
        EXAMPLE_TWO_ID,
        'Determine concavity.\n[x: 1, 1.1, 1.2, 1.3] → [k(x): 4, 1, -1, -2]\n**Solution:** Differences: [-3], [-2], [-1]. These are *increasing* (from -3 to -2 to -1). The function is **concave up**.',
      ],
    ]);

    for (const catalog of [nodesCatalog, draftCatalog, edgesCatalog, standardEdgesCatalog]) {
      for (const exampleId of [EXAMPLE_ONE_ID, EXAMPLE_TWO_ID]) {
        expect(nodeMatches(catalog, exampleId)).toHaveLength(1);
        const example = nodeMatches(catalog, exampleId)[0]!;
        expect(example.kind).toBe('worked_example');
        expect(example.metadata).toMatchObject({ rawText: expectedRawText.get(exampleId) });
      }
    }

    const rootEdges = edgesCatalog.edges!;
    for (const [exampleId, sourceRef] of [
      [EXAMPLE_ONE_ID, SOURCE_REF_ONE],
      [EXAMPLE_TWO_ID, SOURCE_REF_TWO],
    ] as const) {
      expect(rootEdges.filter((edge) => (
        edge.type === 'appears_in_context' &&
        edge.sourceId === exampleId &&
        edge.targetId === 'math.precalc.lesson.1.3'
      ))).toHaveLength(1);
      expect(rootEdges.filter((edge) => (
        edge.type === 'contains' &&
        edge.sourceId === 'math.precalc.lesson.1.3' &&
        edge.targetId === exampleId
      ))).toHaveLength(1);
      expect(nodeMatches(nodesCatalog, exampleId)[0]!.sourceRefs).toEqual([sourceRef]);
    }
  });

  it('mirrors both draft skills and adds only their direct source supports', () => {
    const nodesCatalog = readCatalog('nodes.json');
    const draftCatalog = readCatalog('draft-nodes.json');
    const rootEdges = readCatalog('edges.json').edges!;
    const expectedSkills = [
      {
        id: CLASSIFICATION_NODE_ID,
        rendererKey: CLASSIFICATION_RENDERER_KEY,
        generatorKey: CLASSIFICATION_GENERATOR_KEY,
        independentPracticeReady: true,
      },
      {
        id: CONCAVITY_NODE_ID,
        rendererKey: 'concavity-from-rate-change',
        generatorKey: 'topic13-concavity-from-rate-change',
        independentPracticeReady: true,
      },
    ];

    for (const expected of expectedSkills) {
      const rootMatches = nodeMatches(nodesCatalog, expected.id);
      const draftMatches = nodeMatches(draftCatalog, expected.id);
      expect(rootMatches).toHaveLength(1);
      expect(draftMatches).toHaveLength(1);
      expect(draftMatches[0]).toEqual(rootMatches[0]);
      expect(rootMatches[0]).toMatchObject({
        kind: 'skill',
        reviewStatus: 'draft',
        rendererKey: expected.rendererKey,
      });
      if (expected.id === CLASSIFICATION_NODE_ID) {
        expect(rootMatches[0]).toMatchObject({
          generatorKey: CLASSIFICATION_GENERATOR_KEY,
          independentPracticeReady: true,
        });
        expect(Object.keys(rootMatches[0]!).sort()).toEqual([
          'description',
          'domain',
          'generatorKey',
          'id',
          'independentPracticeReady',
          'kind',
          'metadata',
          'rendererKey',
          'reviewStatus',
          'sourceRefs',
          'title',
        ]);
      } else {
        expect(rootMatches[0]).toMatchObject({
          generatorKey: expected.generatorKey,
          independentPracticeReady: expected.independentPracticeReady,
        });
        expect(Object.keys(rootMatches[0]!).sort()).toEqual([
          'description',
          'domain',
          'generatorKey',
          'id',
          'independentPracticeReady',
          'kind',
          'metadata',
          'rendererKey',
          'reviewStatus',
          'sourceRefs',
          'title',
        ]);
      }
    }

    const expectedSupports = [
      {
        id: 'math.precalc.edge.0391',
        sourceId: EXAMPLE_ONE_ID,
        targetId: CLASSIFICATION_NODE_ID,
        sourceRefs: [SOURCE_REF_ONE],
        rationale: 'Example 1 supports classification of linear and quadratic functions from rate patterns.',
      },
      {
        id: 'math.precalc.edge.0392',
        sourceId: EXAMPLE_TWO_ID,
        targetId: CONCAVITY_NODE_ID,
        sourceRefs: [SOURCE_REF_TWO],
        rationale: 'Example 2 supports determining concavity from rate-of-change behavior.',
      },
    ];

    for (const support of expectedSupports) {
      expect(rootEdges.filter((edge) => edge.id === support.id)).toHaveLength(1);
      expect(rootEdges.filter((edge) => (
        edge.type === 'supports' &&
        edge.sourceId === support.sourceId &&
        edge.targetId === support.targetId
      ))).toHaveLength(1);
      expect(rootEdges.find((edge) => edge.id === support.id)).toEqual({
        ...support,
        type: 'supports',
        weight: 1,
        confidence: 'high',
        reviewStatus: 'draft',
        metadata: { course: 'precalc', unit: '1', lesson: '3' },
      });
    }
  });

  it('keeps both Topic 1.3 blueprints and projections source-linked', () => {
    const blueprints = (readDocument('blueprints.json') as {
      blueprints: Array<Record<string, unknown>>;
    }).blueprints as unknown as KnowledgeBlueprint[];
    const nodesCatalog = readCatalog('nodes.json');
    const nodes = readCatalog('nodes.json').nodes as unknown as Parameters<typeof projectActivityMap>[0];
    const edges = readCatalog('edges.json').edges as unknown as Parameters<typeof projectActivityMap>[1];
    const projection = readDocument('projection/practice-v1-activity-map.json') as {
      activities: Array<Record<string, unknown>>;
      srsInputs: Array<Record<string, unknown>>;
    };
    const standaloneSrs = readDocument('projection/srs-input.json') as {
      inputs: Array<Record<string, unknown>>;
    };
    const generatorQueue = readDocument('generator-gap-queue.json') as {
      items: Array<Record<string, unknown>>;
    };
    const componentQueue = readDocument('component-gap-queue.json') as {
      items: Array<Record<string, unknown>>;
    };

    const classificationBlueprints = blueprints.filter((blueprint) => blueprint.nodeId === CLASSIFICATION_NODE_ID);
    const concavityBlueprints = blueprints.filter((blueprint) => blueprint.nodeId === CONCAVITY_NODE_ID);
    expect(classificationBlueprints).toHaveLength(1);
    expect(concavityBlueprints).toHaveLength(1);

    const classificationBlueprint = classificationBlueprints[0]!;
    const seed0 = generateTopic13RatePatternClassificationOutput(0);
    const seed1 = generateTopic13RatePatternClassificationOutput(1);
    const seed2 = generateTopic13RatePatternClassificationOutput(2);
    const seed0RendererProps = seed0.data.rendererProps as Record<string, unknown>;
    const seed1RendererProps = seed1.data.rendererProps as Record<string, unknown>;
    const seed2RendererProps = seed2.data.rendererProps as Record<string, unknown>;
    const expectedWorkedProps = {
      ...seed0RendererProps,
      presentationMode: 'worked_example',
      correctClassifications: seed0.expectedAnswer,
      steps: seed0.solutionSteps.map((step) => step.description),
      finalAnswer: 'a) quadratic; b) linear; c) quadratic.',
    };
    const expectedGuidedProps = {
      ...seed1RendererProps,
      presentationMode: 'guided_practice',
      guidedSteps: [...GUIDED_STEPS],
      fieldHelp: GUIDED_FIELD_HELP,
    };
    const expectedIndependentProps = seed2RendererProps;

    expect(classificationBlueprint).toMatchObject({
      nodeId: CLASSIFICATION_NODE_ID,
      sourceNodeIds: [EXAMPLE_ONE_ID],
      alignmentNodeIds: [...CLASSIFICATION_ALIGNMENTS],
      rendererKey: CLASSIFICATION_RENDERER_KEY,
      rendererModeMap: {
        worked: CLASSIFICATION_RENDERER_KEY,
        guidedPractice: CLASSIFICATION_RENDERER_KEY,
        independentPractice: CLASSIFICATION_RENDERER_KEY,
      },
      generatorKey: CLASSIFICATION_GENERATOR_KEY,
      reviewStatus: 'draft',
      metadata: { course: 'precalc', unit: '1', lesson: '3' },
    });
    expect(classificationBlueprint).not.toHaveProperty('exceptions');
    expect(classificationBlueprint.workedExampleSpec).toMatchObject({
      prompt: seed0.prompt,
      target: seed0.expectedAnswer,
      steps: seed0.solutionSteps,
      rendererProps: expectedWorkedProps,
    });
    expect(classificationBlueprint.guidedPracticeSpec).toMatchObject({
      stepPrompts: [...GUIDED_STEPS],
      rendererProps: expectedGuidedProps,
    });
    expect(classificationBlueprint.independentPracticeSpec).toMatchObject({
      variantParameters: {
        seed: {
          type: 'integer',
          min: 0,
          description: 'Deterministic Topic 1.3 rate-pattern classification variant seed',
        },
      },
      answerSchema: { a: 'string', b: 'string', c: 'string' },
      gradingRules: [
        { partId: 'a', ruleType: 'exact_match', maxScore: 1 },
        { partId: 'b', ruleType: 'exact_match', maxScore: 1 },
        { partId: 'c', ruleType: 'exact_match', maxScore: 1 },
      ],
      replayPolicy: 'any_seed',
      rendererProps: expectedIndependentProps,
    });
    expect(classificationBlueprint.gradingSpec).toEqual({
      partIds: ['a', 'b', 'c'],
      passingScore: 3,
      partialCredit: true,
      rubric: [
        { criteria: 'Classify case a from its rate pattern.', points: 1, partId: 'a' },
        { criteria: 'Classify case b from its rate pattern.', points: 1, partId: 'b' },
        { criteria: 'Classify case c from its rate pattern.', points: 1, partId: 'c' },
      ],
    });
    expect(knowledgeBlueprintSchema.safeParse(classificationBlueprint).success).toBe(true);
    expect(validateBlueprintGeneratorReadiness(classificationBlueprint).valid).toBe(true);
    expect(validateModeSupport(classificationBlueprint).valid).toBe(true);
    expect(validateGradingCompatibility(classificationBlueprint).valid).toBe(true);
    expect(getPropsSchema(CLASSIFICATION_RENDERER_KEY)).toBe(ratePatternClassificationSchema);
    const blueprintModeProps = [
      classificationBlueprint.workedExampleSpec?.rendererProps,
      classificationBlueprint.guidedPracticeSpec?.rendererProps,
      classificationBlueprint.independentPracticeSpec?.rendererProps,
    ];
    for (const props of blueprintModeProps) {
      expect(ratePatternClassificationSchema.safeParse(props).success).toBe(true);
    }
    expect(blueprintModeProps).toHaveLength(3);
    for (const props of blueprintModeProps.slice(1)) {
      for (const key of BANNED_PRACTICE_KEYS) {
        expect(serializedKeys(props)).not.toContain(key);
      }
    }

    const classificationRows = projection.activities.filter((row) => row.nodeId === CLASSIFICATION_NODE_ID);
    const expectedClassificationRows = projectActivityMap(nodes, edges, blueprints)
      .filter((row) => row.nodeId === CLASSIFICATION_NODE_ID);
    expect(classificationRows).toHaveLength(3);
    expect(classificationRows).toEqual(expectedClassificationRows);
    expect(classificationRows.map((row) => row.mode)).toEqual([
      'worked_example',
      'guided_practice',
      'independent_practice',
    ]);
    expect(classificationRows.map((row) => row.stableActivityId)).toEqual([
      `${CLASSIFICATION_NODE_ID}.worked_example`,
      `${CLASSIFICATION_NODE_ID}.guided_practice`,
      `${CLASSIFICATION_NODE_ID}.independent_practice`,
    ]);
    for (const row of classificationRows) expect(row.sourceNodeIds).toContain(EXAMPLE_ONE_ID);
    expect(classificationRows.every((row) => row.rendererKey === CLASSIFICATION_RENDERER_KEY)).toBe(true);
    expect(classificationRows.map((row) => row.srsEligible)).toEqual([false, true, true]);
    expect(new Set(projection.activities.map((row) => row.stableActivityId)).size).toBe(projection.activities.length);
    expect(projection.srsInputs.filter((row) => row.nodeId === CLASSIFICATION_NODE_ID)).toHaveLength(1);
    expect(standaloneSrs.inputs.filter((row) => row.nodeId === CLASSIFICATION_NODE_ID)).toHaveLength(1);
    const expectedSrs = projectSrsInputs(nodes, edges, blueprints)
      .find((row) => row.nodeId === CLASSIFICATION_NODE_ID);
    expect(expectedSrs).toBeDefined();
    expect(projection.srsInputs.find((row) => row.nodeId === CLASSIFICATION_NODE_ID)).toEqual(expectedSrs);
    expect(standaloneSrs.inputs.find((row) => row.nodeId === CLASSIFICATION_NODE_ID)).toMatchObject({
      ...expectedSrs!,
    });
    expect(standaloneSrs.inputs.find((row) => row.nodeId === CLASSIFICATION_NODE_ID)!.generatorReady).toBe(true);
    expect(projection.srsInputs.find((row) => row.nodeId === CLASSIFICATION_NODE_ID)!.generatorReady).toBe(true);

    const classificationNode = nodeMatches(nodesCatalog, CLASSIFICATION_NODE_ID)[0]!;
    const draftClassificationNode = nodeMatches(readCatalog('draft-nodes.json'), CLASSIFICATION_NODE_ID)[0]!;
    expect(draftClassificationNode).toEqual(classificationNode);
    expect(classificationNode).toMatchObject({
      rendererKey: CLASSIFICATION_RENDERER_KEY,
      generatorKey: CLASSIFICATION_GENERATOR_KEY,
      independentPracticeReady: true,
    });
    const concavityBlueprint = concavityBlueprints[0]!;
    const concavitySeed0 = generateTopic13ConcavityFromRateChangeOutput(0);
    const concavitySeed1 = generateTopic13ConcavityFromRateChangeOutput(1);
    const concavitySeed2 = generateTopic13ConcavityFromRateChangeOutput(2);
    const expectedConcavityWorkedProps = {
      ...(concavitySeed0.data.rendererProps as Record<string, unknown>),
      presentationMode: 'worked_example',
      correctClassification: concavitySeed0.expectedAnswer.classification,
      steps: concavitySeed0.solutionSteps.map((step) => step.description),
      finalAnswer: 'concave up.',
    };
    const expectedConcavityGuidedProps = {
      ...(concavitySeed1.data.rendererProps as Record<string, unknown>),
      presentationMode: 'guided_practice',
      guidedSteps: [...CONCAVITY_GUIDED_STEPS],
      fieldHelp: CONCAVITY_FIELD_HELP,
    };
    const expectedConcavityIndependentProps = concavitySeed2.data.rendererProps;

    expect(concavityBlueprint).toMatchObject({
      nodeId: CONCAVITY_NODE_ID,
      sourceNodeIds: [EXAMPLE_TWO_ID],
      alignmentNodeIds: [...CLASSIFICATION_ALIGNMENTS],
      rendererKey: 'concavity-from-rate-change',
      rendererModeMap: {
        worked: 'concavity-from-rate-change',
        guidedPractice: 'concavity-from-rate-change',
        independentPractice: 'concavity-from-rate-change',
      },
      generatorKey: 'topic13-concavity-from-rate-change',
      reviewStatus: 'draft',
      metadata: { course: 'precalc', unit: '1', lesson: '3' },
    });
    expect(concavityBlueprint).not.toHaveProperty('exceptions');
    expect(concavityBlueprint.workedExampleSpec).toEqual({
      prompt: 'Determine concavity.',
      givens: [
        'x-values: 1, 1.1, 1.2, 1.3.',
        'k(x)-values: 4, 1, -1, -2.',
      ],
      target: { classification: 'concave_up' },
      steps: concavitySeed0.solutionSteps,
      explanation: 'The first differences increase, so k is concave up.',
      rendererProps: expectedConcavityWorkedProps,
    });
    expect(concavityBlueprint.guidedPracticeSpec).toEqual({
      scaffoldedPrompt: 'Determine concavity from the rate-of-change pattern.',
      stepPrompts: [...CONCAVITY_GUIDED_STEPS],
      hints: [
        'Use the x-values to verify equal input widths.',
        'Subtract consecutive y-values to find the first differences.',
        'Check whether the first differences increase, decrease, or reverse direction.',
        "Use the pattern to classify the function's concavity.",
      ],
      checksPerStep: CONCAVITY_GUIDED_STEPS.map((step) => ({ check: step })),
      revealPolicy: 'one_at_a_time',
      rendererProps: expectedConcavityGuidedProps,
    });
    expect(concavityBlueprint.independentPracticeSpec).toEqual({
      variantParameters: {
        seed: {
          type: 'integer',
          min: 0,
          description: 'Deterministic Topic 1.3 concavity variant seed',
        },
      },
      answerSchema: { classification: 'string' },
      gradingRules: [
        { partId: 'classification', ruleType: 'exact_match', maxScore: 1 },
      ],
      replayPolicy: 'any_seed',
      rendererProps: expectedConcavityIndependentProps,
    });
    expect(knowledgeBlueprintSchema.safeParse(concavityBlueprint).success).toBe(true);
    expect(validateBlueprintGeneratorReadiness(concavityBlueprint).valid).toBe(true);
    expect(validateModeSupport(concavityBlueprint).valid).toBe(true);
    expect(validateGradingCompatibility(concavityBlueprint).valid).toBe(true);
    expect(getPropsSchema('concavity-from-rate-change')).toBe(concavityFromRateChangeSchema);
    const concavityModeProps = [
      concavityBlueprint.workedExampleSpec?.rendererProps,
      concavityBlueprint.guidedPracticeSpec?.rendererProps,
      concavityBlueprint.independentPracticeSpec?.rendererProps,
    ];
    expect(concavityModeProps).toHaveLength(3);
    for (const props of concavityModeProps) {
      expect(concavityFromRateChangeSchema.safeParse(props).success).toBe(true);
    }
    for (const props of concavityModeProps.slice(1)) {
      for (const key of BANNED_PRACTICE_KEYS) {
        expect(serializedKeys(props)).not.toContain(key);
      }
    }
    expect(concavityBlueprint.gradingSpec).toEqual({
      partIds: ['classification'],
      passingScore: 1,
      partialCredit: false,
      rubric: [
        {
          criteria: 'Classify concavity from the rate-of-change pattern.',
          points: 1,
          partId: 'classification',
        },
      ],
    });
    const concavityRows = projection.activities.filter((row) => row.nodeId === CONCAVITY_NODE_ID);
    const expectedConcavityRows = projectActivityMap(nodes, edges, blueprints)
      .filter((row) => row.nodeId === CONCAVITY_NODE_ID);
    expect(concavityRows).toHaveLength(3);
    expect(concavityRows).toEqual(expectedConcavityRows);
    expect(concavityRows.map((row) => row.mode)).toEqual([
      'worked_example',
      'guided_practice',
      'independent_practice',
    ]);
    expect(concavityRows.map((row) => row.stableActivityId)).toEqual([
      `${CONCAVITY_NODE_ID}.worked_example`,
      `${CONCAVITY_NODE_ID}.guided_practice`,
      `${CONCAVITY_NODE_ID}.independent_practice`,
    ]);
    for (const row of concavityRows) expect(row.sourceNodeIds).toContain(EXAMPLE_TWO_ID);
    expect(concavityRows.every((row) => row.rendererKey === 'concavity-from-rate-change')).toBe(true);
    expect(concavityRows.map((row) => row.srsEligible)).toEqual([false, true, true]);
    const expectedConcavitySrs = projectSrsInputs(nodes, edges, blueprints)
      .find((row) => row.nodeId === CONCAVITY_NODE_ID);
    expect(expectedConcavitySrs).toBeDefined();
    expect(projection.srsInputs.find((row) => row.nodeId === CONCAVITY_NODE_ID)).toEqual(expectedConcavitySrs);
    expect(standaloneSrs.inputs.find((row) => row.nodeId === CONCAVITY_NODE_ID)).toEqual({
      ...expectedConcavitySrs!,
    });
    expect(projection.srsInputs.find((row) => row.nodeId === CONCAVITY_NODE_ID)!.generatorReady).toBe(true);
    expect(standaloneSrs.inputs.find((row) => row.nodeId === CONCAVITY_NODE_ID)!.generatorReady).toBe(true);
    const concavityNode = nodeMatches(nodesCatalog, CONCAVITY_NODE_ID)[0]!;
    expect(nodeMatches(readCatalog('draft-nodes.json'), CONCAVITY_NODE_ID)[0]).toEqual(concavityNode);
    expect(concavityNode).toMatchObject({
      rendererKey: 'concavity-from-rate-change',
      generatorKey: 'topic13-concavity-from-rate-change',
      independentPracticeReady: true,
    });
    expect(Object.keys(concavityNode).sort()).toEqual(Object.keys(classificationNode).sort());
    expect(generatorQueue.items.filter((item) => item.nodeId === CLASSIFICATION_NODE_ID)).toHaveLength(0);
    expect(generatorQueue.items.filter((item) => item.nodeId === CONCAVITY_NODE_ID)).toHaveLength(0);
    expect(componentQueue.items.some((item) => (
      Array.isArray(item.affectedNodeIds) &&
      (item.affectedNodeIds as unknown[]).some((nodeId) => nodeId === CONCAVITY_NODE_ID)
    ))).toBe(false);
    expect(componentQueue.items.some((item) => (
      Array.isArray(item.affectedNodeIds) &&
      (item.affectedNodeIds as unknown[]).some((nodeId) => (
        nodeId === CLASSIFICATION_NODE_ID
      ))
    ))).toBe(false);
  });
});
