import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

import {
  PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_PILOT_ACTIVITY_ID,
  PRECALCULUS_PILOT_COMPONENT_KEY,
  PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY,
  PRECALCULUS_PHYSICAL_CONTEXT_COMPONENT_KEY,
  PRECALCULUS_PHYSICAL_CONTEXT_WORKED_GRADING_CONFIG,
  PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_GRADING_CONFIG,
  PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_GRADING_CONFIG,
} from '@/convex/activities';
import { seedLesson1_1 } from '@/convex/seed/seed_lesson_1_1';
import {
  PRECALCULUS_PILOT_NODE_ID,
  PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID,
  PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';
import { physicalContextGraphChoiceSchema } from '@math-platform/math-content';
import {
  generateTopic11PhysicalContextGraphChoice,
  generateTopic11PhysicalContextGraphChoiceOutput,
} from '@math-platform/math-content/knowledge-space';

type Row = Record<string, unknown> & { _id: string };

const EXAMPLE_1_NODE_ID = 'math.precalc.example.1.1.001';
const EXAMPLE_1_SOURCE_REF = 'apps/pre-calculus/curriculum/APPC  Unit 1 Passwater.pdf#page=4';
const EXAMPLE_1_RAW_TEXT = 'An empty vase has a flat narrow base, a wide rounded body, and a short narrow neck. Water enters at a constant volume rate. Option A is linear increasing. Option B changes from gentle to steep to gentle. Option C rises, falls, and rises. Option D always rises and changes from steep to gentle to steep. Select graph D.';
const EXAMPLE_2_NODE_ID = 'math.precalc.example.1.1.002';
const EXAMPLE_2_SOURCE_REF = 'apps/pre-calculus/curriculum/APPC  Unit 1 Passwater.pdf#page=5';
const EXAMPLE_2_RAW_TEXT = 'The graph of f on 0 <= x <= 9 uses straight segments from (0, -2) to (3, 4), from (3, 4) to (7, 1), and from (7, 1) to (9, 3). It increases from 0 to 3 and from 7 to 9.';
const EXAMPLE_9_NODE_ID = 'math.precalc.example.1.1.009';
const FALSE_HSF_BF_A_1_EDGE_IDS = [
  'math.alignment.precalc-example-1-1-001-to-ccss-hsf-bf-a-1',
  'math.alignment.precalc-example-1-1-002-to-ccss-hsf-bf-a-1',
];
const EXAMPLE_1_HSF_IF_B_4_EDGE_ID = 'math.alignment.precalc-example-1-1-001-to-ccss-hsf-if-b-4';
const EXAMPLE_2_HSF_IF_B_4_EDGE_ID = 'math.alignment.precalc-example-1-1-002-to-ccss-hsf-if-b-4';
const PHYSICAL_CONTEXT_SKILL_ID = 'math.precalc.skill.1.1.select-a-graph-that-models-a-physical-context';
const PHYSICAL_CONTEXT_BLUEPRINT_ID = PHYSICAL_CONTEXT_SKILL_ID;
const PHYSICAL_CONTEXT_SUPPORTS_EDGE_ID = 'math.precalc.edge.example-1-1-001-supports-physical-context-graph-selection';
const INTERVAL_SKILL_ID = 'math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs';
const INTERVAL_SUPPORTS_EDGE_ID = 'math.precalc.edge.example-1-1-002-supports-interval-reading';

type GraphNode = {
  id: string;
  kind: string;
  title: string;
  description?: string;
  sourceRefs: string[];
  reviewStatus: string;
  metadata: {
    rawText?: string;
    course?: string;
    unit?: string;
    lesson?: string;
  };
};

type GraphEdge = {
  id: string;
  sourceId: string;
  targetId: string;
  type?: string;
  weight?: number;
  confidence?: string;
  sourceRefs?: string[];
  rationale?: string;
  metadata?: Record<string, string>;
};

type GraphCatalog = { nodes: GraphNode[]; edges: GraphEdge[] };
type Blueprint = {
  nodeId: string;
  sourceNodeIds: string[];
  alignmentNodeIds: string[];
  rendererKey: string;
  rendererModeMap: Record<string, string>;
  reviewStatus: string;
  metadata: { course: string; unit: string; lesson: string };
};

function readGraphCatalog(relativePath: string): GraphCatalog {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8'),
  ) as GraphCatalog;
}

