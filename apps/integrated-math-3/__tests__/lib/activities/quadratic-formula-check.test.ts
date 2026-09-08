import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkQuadraticFormulaDiscriminant } from '@/lib/activities/submission';

afterEach(() => vi.unstubAllGlobals());

const response = (body: unknown, ok = true) => ({ ok, json: vi.fn().mockResolvedValue(body) });

describe('checkQuadraticFormulaDiscriminant', () => {
  it.each([[true], [false]])('posts the exact public request and returns %s', async (isCorrect) => {
    const fetchMock = vi.fn().mockResolvedValue(response({ isCorrect }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(checkQuadraticFormulaDiscriminant({ activityId: 'activities:guided', rawAnswer: '84' }))
      .resolves.toBe(isCorrect);
    expect(fetchMock).toHaveBeenCalledWith('/api/activities/quadratic-formula/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activityId: 'activities:guided', fieldId: 'discriminant', rawAnswer: '84' }),
    });
  });

  it.each([
    ['a non-success response', response({ isCorrect: true }, false)],
    ['a malformed response', response({ isCorrect: 'yes' })],
    ['an expanded response', response({ isCorrect: true, answer: 84 })],
  ])('rejects %s', async (_label, value) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(value));
    await expect(checkQuadraticFormulaDiscriminant({ activityId: 'activities:guided', rawAnswer: '84' }))
      .rejects.toThrow();
  });

  it('rejects a network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    await expect(checkQuadraticFormulaDiscriminant({ activityId: 'activities:guided', rawAnswer: '84' }))
      .rejects.toThrow('offline');
  });
});
