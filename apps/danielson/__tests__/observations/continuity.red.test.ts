import { describe, expect, it } from 'vitest';

import { buildObservationEvidenceCommands } from '../../lib/observations/evidence-adapter';
import { paginateObservationHistory } from '../../lib/observations/history';
import { submitObservationDraft } from '../../lib/observations/lifecycle';
import { OBSERVATION_NOW_MS, walkthroughDraft } from './fixtures';

function submitForYear(schoolYear: string, key: string, now: number) {
  const draft = walkthroughDraft({
    schoolYear,
    items: walkthroughDraft().items.map((item) => ({
      ...item,
      outcome: { kind: 'rated', rating: 3 },
    })),
  });
  const result = submitObservationDraft(draft, { submissionKey: key, now });
  if (result.kind !== 'submitted') throw new Error('Expected submitted observation');
  return result.record;
}

describe('annual observation continuity', () => {
  it('keeps school year as observation metadata and keeps teacher evidence identity continuous', () => {
    const priorYear = submitForYear('2025-2026', 'prior-year', OBSERVATION_NOW_MS - 1);
    const currentYear = submitForYear('2026-2027', 'current-year', OBSERVATION_NOW_MS);
    const priorCommands = buildObservationEvidenceCommands(priorYear);
    const currentCommands = buildObservationEvidenceCommands(currentYear);

    expect(priorYear.schoolYear).not.toBe(currentYear.schoolYear);
    expect(priorCommands[0].teacherProfileId).toBe(currentCommands[0].teacherProfileId);
    expect(priorCommands[0]).not.toHaveProperty('schoolYear');
    expect(currentCommands[0]).not.toHaveProperty('schoolYear');
    expect(priorCommands[0].targetSkillIds).toEqual(currentCommands[0].targetSkillIds);
  });

  it('paginates one history across school years without cloning records', () => {
    const records = [
      submitForYear('2024-2025', 'year-one', OBSERVATION_NOW_MS - 2),
      submitForYear('2025-2026', 'year-two', OBSERVATION_NOW_MS - 1),
      submitForYear('2026-2027', 'year-three', OBSERVATION_NOW_MS),
    ];
    const first = paginateObservationHistory(records, { cursor: null, limit: 2 });
    const second = paginateObservationHistory(records, { cursor: first.nextCursor, limit: 2 });

    expect(first.items.map((record) => record.schoolYear)).toEqual(['2026-2027', '2025-2026']);
    expect(first.nextCursor).not.toBeNull();
    expect(second.items.map((record) => record.schoolYear)).toEqual(['2024-2025']);
    expect(second.nextCursor).toBeNull();
    expect([...first.items, ...second.items].map((record) => record.observationId).sort())
      .toEqual(records.map((record) => record.observationId).sort());
  });
});
