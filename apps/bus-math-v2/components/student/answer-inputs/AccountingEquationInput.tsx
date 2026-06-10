'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { DailyPracticeAnswerInputProps } from '@/lib/srs/answer-inputs/registry';
import type { AccountingEquationDefinition, AccountingEquationResponse } from '@/lib/practice/engine/families/accounting-equation';


/**
 * Renders an answer input for accounting equation problems, showing visible
 * facts and a numeric input for the hidden term.
 *
 * @param props - Component props.
 * @param props.family - The practice family object with grade/toEnvelope methods.
 * @param props.definition - The accounting equation problem definition.
 * @param props.onSubmit - Callback to submit the graded practice envelope.
 * @returns A problem display with numeric input and submit/grade result.
 */
export function AccountingEquationInput({ family, definition, onSubmit }: DailyPracticeAnswerInputProps) {
  const def = definition as AccountingEquationDefinition;
  const [submitted, setSubmitted] = useState(false);
  const [value, setValue] = useState('');
  const [gradeResult, setGradeResult] = useState<{
    isCorrect: boolean;
    expectedValue: number;
    submittedValue: number;
  } | null>(null);

  const hiddenTermId = def.equation.hiddenTermId;
  const visibleFacts = def.facts;
  const hiddenTermLabel = def.terms[hiddenTermId]?.label ?? hiddenTermId;


  /**
   * Grades the submitted value and submits the practice envelope.
   */
  const handleSubmit = () => {
    if (submitted) return;
    setSubmitted(true);

    const parsedValue = Number(value);
    const response: AccountingEquationResponse = {
      [hiddenTermId]: Number.isFinite(parsedValue) ? parsedValue : undefined,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (family as any).grade(def, response);
    const partResult = result.parts[0];

    setGradeResult({
      isCorrect: partResult?.isCorrect ?? false,
      expectedValue: def.equation[hiddenTermId],
      submittedValue: parsedValue,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const envelope = (family as any).toEnvelope(def, response, result);
    onSubmit(envelope);
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium mb-3 text-sm text-muted-foreground">Problem</h3>
        <div className="space-y-2">
          {visibleFacts.map((fact) => (
            <div key={fact.id} className="flex gap-2">
              <span className="font-medium">{fact.label}:</span>
              <span className="font-mono">{fact.value.toLocaleString('en-US')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="accounting-equation-input" className="text-sm font-medium">
          Enter {hiddenTermLabel}
        </label>
        <Input
          id="accounting-equation-input"
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={submitted}
          placeholder={`Enter ${hiddenTermLabel.toLowerCase()}`}
        />
      </div>

      {gradeResult ? (
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div
            className={`text-sm font-medium ${
              gradeResult.isCorrect ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {gradeResult.isCorrect ? 'Correct!' : 'Incorrect'}
          </div>
          {!gradeResult.isCorrect && (
            <div className="text-sm">
              Expected: {gradeResult.expectedValue.toLocaleString('en-US')}
            </div>
          )}
        </div>
      ) : (
        <Button onClick={handleSubmit} disabled={submitted}>
          Submit Answer
        </Button>
      )}
    </div>
  );
}
