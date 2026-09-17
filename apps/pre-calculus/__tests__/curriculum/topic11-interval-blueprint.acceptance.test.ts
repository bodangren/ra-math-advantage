import { describe, expect, it } from 'vitest';

import type { KnowledgeBlueprint, ProjectedActivity } from '@math-platform/knowledge-space-practice';
import {
  getPropsSchema,
} from '@math-platform/activity-components/schemas';
import {
  projectActivityMap,
  projectSrsInputs,
  validateBlueprintGeneratorReadiness,
  validateGradingCompatibility,
  validateModeSupport,
} from '@math-platform/knowledge-space-practice';
import {
  generateTopic11PhysicalContextGraphChoice,
  generateTopic11PhysicalContextGraphChoiceOutput,
  getGenerator,
} from '@math-platform/math-content/knowledge-space';
import { generateTopic11IntervalGraph } from '@/lib/practice/topic11-interval-graph';
import blueprintsDocument from '@/curriculum/skill-graph/blueprints.json';
import edgesDocument from '@/curriculum/skill-graph/edges.json';
import nodesDocument from '@/curriculum/skill-graph/nodes.json';
import activityProjectionDocument from '@/curriculum/skill-graph/projection/practice-v1-activity-map.json';
import srsProjectionDocument from '@/curriculum/skill-graph/projection/srs-input.json';
import generatorGapQueueDocument from '@/curriculum/skill-graph/generator-gap-queue.json';
import { getStudentPreviewProblem } from '../../../bus-math-v2/app/(dev)/blueprint-qa/components/RendererPreview';

const NODE_ID = 'math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs';
const PHYSICAL_CONTEXT_NODE_ID = 'math.precalc.skill.1.1.select-a-graph-that-models-a-physical-context';
const REMOVED_NODE_ID = 'math.precalc.skill.1.1.describe-covariation-in-tandem-change';
const PART_IDS = ['increasingIntervals', 'decreasingIntervals', 'constantIntervals'];

const blueprints = (blueprintsDocument as unknown as { blueprints: KnowledgeBlueprint[] }).blueprints;
const nodes = (nodesDocument as unknown as { nodes: Parameters<typeof projectActivityMap>[0] }).nodes;
const edges = (edgesDocument as unknown as { edges: Parameters<typeof projectActivityMap>[1] }).edges;
const storedActivities = (activityProjectionDocument as unknown as { activities: ProjectedActivity[] }).activities;
const storedCombinedSrsInputs = (activityProjectionDocument as unknown as {
  srsInputs: Array<Record<string, unknown>>;
}).srsInputs;
const storedStandaloneSrsInputs = (srsProjectionDocument as unknown as {
  inputs: Array<Record<string, unknown>>;
}).inputs;
const storedTeacherEvidence = (activityProjectionDocument as unknown as {
  teacherEvidence: {
    standards: Array<{ nodeIds: string[] }>;
    skills: Array<{ nodeId: string }>;
    attemptArtifacts: Array<{ nodeId: string }>;
  };
}).teacherEvidence;
const generatorGapQueue = generatorGapQueueDocument as unknown as {
  metadata: { description: string };
  items: Array<{ nodeId: string }>;
};

