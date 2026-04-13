'use client';

import React, { useState } from 'react';
import { MathInputField } from '@/components/activities/algebraic/MathInputField';
import { buildPracticeSubmissionEnvelope } from '@/lib/practice/contract';

interface Blank {
  id: string;
  correctAnswer: string;
  isMath?: boolean;
}

interface FillInTheBlankProps {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  template: string;
  blanks: Blank[];
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
}

interface FitBState {
  answers: Record<string, string>;
  currentBlankIndex: number;
  feedbackShown: Record<string, boolean>;
  submitted: boolean;
}

const BLANK_REGEX = /\{\{blank:(\w+)\}\}/g;

function parseTemplate(template: string): Array<{ type: 'text' | 'blank'; value: string; blankId?: string }> {
  const parts: Array<{ type: 'text' | 'blank'; value: string; blankId?: string }> = [];
  let lastIndex = 0;
  let match;

  BLANK_REGEX.lastIndex = 0;
  while ((match = BLANK_REGEX.exec(template)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: template.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'blank', value: match[0], blankId: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < template.length) {
    parts.push({ type: 'text', value: template.slice(lastIndex) });
  }

  return parts;
}

function isAnswerCorrect(blank: Blank, answer: string): boolean {
  return answer.trim().toLowerCase() === blank.correctAnswer.trim().toLowerCase();
}

export function FillInTheBlank({
  activityId,
  mode,
  template,
  blanks,
  onSubmit,
  onComplete,
}: FillInTheBlankProps) {
  const [state, setState] = useState<FitBState>({
    answers: {},
    currentBlankIndex: 0,
    feedbackShown: {},
    submitted: false,
  });

  const templateParts = parseTemplate(template);
  const blankIds = templateParts.filter(p => p.type === 'blank').map(p => p.blankId!);
  const currentBlankId = blankIds[state.currentBlankIndex];
  const currentBlank = blanks.find(b => b.id === currentBlankId);

  const handleAnswer = (blankId: string, answer: string) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [blankId]: answer },
      feedbackShown: { ...prev.feedbackShown, [blankId]: true },
    }));
  };

  const handleNext = () => {
    if (state.currentBlankIndex < blankIds.length - 1) {
      setState(prev => ({
        ...prev,
        currentBlankIndex: prev.currentBlankIndex + 1,
      }));
    }
  };

  const handlePracticeSubmit = () => {
    const answers: Record<string, unknown> = {};
    const parts = blankIds.map((id, index) => {
      const blank = blanks.find(b => b.id === id)!;
      const answer = state.answers[id] || '';
      const correct = isAnswerCorrect(blank, answer);
      answers[id] = { answer, isCorrect: correct };
      return {
        partId: id,
        partIndex: index,
        rawAnswer: answer,
        isCorrect: correct,
        score: correct ? 1 : 0,
        maxScore: 1,
      };
    });

    const correctCount = parts.filter(p => p.isCorrect).length;
    const score = Math.round((correctCount / blankIds.length) * 100);

    const envelope = buildPracticeSubmissionEnvelope({
      activityId,
      mode: mode === 'practice' ? 'independent_practice' : mode,
      status: 'submitted',
      attemptNumber: 1,
      answers,
      parts,
      analytics: { score, totalBlanks: blankIds.length, correctCount },
    });

    onSubmit?.(envelope);
    onComplete?.();
  };

  if (mode === 'teaching') {
    return (
      <div className="space-y-8 p-4">
        <h2 className="text-xl font-bold">Fill in the Blank</h2>
        <div className="space-y-4">
          <p className="text-lg leading-relaxed">
            {templateParts.map((part, index) => {
              if (part.type === 'text') {
                return <span key={index}>{part.value}</span>;
              }
              const blank = blanks.find(b => b.id === part.blankId);
              return (
                <span
                  key={index}
                  className="inline-block bg-green-100 px-2 py-1 rounded border border-green-300 font-medium text-green-800 mx-1"
                >
                  {blank?.correctAnswer}
                </span>
              );
            })}
          </p>
        </div>
      </div>
    );
  }

  if (mode === 'guided') {
    const currentAnswer = state.answers[currentBlankId];
    const feedbackShown = state.feedbackShown[currentBlankId];
    const correct = currentBlank ? isAnswerCorrect(currentBlank, currentAnswer || '') : false;

    return (
      <div className="space-y-6 p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Blank {state.currentBlankIndex + 1} of {blankIds.length}
          </span>
        </div>

        <div className="space-y-4">
          <p className="text-lg leading-relaxed">
            {templateParts.map((part, index) => {
              if (part.type === 'text') {
                return <span key={index}>{part.value}</span>;
              }
              if (part.blankId === currentBlankId) {
                return (
                  <span
                    key={index}
                    className={`inline-block px-2 py-1 rounded border mx-1 ${
                      feedbackShown
                        ? correct
                          ? 'bg-green-100 border-green-300'
                          : 'bg-red-100 border-red-300'
                        : 'bg-blue-100 border-blue-300'
                    }`}
                  >
                    {currentAnswer || '____'}
                  </span>
                );
              }
              if (state.answers[part.blankId!]) {
                return (
                  <span
                    key={index}
                    className="inline-block bg-gray-100 px-2 py-1 rounded border border-gray-300 mx-1"
                  >
                    {state.answers[part.blankId!]}
                  </span>
                );
              }
              return (
                <span key={index} className="inline-block px-2 py-1 rounded border border-dashed border-gray-300 mx-1">
                  ____
                </span>
              );
            })}
          </p>

          {currentBlank && (
            <MathInputField
              value={currentAnswer || ''}
              onChange={(value) => handleAnswer(currentBlankId, value)}
              label="Your answer"
              correctAnswer={currentBlank.correctAnswer}
              showValidation={feedbackShown}
            />
          )}
        </div>

        <div className="flex gap-4">
          {feedbackShown && correct && (
            <div className="flex gap-4 items-center">
              <span className="text-green-600 font-medium">Correct!</span>
              {state.currentBlankIndex < blankIds.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={onComplete}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Finish
                </button>
              )}
            </div>
          )}

          {feedbackShown && !correct && (
            <div className="space-y-2">
              <span className="text-red-600 font-medium">
                Correct answer: {currentBlank?.correctAnswer}
              </span>
              {state.currentBlankIndex < blankIds.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={onComplete}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Finish
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'practice') {
    const allAnswered = blankIds.every(id => state.answers[id] !== undefined);

    return (
      <div className="space-y-8 p-4">
        <h2 className="text-xl font-bold">Fill in the Blank</h2>
        <div className="space-y-4">
          <p className="text-lg leading-relaxed">
            {templateParts.map((part, index) => {
              if (part.type === 'text') {
                return <span key={index}>{part.value}</span>;
              }
              const answer = state.answers[part.blankId!];
              return (
                <span
                  key={index}
                  className={`inline-block px-2 py-1 rounded border mx-1 ${
                    answer
                      ? 'bg-blue-100 border-blue-300'
                      : 'bg-gray-50 border-gray-300 border-dashed'
                  }`}
                >
                  {answer || '____'}
                </span>
              );
            })}
          </p>

          <div className="space-y-4 mt-4">
            {blankIds.map((id, index) => {
              const blank = blanks.find(b => b.id === id)!;
              return (
                <div key={id} className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Blank {index + 1}
                  </p>
                  <MathInputField
                    value={state.answers[id] || ''}
                    onChange={(value) => handleAnswer(id, value)}
                    label="Your answer"
                    correctAnswer={blank.correctAnswer}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <button
          onClick={handlePracticeSubmit}
          disabled={!allAnswered}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
        >
          Submit All Answers
        </button>
      </div>
    );
  }

  return null;
}