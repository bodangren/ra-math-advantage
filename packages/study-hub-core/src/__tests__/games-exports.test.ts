import { describe, it, expect } from 'vitest';
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

  it('MatchingGameProps and SpeedRoundGameProps are exported as types', () => {
    const matchingProps = {} as MatchingGameProps;
    const speedRoundProps = {} as SpeedRoundGameProps;
    expect(matchingProps).toBeDefined();
    expect(speedRoundProps).toBeDefined();
  });
});