function sharedProps(seed: number, presentationMode: 'worked_example' | 'guided_practice' | 'independent_practice') {
  const variant = generateTopic11IntervalGraph(seed);
  const base = {
    prompt: presentationMode === 'worked_example'
      ? 'The graph of f is shown on 0 <= x <= 9. Find all intervals where f is increasing, decreasing, and constant.'
      : 'Identify the intervals where the graph increases, decreases, and stays constant.',
    domain: [...variant.domain] as [number, number],
    changePoints: [...variant.changePoints] as [number, number],
    points: variant.points.map(({ x, y }) => ({ x, y })),
    presentationMode,
  };

  if (presentationMode === 'worked_example') {
    return {
      ...base,
      title: 'Worked Example: Classify Graph Intervals',
      steps: [
        { description: 'Read the graph from left to right.', expression: 'x = 0 to x = 9' },
        { description: 'The graph rises from x=0 to x=3.', expression: '0 < x < 3' },
        { description: 'The graph falls from x=3 to x=7.', expression: '3 < x < 7' },
        { description: 'The graph rises from x=7 to x=9.', expression: '7 < x < 9' },
        {
          description: 'State all interval classifications.',
          expression: 'Increasing: [0,3] and [7,9]; decreasing: [3,7]; constant: none.',
        },
      ],
      finalAnswer: 'Increasing: [0,3] and [7,9]; decreasing: [3,7]; constant: none.',
    };
  }

  if (presentationMode === 'guided_practice') {
    const [firstChange, secondChange] = variant.changePoints;
    return {
      ...base,
      title: 'Guided Practice: Classify Graph Intervals',
      guidedSteps: [
        `Mark the domain endpoints and the change points x=${firstChange} and x=${secondChange}.`,
        'Read each graph segment from left to right and decide whether it rises, falls, or stays flat.',
        'Write each interval. Use U or ∪ between multiple intervals. Enter none when no interval exists.',
      ],
      fieldHelp: {
        increasingIntervals: 'Find every segment that rises.',
        decreasingIntervals: 'Find every segment that falls.',
        constantIntervals: 'Check whether any segment stays flat.',
      },
    };
  }

  return {
    ...base,
    title: 'Independent Practice: Classify Graph Intervals',
  };
}

function physicalWorkedProps() {
  const variant = generateTopic11PhysicalContextGraphChoice(0);
  return {
    prompt: variant.prompt,
    contextDescription: variant.contextDescription,
    xLabel: variant.xLabel,
    yLabel: variant.yLabel,
    containerProfile: variant.containerProfile,
    options: variant.options,
    presentationMode: 'worked_example' as const,
    correctOptionId: variant.correctOptionId,
    steps: [...variant.reasoning],
    finalAnswer: 'Graph D is possible because the vase is narrow, then wide, then narrow, so the height changes steeply, gently, then steeply.',
  };
}

function physicalGuidedProps() {
  const variant = generateTopic11PhysicalContextGraphChoice(1);
  return {
    prompt: variant.prompt,
    contextDescription: variant.contextDescription,
    xLabel: variant.xLabel,
    yLabel: variant.yLabel,
    containerProfile: variant.containerProfile,
    options: variant.options,
    presentationMode: 'guided_practice' as const,
    guidedSteps: [
      'Identify the independent and dependent variables.',
      'Compare how the vessel width affects the water-height rate.',
      'Select the graph whose height increases with the matching rate changes.',
    ],
    fieldHelp: 'Use the vessel width and the water-flow rate to compare the graph shapes.',
  };
}

function physicalIndependentProps() {
  const output = generateTopic11PhysicalContextGraphChoiceOutput(2);
  return (output.data as { rendererProps: Record<string, unknown> }).rendererProps;
}

