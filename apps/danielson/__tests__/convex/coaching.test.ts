import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createCycle, updateCycle, readCycles } from '../../convex/coaching';
import { MemoryDb, handler, seedBase, ORG, LEADER, SYSADMIN, TEACHER, TEACHER_ACCOUNT, NOW } from '../helpers/growth-db';
beforeEach(() => { vi.spyOn(Date, 'now').mockReturnValue(NOW); });
afterEach(() => vi.restoreAllMocks());
const skillId = 'danielson.tlac.skill.double-plan';
function setup() {
  const db = new MemoryDb(); seedBase(db);
  for (const [id, date] of [['baseline', '2026-10-01'], ['followup', '2026-10-20']]) {
    db.seed('observation_records', `observation_records:${id}`, { organizationId: ORG, teacherProfileId: TEACHER,
      observerAccountId: LEADER, status: 'submitted', observedAt: `${date}T00:00:00.000Z`, items: [{ itemId: 'one', skillId,
      componentId: 'danielson.framework.component.1e', outcome: { kind: 'rated', rating: 2 }, evidenceNote: 'Students started without a plan.' }] });
  }
  return db;
}
const command = { actorAccountId: LEADER, teacherProfileId: TEACHER, skillId, action: 'Plan the student task.', support: 'Coach models one example.', followUpDate: '2026-11-10', baselineObservationId: 'observation_records:baseline' };
describe('routine coaching', () => {
  it('creates a cycle and lets only the subject add reflection', async () => {
    const db = setup();
    const created = await handler(createCycle)(db.context(), command);
    expect(created.kind).toBe('saved');
    const result = await handler(updateCycle)(db.context(), { actorAccountId: TEACHER_ACCOUNT, cycleId: created.cycleId, expectedRevision: 0, kind: 'reflect', reflection: 'I will test the revised task.' });
    expect(result.kind).toBe('saved');
    const denied = await handler(updateCycle)(db.context(), { actorAccountId: LEADER, cycleId: created.cycleId, expectedRevision: 1, kind: 'reflect', reflection: 'Written for the teacher' });
    expect(denied.kind).toBe('denied');
    const read = await handler(readCycles)(db.context(), { actorAccountId: TEACHER_ACCOUNT, teacherProfileId: TEACHER, cursor: null });
    expect(JSON.stringify(read)).toContain('I will test the revised task.');
  });
  it('denies system administrators and self evaluation', async () => {
    const db = setup();
    for (const actorAccountId of [SYSADMIN, TEACHER_ACCOUNT]) {
      expect((await handler(createCycle)(db.context(), { ...command, actorAccountId })).kind).toBe('denied');
    }
    expect(db.rows('coaching_cycles')).toHaveLength(0);
  });
  it('rejects mismatched evidence and missing actions', async () => {
    const db = setup();
    await db.patch('observation_records:baseline', { teacherProfileId: 'teacher_profiles:other' });
    expect((await handler(createCycle)(db.context(), command)).kind).toBe('invalid');
    expect((await handler(createCycle)(db.context(), { ...command, action: ' ' })).kind).toBe('invalid');
  });
  it('rejects stale writes and closure without follow-up evidence', async () => {
    const db = setup(); const created = await handler(createCycle)(db.context(), command);
    const base = { actorAccountId: LEADER, cycleId: created.cycleId, kind: 'complete', conclusion: 'Review complete.' };
    expect((await handler(updateCycle)(db.context(), { ...base, expectedRevision: 5, followUpObservationId: 'observation_records:followup' })).kind).toBe('conflict');
    expect((await handler(updateCycle)(db.context(), { ...base, expectedRevision: 0 })).kind).toBe('invalid');
    expect((await handler(updateCycle)(db.context(), { ...base, expectedRevision: 0, followUpObservationId: 'observation_records:baseline' })).kind).toBe('invalid');
    vi.mocked(Date.now).mockReturnValue(NOW + 86400000);
    await db.patch('observation_records:followup', { observedAt: new Date(NOW + 3600000).toISOString() });
    expect((await handler(updateCycle)(db.context(), { ...base, expectedRevision: 0, followUpObservationId: 'observation_records:followup' })).kind).toBe('saved');
    expect(db.rows('coaching_cycles')[0].state).toBe('complete');
  });
  it('rejects inactive teachers and future observation dates', async () => {
    const db = setup();
    await db.patch('observation_records:baseline', { observedAt: new Date(Date.now() + 86400000).toISOString() });
    expect((await handler(createCycle)(db.context(), command)).kind).toBe('invalid');
    await db.patch(TEACHER, { isActive: false, updatedAt: NOW });
    expect((await handler(createCycle)(db.context(), command)).kind).toBe('denied');
  });
});

it('does not close a cycle with evidence collected before coaching started', async () => {
  const db = setup(); const created = await handler(createCycle)(db.context(), command);
  expect((await handler(updateCycle)(db.context(), { actorAccountId: LEADER, cycleId: created.cycleId, expectedRevision: 0,
    kind: 'complete', followUpObservationId: 'observation_records:followup', conclusion: 'Old evidence is not a follow-up.' })).kind).toBe('invalid');
});

it('applies scope revocation on the next coaching request', async () => {
  const db = setup(); const created = await handler(createCycle)(db.context(), command);
  await db.patch(`role_assignments:${LEADER}:school_head`, { status: 'revoked' });
  expect((await handler(updateCycle)(db.context(), { actorAccountId: LEADER, cycleId: created.cycleId, expectedRevision: 0,
    kind: 'revise', action: 'New action', support: 'Support', followUpDate: '2026-11-10' })).kind).toBe('denied');
});

it('revises an action and rejects a date before the baseline', async () => {
  const db = setup(); const created = await handler(createCycle)(db.context(), command);
  const update = { actorAccountId: LEADER, cycleId: created.cycleId, expectedRevision: 0, kind: 'revise', action: 'Rehearse the planned task.', support: 'Coach gives feedback.', followUpDate: '2026-11-12' };
  expect((await handler(updateCycle)(db.context(), { ...update, followUpDate: '2026-01-01' })).kind).toBe('invalid');
  expect((await handler(updateCycle)(db.context(), update)).kind).toBe('saved');
  expect(db.rows('coaching_cycles')[0]).toMatchObject({ action: update.action, support: update.support, followUpDate: update.followUpDate, revision: 1 });
});