function readGraphNode(nodeId: string, relativePath: string): GraphNode {
  const catalog = readGraphCatalog(relativePath);
  const matches = catalog.nodes.filter((node) => node.id === nodeId);
  expect(matches).toHaveLength(1);
  return matches[0]!;
}

type SeedHandler = (context: { db: Record<string, unknown> }, args: Record<string, never>) => Promise<unknown>;

function seedHandler(): SeedHandler {
  const handler = Reflect.get(seedLesson1_1, '_handler');
  if (typeof handler !== 'function') {
    throw new Error('seedLesson1_1 must expose its production Convex handler.');
  }
  return handler as SeedHandler;
}

function createHarness() {
  const rows: Record<string, Row[]> = {
    lessons: [],
    lesson_versions: [],
    phase_versions: [],
    phase_sections: [],
    activities: [],
  };
  const inserts: Array<{ table: string; document: Record<string, unknown> }> = [];
  const patches: Array<{ id: string; document: Record<string, unknown> }> = [];

  function select(table: string, conditions: ReadonlyMap<string, unknown>): Row[] {
    return (rows[table] ?? []).filter((row) => (
      [...conditions].every(([field, value]) => row[field] === value)
    ));
  }

  const db = {
    query: (table: string) => ({
      withIndex: (
        _indexName: string,
        configure: (query: { eq(field: string, value: unknown): unknown }) => unknown,
      ) => {
        const conditions = new Map<string, unknown>();
        const index = {
          eq(field: string, value: unknown) {
            conditions.set(field, value);
            return index;
          },
        };
        configure(index);
        const result = {
          collect: async () => select(table, conditions),
          first: async () => select(table, conditions)[0] ?? null,
          unique: async () => {
            const matches = select(table, conditions);
            if (matches.length > 1) {
              throw new Error(`Duplicate ${table} rows for the indexed mapping`);
            }
            return matches[0] ?? null;
          },
        };
        return result;
      },
    }),
    insert: async (table: string, document: Record<string, unknown>) => {
      const tableRows = rows[table] ?? (rows[table] = []);
      const id = `${table}:${tableRows.length + 1}`;
      tableRows.push({ _id: id, ...document });
      inserts.push({ table, document });
      return id;
    },
    patch: async (id: string, document: Record<string, unknown>) => {
      const row = Object.values(rows).flat().find((candidate) => candidate._id === id);
      if (!row) throw new Error(`Unknown patch target ${id}`);
      Object.assign(row, document);
      patches.push({ id, document });
    },
  };

  return { context: { db }, inserts, patches, rows };
}

function requireRow(rows: Row[], predicate: (row: Row) => boolean, description: string): Row {
  const row = rows.find(predicate);
  if (!row) throw new Error(`Missing ${description}`);
  return row;
}

async function seed(harness: ReturnType<typeof createHarness>) {
  return seedHandler()(harness.context, {});
}