describe('AP Topic 1.1 interval blueprint', () => {
  it('defines the draft physical-context graph-choice source for all three modes', () => {
    const blueprint = blueprints.find((candidate) => candidate.nodeId === PHYSICAL_CONTEXT_NODE_ID);
    const node = nodes.find((candidate) => candidate.id === PHYSICAL_CONTEXT_NODE_ID);
    const physicalRows = projectActivityMap(nodes, edges, blueprints)
      .filter((row) => row.nodeId === PHYSICAL_CONTEXT_NODE_ID);

    expect(node).toMatchObject({
      id: PHYSICAL_CONTEXT_NODE_ID,
      rendererKey: 'physical-context-graph-choice',
      independentPracticeReady: false,
    });
    expect(blueprint).toMatchObject({
      nodeId: PHYSICAL_CONTEXT_NODE_ID,
      sourceNodeIds: ['math.precalc.example.1.1.001'],
      alignmentNodeIds: ['math.standard.ccss.hsf-if-b-4'],
      rendererKey: 'physical-context-graph-choice',
      rendererModeMap: {
        worked: 'physical-context-graph-choice',
        guidedPractice: 'physical-context-graph-choice',
        independentPractice: 'physical-context-graph-choice',
      },
      generatorKey: 'topic11-physical-context-graph-choice',
      reviewStatus: 'draft',
      metadata: { course: 'precalc', unit: '1', lesson: '1' },
    });
    expect(blueprint?.workedExampleSpec?.rendererProps).toEqual(physicalWorkedProps());
    expect(blueprint?.guidedPracticeSpec?.rendererProps).toEqual(physicalGuidedProps());
    expect(blueprint?.independentPracticeSpec?.rendererProps).toEqual(physicalIndependentProps());
    expect(blueprint?.workedExampleSpec?.target).toEqual({ correctOptionId: 'D' });
    expect(blueprint?.workedExampleSpec?.steps).toEqual(
      generateTopic11PhysicalContextGraphChoice(0).reasoning.map((description) => ({ description })),
    );
    expect(blueprint?.workedExampleSpec?.rendererProps).toMatchObject({
      correctOptionId: 'D',
      finalAnswer: expect.stringContaining('Graph D'),
    });
    expect(blueprint?.guidedPracticeSpec?.rendererProps).toEqual(physicalGuidedProps());
    expect(JSON.stringify(blueprint?.guidedPracticeSpec?.rendererProps)).not.toMatch(
      /correctOptionId|reasoning|finalAnswer|solution|grading|expectedAnswer/,
    );
    expect(JSON.stringify(blueprint?.independentPracticeSpec?.rendererProps)).not.toMatch(
      /correctOptionId|reasoning|finalAnswer|solution|grading|expectedAnswer/,
    );
    expect(blueprint?.independentPracticeSpec).toMatchObject({
      variantParameters: { seed: { type: 'integer', min: 0 } },
      answerSchema: { selectedOptionId: 'string' },
      gradingRules: [{ partId: 'selectedOptionId', ruleType: 'custom', maxScore: 1 }],
      replayPolicy: 'any_seed',
    });
    expect(blueprint?.gradingSpec).toEqual({
      partIds: ['selectedOptionId'],
      passingScore: 1,
      partialCredit: false,
      rubric: [{
        criteria: 'Select the graph that matches the physical context',
        points: 1,
        partId: 'selectedOptionId',
      }],
    });
    expect(validateBlueprintGeneratorReadiness(blueprint!)).toMatchObject({ valid: true });
    expect(validateModeSupport(blueprint!)).toMatchObject({ valid: true });
    expect(validateGradingCompatibility(blueprint!)).toMatchObject({ valid: true });
    expect(getGenerator('topic11-physical-context-graph-choice')).toBeDefined();

    expect(physicalRows.map((row) => row.mode)).toEqual([
      'worked_example',
      'guided_practice',
      'independent_practice',
    ]);
    expect(physicalRows).toHaveLength(3);
    for (const row of physicalRows) {
      expect(row.rendererKey).toBe('physical-context-graph-choice');
      expect(getPropsSchema(row.rendererKey)?.safeParse(row.props).success).toBe(true);
      expect(row.srsEligible).toBe(false);
    }
  });

  it('synchronizes stored physical activity and SRS projections with fresh output', () => {
    const expectedActivities = projectActivityMap(nodes, edges, blueprints)
      .filter((row) => row.nodeId === PHYSICAL_CONTEXT_NODE_ID);
    const actualActivities = storedActivities
      .filter((row) => row.nodeId === PHYSICAL_CONTEXT_NODE_ID);

    expect(expectedActivities).toHaveLength(3);
    expect(actualActivities).toHaveLength(3);
    expect(JSON.parse(JSON.stringify(actualActivities))).toEqual(
      JSON.parse(JSON.stringify(expectedActivities)),
    );
    expect(actualActivities.map((row) => row.mode)).toEqual([
      'worked_example',
      'guided_practice',
      'independent_practice',
    ]);
    for (const row of actualActivities) {
      expect(row.rendererKey).toBe('physical-context-graph-choice');
      expect(getPropsSchema(row.rendererKey)?.safeParse(row.props).success).toBe(true);
      expect(row.srsEligible).toBe(false);
    }

    const expectedSrs = projectSrsInputs(nodes, edges, blueprints)
      .filter((entry) => entry.nodeId === PHYSICAL_CONTEXT_NODE_ID);
    const actualCombinedSrs = storedCombinedSrsInputs
      .filter((entry) => entry.nodeId === PHYSICAL_CONTEXT_NODE_ID);
    const actualStandaloneSrs = storedStandaloneSrsInputs
      .filter((entry) => entry.nodeId === PHYSICAL_CONTEXT_NODE_ID);

    expect(expectedSrs).toHaveLength(1);
    expect(actualCombinedSrs).toHaveLength(1);
    expect(actualCombinedSrs).toEqual(expectedSrs);
    expect(actualStandaloneSrs).toHaveLength(1);
    const standaloneCore = actualStandaloneSrs[0]!;
    expect(standaloneCore).toEqual(expectedSrs[0]);
    expect(generatorGapQueue.items.map((item) => item.nodeId)).not.toContain(PHYSICAL_CONTEXT_NODE_ID);
  });

  it('defines strict Worked, Guided, and Independent shared props and projects three rows', () => {
    const blueprint = blueprints.find((candidate) => candidate.nodeId === NODE_ID);
    expect(blueprint).toBeDefined();
    expect(blueprint).toMatchObject({
      nodeId: NODE_ID,
      sourceNodeIds: ['math.precalc.example.1.1.002', 'math.precalc.example.1.1.009'],
      alignmentNodeIds: ['math.standard.ccss.hsf-if-b-4'],
      rendererKey: 'interval-classification',
      rendererModeMap: {
        worked: 'interval-classification',
        guidedPractice: 'interval-classification',
        independentPractice: 'interval-classification',
      },
      reviewStatus: 'draft',
      metadata: { course: 'precalc', unit: '1', lesson: '1' },
      generatorKey: 'topic11-interval-graph',
    });

    expect(blueprint?.workedExampleSpec?.rendererProps).toEqual(sharedProps(0, 'worked_example'));
    expect(blueprint?.guidedPracticeSpec?.rendererProps).toEqual(sharedProps(0, 'guided_practice'));
    expect(blueprint?.independentPracticeSpec?.rendererProps).toEqual(sharedProps(2, 'independent_practice'));
    expect(blueprint?.workedExampleSpec).toMatchObject({
      prompt: 'The graph of f is shown on 0 <= x <= 9. Find all intervals where f is increasing, decreasing, and constant.',
      givens: ['Domain: 0 <= x <= 9', 'Change points: x=3 and x=7'],
      explanation: expect.any(String),
    });
    expect(blueprint?.guidedPracticeSpec).toMatchObject({
      scaffoldedPrompt: 'Identify the intervals where the graph increases, decreases, and stays constant.',
      revealPolicy: 'one_at_a_time',
    });
    expect(blueprint?.independentPracticeSpec).toMatchObject({
      variantParameters: { seed: { type: 'integer', min: 0 } },
      answerSchema: {
        increasingIntervals: 'string',
        decreasingIntervals: 'string',
        constantIntervals: 'string',
      },
      replayPolicy: 'any_seed',
    });
    expect(blueprint?.independentPracticeSpec?.gradingRules).toEqual(
      PART_IDS.map((partId) => ({ partId, ruleType: 'custom', maxScore: 1 })),
    );
    expect(blueprint?.gradingSpec).toEqual({
      partIds: PART_IDS,
      passingScore: 3,
      partialCredit: true,
    rubric: [
      { criteria: 'Correct increasing intervals', points: 1, partId: 'increasingIntervals' },
      { criteria: 'Correct decreasing intervals', points: 1, partId: 'decreasingIntervals' },
      { criteria: 'Correct constant intervals', points: 1, partId: 'constantIntervals' },
    ],
    });

    const rows = projectActivityMap(nodes, edges, blueprints)
      .filter((row) => row.nodeId === NODE_ID);
    expect(rows.map((row) => row.mode)).toEqual([
      'worked_example',
      'guided_practice',
      'independent_practice',
    ]);
    expect(rows).toHaveLength(3);
    for (const row of rows) {
      expect(row.rendererKey).toBe('interval-classification');
      expect(getPropsSchema(row.rendererKey)?.safeParse(row.props).success).toBe(true);
      expect(row.srsEligible).toBe(false);
    }
    expect(rows.find((row) => row.mode === 'worked_example')?.props)
      .toEqual(sharedProps(0, 'worked_example'));
    expect(rows.find((row) => row.mode === 'guided_practice')?.props)
      .toEqual(sharedProps(0, 'guided_practice'));
    expect(rows.find((row) => row.mode === 'independent_practice')?.props)
      .toEqual(sharedProps(2, 'independent_practice'));

    for (const mode of ['guided_practice', 'independent_practice'] as const) {
      const props = rows.find((row) => row.mode === mode)?.props;
      expect(JSON.stringify(props)).not.toMatch(/finalAnswer|workedExample|solution|expectedAnswer/);
    }
  });

  it('keeps the draft interval skill out of SRS while retaining its generator', () => {
    const node = nodes.find((candidate) => candidate.id === NODE_ID);
    expect(node).toMatchObject({
      id: NODE_ID,
      rendererKey: 'interval-classification',
      independentPracticeReady: false,
    });

    const activityRows = projectActivityMap(nodes, edges, blueprints)
      .filter((row) => row.nodeId === NODE_ID);
    expect(activityRows.find((row) => row.mode === 'worked_example')?.srsEligible).toBe(false);
    expect(activityRows.find((row) => row.mode === 'guided_practice')?.srsEligible).toBe(false);
    expect(activityRows.find((row) => row.mode === 'independent_practice')?.srsEligible).toBe(false);

    const srsInput = projectSrsInputs(nodes, edges, blueprints)
      .find((entry) => entry.nodeId === NODE_ID);
    expect(srsInput).toMatchObject({
      nodeId: NODE_ID,
      generatorKey: 'topic11-interval-graph',
      generatorReady: false,
    });
    expect(srsInput?.standards).toEqual(['math.standard.ccss.hsf-if-b-4']);
    expect(getGenerator('topic11-interval-graph')).toBeDefined();
  });

  it('stores ready activity and SRS projections for the interval skill', () => {
    const expectedActivities = projectActivityMap(nodes, edges, blueprints)
      .filter((row) => row.nodeId === NODE_ID)
      .sort((left, right) => left.stableActivityId.localeCompare(right.stableActivityId));
    const actualActivities = storedActivities
      .filter((row) => row.nodeId === NODE_ID)
      .sort((left, right) => left.stableActivityId.localeCompare(right.stableActivityId));
    expect(actualActivities).toHaveLength(3);
    expect(JSON.parse(JSON.stringify(actualActivities))).toEqual(
      JSON.parse(JSON.stringify(expectedActivities)),
    );

    const expectedSrs = projectSrsInputs(nodes, edges, blueprints)
      .filter((row) => row.nodeId === NODE_ID);
    const actualCombinedSrs = storedCombinedSrsInputs
      .filter((row) => row.nodeId === NODE_ID);
    expect(expectedSrs).toHaveLength(1);
    expect(actualCombinedSrs).toHaveLength(1);
    expect(actualCombinedSrs).toEqual(expectedSrs);

    const actualStandaloneSrs = storedStandaloneSrsInputs
      .filter((row) => row.nodeId === NODE_ID);
    expect(actualStandaloneSrs).toHaveLength(1);
    const standaloneCore = actualStandaloneSrs[0];
    expect(standaloneCore).toEqual(expectedSrs[0]);

    const independent = actualActivities.find((row) => row.mode === 'independent_practice');
    expect(independent?.srsEligible).toBe(false);
    expect(getStudentPreviewProblem(independent ?? null)).toBeNull();
    for (const mode of ['guided_practice', 'independent_practice'] as const) {
      const props = actualActivities.find((row) => row.mode === mode)?.props;
      expect(JSON.stringify(props)).not.toMatch(/placeholder|See curriculum|Step 1/);
      expect(JSON.stringify(props)).not.toMatch(/finalAnswer|workedExample|solution|expectedAnswer/);
    }
  });

  it('keeps five source-reviewed skills and one rejected legacy identity', () => {
    const topicSkillIds = nodes
      .filter((node) => node.kind === 'skill' && node.id.startsWith('math.precalc.skill.1.1.'))
      .map((node) => node.id)
      .sort();
    expect(topicSkillIds).toEqual([
      NODE_ID,
      PHYSICAL_CONTEXT_NODE_ID,
      'math.precalc.skill.1.1.identify-function-sign-on-intervals-from-graphs',
      'math.precalc.skill.1.1.determine-rate-of-change-sign-from-graphs',
      'math.precalc.skill.1.1.identify-rate-change-and-concavity-on-intervals',
      REMOVED_NODE_ID,
    ].sort());

    expect(blueprints.filter((blueprint) => blueprint.nodeId === REMOVED_NODE_ID)).toHaveLength(0);
    for (const nodeId of [PHYSICAL_CONTEXT_NODE_ID, NODE_ID]) {
      expect(blueprints.filter((blueprint) => blueprint.nodeId === nodeId)).toHaveLength(1);
    }

    expect(edges.filter(
      (edge) => edge.type === 'supports' && edge.sourceId === 'math.precalc.example.1.1.001',
    ).map((edge) => edge.targetId)).toEqual([PHYSICAL_CONTEXT_NODE_ID]);
    expect(edges.filter(
      (edge) => edge.type === 'supports' && edge.sourceId === 'math.precalc.example.1.1.002',
    ).map((edge) => edge.targetId)).toEqual([NODE_ID]);
    expect(edges.some((edge) => edge.sourceId === REMOVED_NODE_ID || edge.targetId === REMOVED_NODE_ID)).toBe(false);

    for (const nodeId of [PHYSICAL_CONTEXT_NODE_ID, NODE_ID]) {
      expect(blueprints.find((blueprint) => blueprint.nodeId === nodeId)?.alignmentNodeIds)
        .toEqual(['math.standard.ccss.hsf-if-b-4']);
    }

    expect(projectActivityMap(nodes, edges, blueprints).some((row) => row.nodeId === REMOVED_NODE_ID)).toBe(false);
    expect(projectSrsInputs(nodes, edges, blueprints).find((row) => row.nodeId === REMOVED_NODE_ID))
      .toMatchObject({ generatorReady: false });
  });

  it('removes obsolete generated references and the completed interval queue item', () => {
    expect(JSON.stringify(storedActivities)).not.toContain(REMOVED_NODE_ID);
    expect(storedStandaloneSrsInputs.find((row) => row.nodeId === REMOVED_NODE_ID))
      .toMatchObject({ generatorReady: false });
    expect(generatorGapQueue.items.map((item) => item.nodeId)).not.toContain(REMOVED_NODE_ID);
    expect(generatorGapQueue.items.map((item) => item.nodeId)).not.toContain(NODE_ID);
    expect(generatorGapQueue.metadata.description).toBe('PreCalc generator gap queue.');

    expect(projectActivityMap(nodes, edges, blueprints)).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ nodeId: REMOVED_NODE_ID })]),
    );
    expect(projectSrsInputs(nodes, edges, blueprints).find((row) => row.nodeId === REMOVED_NODE_ID))
      .toMatchObject({ generatorReady: false });
    expect(storedTeacherEvidence.standards.flatMap((entry) => entry.nodeIds)).not.toContain(REMOVED_NODE_ID);
    expect(storedTeacherEvidence.skills.map((entry) => entry.nodeId)).not.toContain(REMOVED_NODE_ID);
    expect(storedTeacherEvidence.attemptArtifacts.map((entry) => entry.nodeId)).not.toContain(REMOVED_NODE_ID);

    expect(storedActivities.filter((row) => row.nodeId === NODE_ID)).toHaveLength(3);
    expect(storedCombinedSrsInputs.filter((row) => row.nodeId === NODE_ID)).toHaveLength(1);
    expect(storedStandaloneSrsInputs.filter((row) => row.nodeId === NODE_ID)).toHaveLength(1);
  });
});
