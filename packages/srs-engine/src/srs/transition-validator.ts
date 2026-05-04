import type { SrsCardState } from './contract';

/**
 * Pick of SrsCardState fields relevant for transition validation.
 */
type SrsStatePick = Pick<
  SrsCardState,
  'stability' | 'difficulty' | 'state' | 'reps' | 'lapses'
>;

/**
 * Valid state transitions in the FSRS model.
 */
const VALID_STATE_TRANSITIONS: Record<
  SrsCardState['state'],
  SrsCardState['state'][]
> = {
  new: ['learning'],
  learning: ['review', 'relearning'],
  review: ['review', 'relearning'],
  relearning: ['review', 'relearning'],
};

/**
 * Validate that an SRS card state transition is mathematically sound.
 *
 * Rules enforced:
 * - reps must increase by exactly 1 on every transition
 * - lapses cannot decrease
 * - stability cannot decrease unless the card is lapsing (→ relearning)
 * - state transitions must follow the FSRS state machine
 *
 * @throws Error if the transition violates any rule.
 */
export function validateSrsTransition(
  stateBefore: SrsStatePick,
  stateAfter: SrsStatePick,
): void {
  // Rule 1: reps must increase by exactly 1
  if (stateAfter.reps !== stateBefore.reps + 1) {
    throw new Error(
      `reps must increase by exactly 1 (before: ${stateBefore.reps}, after: ${stateAfter.reps})`
    );
  }

  // Rule 2: lapses cannot decrease
  if (stateAfter.lapses < stateBefore.lapses) {
    throw new Error(
      `lapses cannot decrease (before: ${stateBefore.lapses}, after: ${stateAfter.lapses})`
    );
  }

  // Rule 3: state transition must be valid
  const allowedNextStates = VALID_STATE_TRANSITIONS[stateBefore.state];
  if (!allowedNextStates.includes(stateAfter.state)) {
    throw new Error(
      `invalid state transition: ${stateBefore.state} → ${stateAfter.state}`
    );
  }

  // Rule 4: stability cannot decrease unless the card is lapsing
  const isLapsing =
    stateBefore.state === 'review' && stateAfter.state === 'relearning';
  if (!isLapsing && stateAfter.stability < stateBefore.stability) {
    throw new Error(
      `stability cannot decrease outside of a lapse (before: ${stateBefore.stability}, after: ${stateAfter.stability})`
    );
  }
}