describe('Precalculus Lesson 1.1 daily source seed', () => {
  it('keeps the empty-vase Example 1 source aligned across all graph catalogs', () => {
    const nodes = [
      readGraphNode(EXAMPLE_1_NODE_ID, 'curriculum/skill-graph/nodes.json'),
      readGraphNode(EXAMPLE_1_NODE_ID, 'curriculum/skill-graph/draft-nodes.json'),
      readGraphNode(EXAMPLE_1_NODE_ID, 'curriculum/skill-graph/edges.json'),
      readGraphNode(EXAMPLE_1_NODE_ID, 'curriculum/skill-graph/standard-edges.json'),
    ];

    expect(nodes[0]).toMatchObject({
      id: EXAMPLE_1_NODE_ID,
      title: 'Example 1: Select the graph for a filling vase',
      sourceRefs: [EXAMPLE_1_SOURCE_REF],
      reviewStatus: 'draft',
      metadata: { rawText: EXAMPLE_1_RAW_TEXT },
    });
    expect(EXAMPLE_1_RAW_TEXT).toContain('Select graph D');
    expect(EXAMPLE_1_RAW_TEXT).toContain('empty vase');
    expect(EXAMPLE_1_RAW_TEXT).toContain('constant volume rate');
    expect(EXAMPLE_1_RAW_TEXT).toContain('wide rounded body');
    expect(EXAMPLE_1_RAW_TEXT).toContain('steep to gentle to steep');
    expect(nodes[1]).toEqual(nodes[0]);
    expect(nodes[2]).toEqual(nodes[0]);
    expect(nodes[3]).toEqual(nodes[0]);
  });

  it('keeps the Passwater Example 2 increasing intervals aligned across all graph catalogs', () => {
    const nodes = [
      readGraphNode(EXAMPLE_2_NODE_ID, 'curriculum/skill-graph/nodes.json'),
      readGraphNode(EXAMPLE_2_NODE_ID, 'curriculum/skill-graph/draft-nodes.json'),
      readGraphNode(EXAMPLE_2_NODE_ID, 'curriculum/skill-graph/edges.json'),
      readGraphNode(EXAMPLE_2_NODE_ID, 'curriculum/skill-graph/standard-edges.json'),
    ];

    expect(nodes[0]).toMatchObject({
      id: EXAMPLE_2_NODE_ID,
      title: 'Example 2: Find increasing intervals from a graph',
      sourceRefs: [EXAMPLE_2_SOURCE_REF],
      reviewStatus: 'draft',
      metadata: { rawText: EXAMPLE_2_RAW_TEXT },
    });
    expect(EXAMPLE_2_RAW_TEXT).toContain('0 <= x <= 9');
    expect(EXAMPLE_2_RAW_TEXT).toContain('from 0 to 3');
    expect(EXAMPLE_2_RAW_TEXT).toContain('from 7 to 9');
    expect(nodes[1]).toEqual(nodes[0]);
    expect(nodes[2]).toEqual(nodes[0]);
    expect(nodes[3]).toEqual(nodes[0]);
  });

  it('adds the physical-context graph-selection skill and its Example 1 source mapping', () => {
    const nodeCatalog = readGraphCatalog('curriculum/skill-graph/nodes.json');
    const skillNodes = nodeCatalog.nodes.filter((node) => node.id === PHYSICAL_CONTEXT_SKILL_ID);
    expect(skillNodes).toHaveLength(1);
    expect(skillNodes[0]).toMatchObject({
      id: PHYSICAL_CONTEXT_SKILL_ID,
      kind: 'skill',
      title: 'Select a graph that models a physical context',
      description: 'Given a physical context, select a graph whose direction and changing rate fit the context.',
      sourceRefs: [EXAMPLE_1_SOURCE_REF],
      reviewStatus: 'draft',
      rendererKey: 'physical-context-graph-choice',
      metadata: { course: 'precalc', unit: '1', lesson: '1' },
    });

    const blueprintCatalog = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'curriculum/skill-graph/blueprints.json'), 'utf8'),
    ) as { blueprints: Blueprint[] };
    const blueprints = blueprintCatalog.blueprints.filter((blueprint) => blueprint.nodeId === PHYSICAL_CONTEXT_BLUEPRINT_ID);
    expect(blueprints).toHaveLength(1);
    expect(blueprints[0]).toMatchObject({
      nodeId: PHYSICAL_CONTEXT_SKILL_ID,
      sourceNodeIds: [EXAMPLE_1_NODE_ID],
      alignmentNodeIds: ['math.standard.ccss.hsf-if-b-4'],
      rendererKey: 'physical-context-graph-choice',
      rendererModeMap: {},
      reviewStatus: 'draft',
      metadata: { course: 'precalc', unit: '1', lesson: '1' },
    });

    const edgeCatalog = readGraphCatalog('curriculum/skill-graph/edges.json');
    const supportsEdges = edgeCatalog.edges.filter((edge) => edge.id === PHYSICAL_CONTEXT_SUPPORTS_EDGE_ID);
    expect(supportsEdges).toHaveLength(1);
    expect(supportsEdges[0]).toMatchObject({
      id: PHYSICAL_CONTEXT_SUPPORTS_EDGE_ID,
      type: 'supports',
      sourceId: EXAMPLE_1_NODE_ID,
      targetId: PHYSICAL_CONTEXT_SKILL_ID,
      weight: 1,
      confidence: 'high',
      sourceRefs: [EXAMPLE_1_SOURCE_REF],
      rationale: 'Example 1 demonstrates physical-context graph selection.',
      metadata: { course: 'precalc', unit: '1', lesson: '1' },
    });
  });

  it('removes false HSF-BF.A.1 edges while retaining HSF-IF.B.4 for Examples 1 and 2', () => {
    const catalogs = [
      readGraphCatalog('curriculum/skill-graph/edges.json'),
      readGraphCatalog('curriculum/skill-graph/standard-edges.json'),
    ];

    for (const catalog of catalogs) {
      expect(catalog.edges.filter((edge) => FALSE_HSF_BF_A_1_EDGE_IDS.includes(edge.id))).toHaveLength(0);
      expect(catalog.edges.filter((edge) => edge.id === EXAMPLE_1_HSF_IF_B_4_EDGE_ID)).toHaveLength(1);
      expect(catalog.edges.filter((edge) => edge.id === EXAMPLE_2_HSF_IF_B_4_EDGE_ID)).toHaveLength(1);
    }
  });

  it('maps Passwater Example 2 to the draft interval-reading skill without placeholder activities', () => {
    const nodeCatalog = readGraphCatalog('curriculum/skill-graph/nodes.json');
    const skillNodes = nodeCatalog.nodes.filter((node) => node.id === INTERVAL_SKILL_ID);
    expect(skillNodes).toHaveLength(1);
    expect(skillNodes[0]).toMatchObject({
      id: INTERVAL_SKILL_ID,
      title: 'Identify intervals of increase, decrease, and constant behavior from graphs',
      description: 'Given a function graph, write precise intervals where the function is increasing, decreasing, or constant.',
      sourceRefs: [EXAMPLE_2_SOURCE_REF],
      reviewStatus: 'draft',
      metadata: { course: 'precalc', unit: '1', lesson: '1' },
      rendererKey: 'interval-classification',
    });

    const blueprintCatalog = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'curriculum/skill-graph/blueprints.json'), 'utf8'),
    ) as { blueprints: Array<Blueprint & Record<string, unknown>> };
    const blueprints = blueprintCatalog.blueprints.filter((blueprint) => blueprint.nodeId === INTERVAL_SKILL_ID);
    expect(blueprints).toHaveLength(1);
    expect(blueprints[0]).toMatchObject({
      nodeId: INTERVAL_SKILL_ID,
      sourceNodeIds: [EXAMPLE_2_NODE_ID, EXAMPLE_9_NODE_ID],
      alignmentNodeIds: ['math.standard.ccss.hsf-if-b-4'],
      rendererKey: 'interval-classification',
      rendererModeMap: {
        worked: 'interval-classification',
        guidedPractice: 'interval-classification',
        independentPractice: 'interval-classification',
      },
      reviewStatus: 'draft',
      metadata: { course: 'precalc', unit: '1', lesson: '1' },
    });
    expect(blueprints[0]).toHaveProperty('workedExampleSpec');
    expect(blueprints[0]).toHaveProperty('guidedPracticeSpec');
    expect(blueprints[0]).toHaveProperty('independentPracticeSpec');
    const serializedSpecs = JSON.stringify({
      workedExampleSpec: blueprints[0]?.workedExampleSpec,
      guidedPracticeSpec: blueprints[0]?.guidedPracticeSpec,
      independentPracticeSpec: blueprints[0]?.independentPracticeSpec,
    });
    expect(serializedSpecs).not.toMatch(/See curriculum|placeholder|STUB|\bStep 1\b/i);
    expect(blueprints[0]).not.toHaveProperty('exceptions');

    const edgeCatalog = readGraphCatalog('curriculum/skill-graph/edges.json');
    const supportsEdges = edgeCatalog.edges.filter((edge) => edge.id === INTERVAL_SUPPORTS_EDGE_ID);
    expect(supportsEdges).toHaveLength(1);
    expect(supportsEdges[0]).toMatchObject({
      id: INTERVAL_SUPPORTS_EDGE_ID,
      type: 'supports',
      sourceId: EXAMPLE_2_NODE_ID,
      targetId: INTERVAL_SKILL_ID,
      weight: 1,
      confidence: 'high',
      sourceRefs: [EXAMPLE_2_SOURCE_REF],
      rationale: 'Example 2 demonstrates interval reading from a graph.',
      metadata: { course: 'precalc', unit: '1', lesson: '1' },
    });
  });

  it('links phase 4 section 2 to the real dedicated worked-example source and keeps the guided Mastery activity separate', async () => {
    const harness = createHarness();

    await seed(harness);

    const source = requireRow(
      harness.rows.activities,
      (row) => row.stableActivityId === PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
      'Topic 1.1 daily source activity',
    );
    const mastery = requireRow(
      harness.rows.activities,
      (row) => row.stableActivityId === PRECALCULUS_PILOT_ACTIVITY_ID,
      'Topic 1.1 guided Mastery activity',
    );
    const phase4 = requireRow(
      harness.rows.phase_versions,
      (row) => row.phaseNumber === 4,
      'Lesson 1.1 phase 4',
    );
    const section1 = requireRow(
      harness.rows.phase_sections,
      (row) => row.phaseVersionId === phase4._id && row.sequenceOrder === 1,
      'phase 4 section 1',
    );
    const section2 = requireRow(
      harness.rows.phase_sections,
      (row) => row.phaseVersionId === phase4._id && row.sequenceOrder === 2,
      'phase 4 section 2',
    );

    expect(source).toMatchObject({
      stableActivityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY,
      props: {
        nodeId: PRECALCULUS_PILOT_NODE_ID,
        mode: 'worked_example',
        source: 'teacher_led',
      },
    });
    expect(mastery).toMatchObject({
      stableActivityId: PRECALCULUS_PILOT_ACTIVITY_ID,
      componentKey: PRECALCULUS_PILOT_COMPONENT_KEY,
      props: {
        nodeId: PRECALCULUS_PILOT_NODE_ID,
        mode: 'guided_practice',
      },
      approval: { status: 'unreviewed' },
    });
    expect(mastery._id).not.toBe(source._id);
    expect(section1).toMatchObject({ sequenceOrder: 1, sectionType: 'text' });
    expect(section2).toStrictEqual(expect.objectContaining({
      phaseVersionId: phase4._id,
      sequenceOrder: 2,
      sectionType: 'activity',
      content: expect.objectContaining({
        componentKey: PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY,
        activityId: source._id,
      }),
    }));
  });

  it('preserves an approval for unchanged pilot content and clears it after a content change', async () => {
    const harness = createHarness();
    await seed(harness);
    const mastery = requireRow(
      harness.rows.activities,
      (row) => row.stableActivityId === PRECALCULUS_PILOT_ACTIVITY_ID,
      'Topic 1.1 guided Mastery activity',
    );
    mastery.approval = { status: 'approved' };

    await seed(harness);
    expect(mastery.approval).toEqual({ status: 'approved' });

    mastery.description = 'Stale content.';
    await seed(harness);
    expect(mastery.approval).toEqual({ status: 'unreviewed' });
  });

  it('rejects an occupied phase 4 source sequence without changing existing rows', async () => {
    const harness = createHarness();
    await seed(harness);

    const source = requireRow(
      harness.rows.activities,
      (row) => row.stableActivityId === PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
      'Topic 1.1 daily source activity',
    );
    const phase4 = requireRow(
      harness.rows.phase_versions,
      (row) => row.phaseNumber === 4,
      'Lesson 1.1 phase 4',
    );
    const section1 = requireRow(
      harness.rows.phase_sections,
      (row) => row.phaseVersionId === phase4._id && row.sequenceOrder === 1,
      'phase 4 section 1',
    );
    const section2 = requireRow(
      harness.rows.phase_sections,
      (row) => row.phaseVersionId === phase4._id && row.sequenceOrder === 2,
      'phase 4 section 2',
    );
    section2.content = {
      componentKey: 'step-by-step-solver',
      activityId: 'activities:legacy-phase-3-source',
    };
    const rowsBefore = structuredClone(harness.rows);

    await expect(seed(harness)).rejects.toThrow('The Topic 1.1 source sequence is occupied.');
    expect(harness.rows).toEqual(rowsBefore);
    expect(section1.sectionType).toBe('text');
    expect(source._id).toBe(harness.rows.activities.find(
      (row) => row.stableActivityId === PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
    )?._id);
  });

  it('keeps one visible dedicated source and one physical source link across two safe seed runs', async () => {
    const harness = createHarness();
    await seed(harness);
    await seed(harness);

    const sourceRows = harness.rows.activities.filter(
      (row) => row.stableActivityId === PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
    );
    const source = requireRow(sourceRows, () => true, 'Topic 1.1 daily source activity');
    const phase4 = requireRow(
      harness.rows.phase_versions,
      (row) => row.phaseNumber === 4,
      'Lesson 1.1 phase 4',
    );
    const sourceLinks = harness.rows.phase_sections.filter((row) => (
      (row.content as { activityId?: string }).activityId === source._id
    ));

    expect(sourceRows).toHaveLength(1);
    expect(sourceLinks).toHaveLength(1);
    expect(sourceLinks[0]).toMatchObject({
      phaseVersionId: phase4._id,
      sequenceOrder: 2,
      sectionType: 'activity',
      content: expect.objectContaining({
        componentKey: PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY,
        activityId: source._id,
      }),
    });
  });

  it('seeds one separate Independent activity by stable ID without duplicate rows', async () => {
    const harness = createHarness();

    await seed(harness);
    await seed(harness);

    const independentRows = harness.rows.activities.filter(
      (row) => row.stableActivityId === PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID,
    );
    expect(independentRows).toHaveLength(1);
    expect(independentRows[0]).toMatchObject({
      stableActivityId: PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID,
      componentKey: PRECALCULUS_PILOT_COMPONENT_KEY,
      displayName: 'Independent Practice: Classify Graph Intervals',
      description: 'Classify the increasing, decreasing, and constant intervals from a generated graph.',
      props: {
        nodeId: PRECALCULUS_PILOT_NODE_ID,
        mode: 'independent_practice',
      },
      gradingConfig: { variantSeed: 2 },
    });
    expect(independentRows[0]?.props).toEqual({
      nodeId: PRECALCULUS_PILOT_NODE_ID,
      mode: 'independent_practice',
    });
    expect(independentRows[0]?.gradingConfig).toEqual({ variantSeed: 2 });
    expect(harness.inserts.filter(({ table, document }) => (
      table === 'activities'
      && document.stableActivityId === PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID
    ))).toHaveLength(1);
  });

  it('seeds the three physical-context activities with strict generated props', async () => {
    const harness = createHarness();

    await seed(harness);
    await seed(harness);

    const rowsFor = (stableActivityId: string) => harness.rows.activities.filter(
      (row) => row.stableActivityId === stableActivityId,
    );
    const workedRows = rowsFor(PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID);
    const guidedRows = rowsFor(PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID);
    const independentRows = rowsFor(PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID);

    expect(workedRows).toHaveLength(1);
    expect(guidedRows).toHaveLength(1);
    expect(independentRows).toHaveLength(1);
    expect(workedRows[0]?.componentKey).toBe(PRECALCULUS_PHYSICAL_CONTEXT_COMPONENT_KEY);
    expect(guidedRows[0]?.componentKey).toBe(PRECALCULUS_PHYSICAL_CONTEXT_COMPONENT_KEY);
    expect(independentRows[0]?.componentKey).toBe(PRECALCULUS_PHYSICAL_CONTEXT_COMPONENT_KEY);
    expect(workedRows[0]?.gradingConfig).toEqual(PRECALCULUS_PHYSICAL_CONTEXT_WORKED_GRADING_CONFIG);
    expect(guidedRows[0]?.gradingConfig).toEqual(PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_GRADING_CONFIG);
    expect(independentRows[0]?.gradingConfig).toEqual(PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_GRADING_CONFIG);

    const workedProps = workedRows[0]?.props as Record<string, unknown>;
    const guidedProps = guidedRows[0]?.props as Record<string, unknown>;
    const independentProps = independentRows[0]?.props as Record<string, unknown>;
    expect(physicalContextGraphChoiceSchema.safeParse(workedProps).success).toBe(true);
    expect(physicalContextGraphChoiceSchema.safeParse(guidedProps).success).toBe(true);
    expect(physicalContextGraphChoiceSchema.safeParse(independentProps).success).toBe(true);

    const workedVariant = generateTopic11PhysicalContextGraphChoice(0);
    expect(workedProps).toMatchObject({
      prompt: workedVariant.prompt,
      contextDescription: workedVariant.contextDescription,
      xLabel: workedVariant.xLabel,
      yLabel: workedVariant.yLabel,
      containerProfile: 'narrow-wide-narrow',
      options: workedVariant.options,
      presentationMode: 'worked_example',
      correctOptionId: 'D',
      steps: workedVariant.reasoning,
    });
    expect(workedProps.finalAnswer).toEqual(expect.stringContaining('Graph D'));
    expect(workedProps.finalAnswer).toEqual(expect.stringContaining('steeply, gently, then steeply'));

    const guidedVariant = generateTopic11PhysicalContextGraphChoice(1);
    expect(guidedProps).toMatchObject({
      prompt: guidedVariant.prompt,
      contextDescription: guidedVariant.contextDescription,
      xLabel: guidedVariant.xLabel,
      yLabel: guidedVariant.yLabel,
      containerProfile: guidedVariant.containerProfile,
      options: guidedVariant.options,
      presentationMode: 'guided_practice',
      guidedSteps: expect.any(Array),
      fieldHelp: expect.any(String),
    });
    for (const key of ['correctOptionId', 'reasoning', 'finalAnswer', 'solution', 'grading']) {
      expect(guidedProps).not.toHaveProperty(key);
    }

    const independentOutput = generateTopic11PhysicalContextGraphChoiceOutput(2);
    const expectedIndependentProps = (independentOutput.data as {
      rendererProps: Record<string, unknown>;
    }).rendererProps;
    expect(independentProps).toEqual(expectedIndependentProps);
    for (const key of ['correctOptionId', 'reasoning', 'finalAnswer', 'guidedSteps', 'fieldHelp', 'solution', 'grading']) {
      expect(independentProps).not.toHaveProperty(key);
    }
  });
});
