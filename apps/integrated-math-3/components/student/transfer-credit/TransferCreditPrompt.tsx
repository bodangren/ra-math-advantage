'use client';

// TransferCreditPrompt — student-facing "You already mastered this in
// <course>" card with Skip / Take confirmation check / Undo skip actions
// (Phase 3 / FR4, AC4).
//
// The component is **self-contained**: it does not call Convex, does not
// fetch state, and does not decide eligibility. The caller passes the
// eligibility decision (via `skipped`, `sourceCourse`, `seededMastery`)
// and wires `onSkip` / `onConfirmCheck` / `onRevert` to the persistence
// layer in Phase 4.

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { getTransferCreditCopy } from '@/lib/transfer-credit/student-skip';
import type { TransferSkipRecord } from '@math-platform/knowledge-space-core';
import { applyTransferSkip, revertTransferSkip } from '@math-platform/knowledge-space-core';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface TransferCreditPromptProps {
  /** Target skill id the prompt applies to. */
  skillId: string;
  /** Cross-course source label (e.g. `math.im2`). */
  sourceCourse: string;
  /** Discounted + capped mastery seeded by the FR2 pipeline. */
  seededMastery: number;
  /** Whether the skip is currently applied for this skill. */
  skipped: boolean;
  /** Fired when the student clicks Skip. Receives the new skip record. */
  onSkip: (record: TransferSkipRecord) => void;
  /** Fired when the student clicks "Take confirmation check". */
  onConfirmCheck: () => void;
  /** Fired when the student clicks Undo skip. Receives the reverted record. */
  onRevert: (record: TransferSkipRecord) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders the transfer-credit card with Skip / Take confirmation check /
 * Undo skip actions.
 *
 * Visual states:
 *   - `skipped === false` — copy + "Skip" + "Take confirmation check".
 *   - `skipped === true`  — "Undo skip" (revert) only.
 *
 * The component never mutates props. The caller owns persistence.
 */
export function TransferCreditPrompt({
  skillId,
  sourceCourse,
  seededMastery,
  skipped,
  onSkip,
  onConfirmCheck,
  onRevert,
}: TransferCreditPromptProps) {
  const copy = getTransferCreditCopy(sourceCourse);

  const handleSkip = useCallback(() => {
    const record = applyTransferSkip(skillId, sourceCourse, seededMastery);
    onSkip(record);
  }, [skillId, sourceCourse, seededMastery, onSkip]);

  const handleRevert = useCallback(() => {
    // Build a synthetic skipped record so revertTransferSkip can produce
    // a properly-shaped reverted record. The seed/skippedAt are not
    // material to the revert — they round-trip through the function.
    const current = applyTransferSkip(skillId, sourceCourse, seededMastery);
    const reverted = revertTransferSkip(current);
    onRevert(reverted);
  }, [skillId, sourceCourse, seededMastery, onRevert]);

  return (
    <section
      role="region"
      aria-label="Transfer credit prompt"
      data-testid="transfer-credit-prompt"
      className="rounded-xl border border-accent/30 bg-accent/5 p-5 space-y-4"
    >
      <div className="space-y-1">
        <p className="font-display text-base font-semibold text-foreground">
          {copy}
        </p>
        <p className="text-sm text-muted-foreground">
          You can skip this skill or take a short check to confirm you still
          remember it.
        </p>
      </div>

      {skipped ? (
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleRevert}
            aria-label="Undo skip"
            data-testid="transfer-credit-undo"
          >
            Undo skip
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="default"
            onClick={handleSkip}
            aria-label="Skip this skill"
            data-testid="transfer-credit-skip"
          >
            Skip
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onConfirmCheck}
            aria-label="Take confirmation check"
            data-testid="transfer-credit-confirm"
          >
            Take confirmation check
          </Button>
        </div>
      )}
    </section>
  );
}
