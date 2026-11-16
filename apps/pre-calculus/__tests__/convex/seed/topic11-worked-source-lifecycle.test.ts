import { describe, expect, it } from 'vitest';

import { seedLesson1_1 } from '@/convex/seed/seed_lesson_1_1';
import { PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY } from '@/convex/activities';
import {
  PRECALCULUS_PILOT_NODE_ID,
  PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

type Row = Record<string, unknown> & { _id: string };
type SeedHandler = (context: { db: Record<string, unknown> }, args: Record<string, never>) => Promise<unknown>;

function handler(): SeedHandler {
  const value = Reflect.get(seedLesson1_1, '_handler');
  if (typeof value !== 'function') throw new Error('Missing seed handler.');
  return value as SeedHandler;
}

function createHarness() {
  const rows: Record<string, Row[]> = { lessons: [], lesson_versions: [], phase_versions: [], phase_sections: [], activities: [] };
  let serial = 0;
  const db = {
    query: (table: string) => ({
      withIndex: (_name: string, configure: (query: { eq(field: string, value: unknown): unknown }) => unknown) => {
        const conditions = new Map<string, unknown>();
        const query = { eq(field: string, value: unknown) { conditions.set(field, value); return query; } };
        configure(query);
        const selected = () => (rows[table] ?? []).filter((row) => [...conditions].every(([field, value]) => row[field] === value));
        return {
          collect: async () => selected(),
          first: async () => selected()[0] ?? null,
          unique: async () => {
            const matches = selected();
            if (matches.length > 1) throw new Error(`Duplicate ${table} rows.`);
            return matches[0] ?? null;
          },
        };
      },
    }),
    insert: async (table: string, document: Record<string, unknown>) => {
      const id = `${table}:${++serial}`;
      (rows[table] ??= []).push({ _id: id, ...structuredClone(document) });
      return id;
    },
    patch: async (id: string, document: Record<string, unknown>) => {
      const row = Object.values(rows).flat().find((candidate) => candidate._id === id);
      if (!row) throw new Error(`Unknown row ${id}.`);
      Object.assign(row, structuredClone(document));
    },
  };
  return { rows, context: { db } };
}

const runSeed = (harness: ReturnType<typeof createHarness>) => handler()(harness.context, {});
const sourceRows = (harness: ReturnType<typeof createHarness>) => harness.rows.activities.filter((row) => row.stableActivityId === PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID);

describe('Topic 1.1 Worked source seed lifecycle', () => {
  it('creates one unreviewed exact source and links its physical ID without changing the text section', async () => {
    const harness = createHarness();
    await runSeed(harness);
    const source = sourceRows(harness)[0]!;
    const phase = harness.rows.phase_versions.find((row) => row.phaseNumber === 4)!;
    const sections = harness.rows.phase_sections.filter((row) => row.phaseVersionId === phase._id);

    expect(source).toMatchObject({
      stableActivityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY,
      displayName: 'Topic 1.1: Identify Graph Intervals with Your Teacher',
      description: 'Worked-example source activity for classifying increasing, decreasing, and constant intervals.',
      approval: { status: 'unreviewed' },
      props: { nodeId: PRECALCULUS_PILOT_NODE_ID, mode: 'worked_example', source: 'teacher_led' },
      gradingConfig: { variantSeed: 0 },
    });
    expect(sections).toHaveLength(2);
    expect(sections.find((row) => row.sequenceOrder === 1)?.sectionType).toBe('text');
    expect(sections.find((row) => row.sequenceOrder === 2)).toMatchObject({
      sectionType: 'activity',
      content: { componentKey: PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY, activityId: source._id },
    });
  });

  it('preserves approval and ID on an identical replay, then resets approval after content repair', async () => {
    const harness = createHarness();
    await runSeed(harness);
    const source = sourceRows(harness)[0]!;
    source.approval = { status: 'approved', reviewedAt: 44, reviewedBy: 'teacher:1' };

    await runSeed(harness);
    expect(sourceRows(harness)).toHaveLength(1);
    expect(sourceRows(harness)[0]).toBe(source);
    expect(source.approval).toEqual({ status: 'approved', reviewedAt: 44, reviewedBy: 'teacher:1' });

    source.props = { nodeId: PRECALCULUS_PILOT_NODE_ID, mode: 'worked_example', source: 'changed' };
    await runSeed(harness);
    expect(source.approval).toEqual({ status: 'unreviewed' });
    expect(source.props).toEqual({ nodeId: PRECALCULUS_PILOT_NODE_ID, mode: 'worked_example', source: 'teacher_led' });

    source.approval = { status: 'approved' };
    source.displayName = 'Changed title';
    await runSeed(harness);
    expect(source.approval).toEqual({ status: 'unreviewed' });

    source.approval = { status: 'approved' };
    source.gradingConfig = { variantSeed: 99 };
    await runSeed(harness);
    expect(source.approval).toEqual({ status: 'unreviewed' });
    expect(source.gradingConfig).toEqual({ variantSeed: 0 });
  });

  it('rejects a duplicate stable source before any seed write', async () => {
    const harness = createHarness();
    harness.rows.activities.push(
      { _id: 'activities:a', stableActivityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID },
      { _id: 'activities:b', stableActivityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID },
    );
    const before = structuredClone(harness.rows);
    await expect(runSeed(harness)).rejects.toThrow('Duplicate Topic 1.1 source activities.');
    expect(harness.rows).toEqual(before);
  });

  it('rejects an occupied source sequence before any seed write', async () => {
    const harness = createHarness();
    await runSeed(harness);
    const phase = harness.rows.phase_versions.find((row) => row.phaseNumber === 4)!;
    const section = harness.rows.phase_sections.find((row) => row.phaseVersionId === phase._id && row.sequenceOrder === 2)!;
    section.content = { componentKey: 'other', activityId: 'activities:other' };
    const before = structuredClone(harness.rows);
    await expect(runSeed(harness)).rejects.toThrow('The Topic 1.1 source sequence is occupied.');
    expect(harness.rows).toEqual(before);
  });

  it('rejects a second selected link before any seed write', async () => {
    const harness = createHarness();
    await runSeed(harness);
    const source = sourceRows(harness)[0]!;
    const phase = harness.rows.phase_versions.find((row) => row.phaseNumber === 4)!;
    harness.rows.phase_sections.push({
      _id: 'phase_sections:duplicate', phaseVersionId: phase._id, sequenceOrder: 3,
      sectionType: 'activity', content: { componentKey: PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY, activityId: source._id },
    });
    const before = structuredClone(harness.rows);
    await expect(runSeed(harness)).rejects.toThrow('Duplicate Topic 1.1 source phase links.');
    expect(harness.rows).toEqual(before);
  });

  it('rejects duplicate Worked phases and duplicate source sequences before writes', async () => {
    const duplicatePhase = createHarness();
    await runSeed(duplicatePhase);
    const phase = duplicatePhase.rows.phase_versions.find((row) => row.phaseNumber === 4)!;
    duplicatePhase.rows.phase_versions.push({ ...structuredClone(phase), _id: 'phase_versions:duplicate' });
    const phaseBefore = structuredClone(duplicatePhase.rows);
    await expect(runSeed(duplicatePhase)).rejects.toThrow('Duplicate Topic 1.1 Worked phases.');
    expect(duplicatePhase.rows).toEqual(phaseBefore);

    const duplicateSequence = createHarness();
    await runSeed(duplicateSequence);
    const worked = duplicateSequence.rows.phase_versions.find((row) => row.phaseNumber === 4)!;
    duplicateSequence.rows.phase_sections.push({
      _id: 'phase_sections:duplicate-sequence', phaseVersionId: worked._id,
      sequenceOrder: 2, sectionType: 'activity', content: { componentKey: 'other', activityId: 'activities:other' },
    });
    const sequenceBefore = structuredClone(duplicateSequence.rows);
    await expect(runSeed(duplicateSequence)).rejects.toThrow('Duplicate Topic 1.1 Worked sequence.');
    expect(duplicateSequence.rows).toEqual(sequenceBefore);
  });

  it('rejects the selected source at the wrong sequence before writes', async () => {
    const harness = createHarness();
    await runSeed(harness);
    const source = sourceRows(harness)[0]!;
    const phase = harness.rows.phase_versions.find((row) => row.phaseNumber === 4)!;
    const section = harness.rows.phase_sections.find((row) => row.phaseVersionId === phase._id && row.sequenceOrder === 2)!;
    section.sequenceOrder = 3;
    const before = structuredClone(harness.rows);
    await expect(runSeed(harness)).rejects.toThrow('The Topic 1.1 source uses an unexpected sequence.');
    expect(harness.rows).toEqual(before);
    expect(sourceRows(harness)[0]?._id).toBe(source._id);
  });

  it('rejects phase 4 when the existing phase has another type', async () => {
    const harness = createHarness();
    await runSeed(harness);
    const phase = harness.rows.phase_versions.find((row) => row.phaseNumber === 4)!;
    phase.phaseType = 'learn';
    const before = structuredClone(harness.rows);
    await expect(runSeed(harness)).rejects.toThrow('Lesson 1.1 phase 4 is not a Worked phase.');
    expect(harness.rows).toEqual(before);
  });

  it('rejects a selected physical source link in another current-version phase', async () => {
    const harness = createHarness();
    await runSeed(harness);
    const source = sourceRows(harness)[0]!;
    const learnPhase = harness.rows.phase_versions.find((row) => row.phaseNumber === 3)!;
    const workedPhase = harness.rows.phase_versions.find((row) => row.phaseNumber === 4)!;
    harness.rows.phase_sections = harness.rows.phase_sections.filter((row) => !(
      row.phaseVersionId === workedPhase._id && row.sequenceOrder === 2
    ));
    harness.rows.phase_sections.push({
      _id: 'phase_sections:wrong-phase', phaseVersionId: learnPhase._id,
      sequenceOrder: 2, sectionType: 'activity',
      content: { componentKey: PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY, activityId: source._id },
    });
    const before = structuredClone(harness.rows);
    await expect(runSeed(harness)).rejects.toThrow('The Topic 1.1 source is linked to another phase.');
    expect(harness.rows).toEqual(before);
  });
});
