import { describe, it, expect, expectTypeOf } from 'vitest';
import {
  MatchingGame,
  SpeedRoundGame,
  type MatchingGameProps,
  type SpeedRoundGameProps,
} from '../index.js';

describe('study-hub-core exports for study-hub-games-adoption track', () => {
  it('exports MatchingGame as a function component', () => {
    expect(typeof MatchingGame).toBe('function');
  });

  it('exports SpeedRoundGame as a function component', () => {
    expect(typeof SpeedRoundGame).toBe('function');
  });

  it('MatchingGameProps and SpeedRoundGameProps are exported as types (compile-time)', () => {
    // The previous implementation used `const x = {} as MatchingGameProps;
    // expect(x).toBeDefined()` — a vacuous runtime assertion that proves
    // nothing (any object can be cast to any type, and `.toBeDefined()`
    // is true by construction). Per FR-19, type assertions must be
    // compile-time checks; runtime checks of cast objects are forbidden.
    expectTypeOf<MatchingGameProps>().not.toBeAny();
    expectTypeOf<MatchingGameProps>().toBeObject();
    expectTypeOf<SpeedRoundGameProps>().not.toBeAny();
    expectTypeOf<SpeedRoundGameProps>().toBeObject();
  });

  it('MatchingGame and SpeedRoundGame are React FC aliases', () => {
    expectTypeOf(MatchingGame).toBeFunction();
    expectTypeOf(SpeedRoundGame).toBeFunction();
  });
});