import { describe, it, expect } from 'vitest';
import { validateSrsTransition } from '../srs/transition-validator';
import type { SrsCardState } from '../srs/contract';

type PickState = Pick<SrsCardState, 'stability' | 'difficulty' | 'state' | 'reps' | 'lapses'>;

function makeState(overrides: Partial<PickState> = {}): PickState {
  return {
    stability: 0,
    difficulty: 0,
    state: 'new',
    reps: 0,
    lapses: 0,
    ...overrides,
  };
}

describe('validateSrsTransition', () => {
  it('accepts valid new → learning transition on first review', () => {
    const before = makeState({ state: 'new', reps: 0, lapses: 0 });
    const after = makeState({ state: 'learning', reps: 1, lapses: 0, stability: 0.5 });
    expect(() => validateSrsTransition(before, after)).not.toThrow();
  });

  it('accepts valid learning → review transition', () => {
    const before = makeState({ state: 'learning', reps: 1, lapses: 0 });
    const after = makeState({ state: 'review', reps: 2, lapses: 0, stability: 2.5 });
    expect(() => validateSrsTransition(before, after)).not.toThrow();
  });

  it('accepts valid review → review transition (normal success)', () => {
    const before = makeState({ state: 'review', reps: 5, lapses: 1, stability: 10 });
    const after = makeState({ state: 'review', reps: 6, lapses: 1, stability: 15 });
    expect(() => validateSrsTransition(before, after)).not.toThrow();
  });

  it('accepts valid review → relearning transition (lapse)', () => {
    const before = makeState({ state: 'review', reps: 5, lapses: 1, stability: 10 });
    const after = makeState({ state: 'relearning', reps: 6, lapses: 2, stability: 1 });
    expect(() => validateSrsTransition(before, after)).not.toThrow();
  });

  it('accepts valid relearning → review transition (recovered)', () => {
    const before = makeState({ state: 'relearning', reps: 6, lapses: 2, stability: 1 });
    const after = makeState({ state: 'review', reps: 7, lapses: 2, stability: 3 });
    expect(() => validateSrsTransition(before, after)).not.toThrow();
  });

  it('rejects transition where reps does not increase', () => {
    const before = makeState({ state: 'review', reps: 5, lapses: 0 });
    const after = makeState({ state: 'review', reps: 5, lapses: 0, stability: 12 });
    expect(() => validateSrsTransition(before, after)).toThrow('reps must increase by exactly 1');
  });

  it('rejects transition where reps increases by more than 1', () => {
    const before = makeState({ state: 'review', reps: 5, lapses: 0 });
    const after = makeState({ state: 'review', reps: 7, lapses: 0, stability: 12 });
    expect(() => validateSrsTransition(before, after)).toThrow('reps must increase by exactly 1');
  });

  it('rejects transition where lapses decrease', () => {
    const before = makeState({ state: 'review', reps: 5, lapses: 2 });
    const after = makeState({ state: 'review', reps: 6, lapses: 1, stability: 12 });
    expect(() => validateSrsTransition(before, after)).toThrow('lapses cannot decrease');
  });

  it('rejects invalid review → new transition', () => {
    const before = makeState({ state: 'review', reps: 5, lapses: 0 });
    const after = makeState({ state: 'new', reps: 6, lapses: 0, stability: 0 });
    expect(() => validateSrsTransition(before, after)).toThrow('invalid state transition');
  });

  it('rejects invalid new → review transition (skipping learning)', () => {
    const before = makeState({ state: 'new', reps: 0, lapses: 0 });
    const after = makeState({ state: 'review', reps: 1, lapses: 0, stability: 5 });
    expect(() => validateSrsTransition(before, after)).toThrow('invalid state transition');
  });

  it('rejects transition where stability decreases without a lapse', () => {
    const before = makeState({ state: 'review', reps: 5, lapses: 0, stability: 10 });
    const after = makeState({ state: 'review', reps: 6, lapses: 0, stability: 8 });
    expect(() => validateSrsTransition(before, after)).toThrow('stability cannot decrease');
  });

  it('allows stability decrease when transitioning to relearning', () => {
    const before = makeState({ state: 'review', reps: 5, lapses: 0, stability: 10 });
    const after = makeState({ state: 'relearning', reps: 6, lapses: 1, stability: 1 });
    expect(() => validateSrsTransition(before, after)).not.toThrow();
  });

  it('rejects transition from identical before and after', () => {
    const before = makeState({ state: 'review', reps: 5, lapses: 1, stability: 10 });
    const after = makeState({ state: 'review', reps: 5, lapses: 1, stability: 10 });
    expect(() => validateSrsTransition(before, after)).toThrow('reps must increase by exactly 1');
  });
});
