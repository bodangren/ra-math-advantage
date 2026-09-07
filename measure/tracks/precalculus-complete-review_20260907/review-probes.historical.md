# Historical review probes

These probes reproduced defects before remediation. They do not test the current application. Current regression tests are in `apps/pre-calculus/__tests__`.

```ts
import { describe, it, expect, vi } from 'vitest';
import { getFunctionName } from 'convex/server';
import { getCredentialByUsername, ensureProfileByUsername, upsertCredentialByUsername } from '../../../apps/pre-calculus/convex/auth';
import { internal } from '../../../apps/pre-calculus/convex/_generated/api';
import { generateTopic13RatePatternClassificationOutput } from '../../../packages/math-content/src/knowledge-space/generators/topic13-rate-pattern-classification';
import { computeObjectiveProficiency } from '../../../packages/srs-engine/src/srs/objective-proficiency';
import { verifyPassword } from '@math-platform/core-auth';

describe('Review defect reproductions (passing means the defect exists)', () => {
  it('existing-account registration reaches the credential replacement', async () => {
    const profile = { _id: 'existing-profile', organizationId: 'existing-org', role: 'teacher' };
    const credential = { _id: 'existing-credential', isActive: false, role: 'teacher' };
    const patch = vi.fn();
    const db = { query: (table: string) => ({ withIndex: () => ({ unique: async () => table === 'profiles' ? profile : credential }) }), patch };
    const existing = await (ensureProfileByUsername as any)._handler({ db }, { username: 'existing', role: 'student' });
    expect(existing).toMatchObject({ ok: true, created: false, profileId: profile._id });
    await (upsertCredentialByUsername as any)._handler({ db }, { username: 'existing', role: 'student', passwordHash: 'replacement', passwordSalt: 'replacement-salt', passwordHashIterations: 120000, isActive: true });
    expect(patch).toHaveBeenCalledWith(credential._id, expect.objectContaining({ passwordHash: 'replacement', isActive: true, role: 'student' }));
  });
  it('the login lookup omits the credential required by verifyPassword', async () => {
    const db = { query: () => ({ withIndex: () => ({ unique: async () => ({ _id: 'credential', profileId: 'profile', isActive: true, username: 'user', role: 'student', organizationId: 'org', passwordHash: 'hash', passwordSalt: 'salt', passwordHashIterations: 120000 }) }) }) };
    const result = await (getCredentialByUsername as any)._handler({ db }, { username: 'user' });
    expect(result.passwordHash).toBeUndefined();
    await expect(verifyPassword('password', result.passwordHash)).rejects.toThrow();
  });
  it('the seed orchestrator names a different Convex module', () => {
    expect(getFunctionName((internal as any).seed.seedLesson1_1)).toBe('seed:seedLesson1_1');
    expect(getFunctionName((internal as any)['seed/seed_lesson_1_1'].seedLesson1_1)).toBe('seed/seed_lesson_1_1:seedLesson1_1');
  });
  it('two allowed variants cannot meet the default essential threshold', () => {
    const result = computeObjectiveProficiency({ objectiveId: 'pilot', priority: 'essential', variantEvidences: ['guided', 'independent'].map(variantKey => ({ variantKey, retentionStrength: 1, practiceCoverage: 1, fluencyConfidence: 'high' as const, baselineSampleCount: 10, timingReliable: true })) });
    expect(result.isProficient).toBe(false);
    expect(result.reasons).toContain('insufficient_problem_families');
  });
  it('the source table has constant slope but receives cannot_determine', () => {
    const output = generateTopic13RatePatternClassificationOutput(0);
    const x = [1, 2, 5, 10], y = [0, 1, 4, 9];
    expect(x.slice(1).map((v, i) => (y[i + 1] - y[i]) / (v - x[i]))).toEqual([1, 1, 1]);
    expect(output.expectedAnswer.b).toBe('cannot_determine');
  });
});
```
