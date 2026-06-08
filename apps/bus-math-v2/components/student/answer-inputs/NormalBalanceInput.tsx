'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import type { DailyPracticeAnswerInputProps } from '@/lib/srs/answer-inputs/registry';
import type { NormalBalanceDefinition, NormalBalanceResponse, NormalBalanceSide } from '@/lib/practice/engine/families/normal-balance';


/**
 * Renders an answer input for normal balance problems, showing accounts
 * with debit/credit toggle buttons.
 *
 * @param props - Component props.
 * @param props.family - The practice family object with grade/toEnvelope methods.
 * @param props.definition - The normal balance problem definition.
 * @param props.onSubmit - Callback to submit the graded practice envelope.
 * @returns A problem display with debit/credit buttons and submit/grade result.
 */
export function NormalBalanceInput({ family, definition, onSubmit }: DailyPracticeAnswerInputProps) {
  const def = definition as NormalBalanceDefinition;
  const submittedRef = useRef(false);
  const [selections, setSelections] = useState<Record<string, NormalBalanceSide>>({});
  const [gradeResult, setGradeResult] = useState<{
    isCorrect: boolean;
    score: number;
    maxScore: number;
    parts: Array<{ partId: string; isCorrect: boolean }>;
  } | null>(null);


  /**
   * Updates the debit/credit selection for a given part.
   *
   * @param partId - The part ID to update.
   * @param side - The selected side ("debit" or "credit").
   */
  const handleSelect = (partId: string, side: NormalBalanceSide) => {
    if (submittedRef.current) return;
    setSelections((prev) => ({ ...prev, [partId]: side }));
  };


  /**
   * Grades all selections and submits the practice envelope.
   */
  const handleSubmit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    const response: NormalBalanceResponse = selections;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (family as any).grade(def, response);

    setGradeResult({
      isCorrect: result.score === result.maxScore,
      score: result.score,
      maxScore: result.maxScore,
      parts: result.parts.map((p: { partId: string; isCorrect: boolean }) => ({
        partId: p.partId,
        isCorrect: p.isCorrect,
      })),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const envelope = (family as any).toEnvelope(def, response, result);
    onSubmit(envelope);
  };

  const allSelected = def.parts.every((part) => selections[part.id]);

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium mb-3 text-sm text-muted-foreground">Problem</h3>
        <p className="text-sm mb-4">{def.prompt?.stem ?? 'Choose debit or credit for each account.'}</p>
        <div className="space-y-3">
          {def.parts.map((part) => (
            <div key={part.id} className="flex items-center justify-between p-3 bg-background rounded border">
              <span className="font-medium">{part.label}</span>
              <div className="flex gap-2">
                {(['debit', 'credit'] as NormalBalanceSide[]).map((side) => (
                  <Button
                    key={side}
                    type="button"
                    variant={selections[part.id] === side ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSelect(part.id, side)}
                    disabled={submittedRef.current}
                    data-testid={`${part.id}-${side}`}
                  >
                    {side.charAt(0).toUpperCase() + side.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {gradeResult ? (
        <div className="bg-muted/50 p-4 rounded-lg space-y-3">
          <div
            className={`text-sm font-medium ${
              gradeResult.isCorrect ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {gradeResult.isCorrect ? 'Correct!' : `Incorrect — ${gradeResult.score}/${gradeResult.maxScore} correct`}
          </div>
          <div className="space-y-1">
            {gradeResult.parts.map((part) => {
              const partDef = def.parts.find((p) => p.id === part.partId);
              return (
                <div
                  key={part.partId}
                  className={`text-sm ${part.isCorrect ? 'text-green-600' : 'text-red-600'}`}
                >
                  {partDef?.label ?? part.partId}: {part.isCorrect ? 'Correct' : 'Incorrect'}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <Button onClick={handleSubmit} disabled={submittedRef.current || !allSelected}>
          Submit Answer
        </Button>
      )}
    </div>
  );
}
