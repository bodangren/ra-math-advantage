'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { MathInputField } from '../algebraic/MathInputField';
import { buildPracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';

interface Blank {
  id: string;
  correctAnswer?: string;
  acceptedAnswers?: string[];
  isMath?: boolean;
}

interface WordBankItem {
  id: string;
  text: string;
}

export interface FillInTheBlankProps {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  template: string;
  blanks: Blank[];
  reasoningSteps?: Array<{ description: string; expression?: string }>;
  guidedSupport?: {
    feedback: 'on_check';
    hints: string[];
    revealAfterAttempts: number;
  };
  wordBank?: WordBankItem[];
  onSubmit?: (payload: unknown) => void | Promise<void>;
  onComplete?: () => void;
}

interface FitBState {
  answers: Record<string, string>;
  wordBankAssignments: Record<string, string>;
  currentBlankIndex: number;
  feedbackShown: Record<string, boolean>;
  submitted: boolean;
  submitError?: string;
  attempts: Record<string, number>;
  hintsUsed: Record<string, number>;
  revealed: Record<string, boolean>;
}

const BLANK_REGEX = /\{\{blank:(\w+)\}\}/g;

/**
 * Parse a template string into text and blank segments.
 * @param {string} template - The template string with {{blank:id}} placeholders
 * @returns {Array<{ type: 'text' | 'blank'; value: string; blankId?: string }>} - Array of parsed text and blank segments
 */
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

/**
 * Normalize supported expression notation without evaluating the expression.
 * @param {string} value - The typed expression.
 * @returns {string} Expression with consistent operator notation.
 */
function normalizeAcceptedExpression(value: string): string {
  return value
    .toLowerCase()
    .replace(/\\left|\\right/g, '')
    .replace(/\\times|\\cdot/g, '*')
    .replace(/\\div/g, '/')
    .replace(/[−–]/g, '-')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/\s+/g, '');
}

function isAnswerCorrect(blank: Blank, answer: string): boolean {
  const acceptedAnswers = blank.acceptedAnswers ??
    (blank.correctAnswer ? [blank.correctAnswer] : []);
  const normalize = blank.isMath
    ? normalizeAcceptedExpression
    : (value: string) => value.trim().toLowerCase();
  const normalizedAnswer = normalize(answer);
  return acceptedAnswers.some(accepted =>
    normalize(accepted) === normalizedAnswer,
  );
}

/**
 * Produce a short, accessibility-friendly snippet of the fill-in template (a11y).
 * Strips `{{blank:...}}` placeholders and trims to a sensible readable length so
 * the per-blank input label can reference the surrounding task context.
 * @param {string} template - The fill-in template with placeholders
 * @param {number} [maxChars=60] - Maximum length of the snippet
 * @returns {string} A truncated text snippet for use in aria-label
 */
function truncateForLabel(template: string, maxChars = 60): string {
  const stripped = template.replace(/\{\{blank:[^}]+\}\}/g, '____').replace(/\s+/g, ' ').trim();
  if (stripped.length <= maxChars) return stripped;
  return `${stripped.slice(0, maxChars - 1).trimEnd()}…`;
}

/**
 * Render a fill-in-the-blank activity with optional word bank support.
 * @param {FillInTheBlankProps} props - The activity configuration including template, blanks, and mode
 * @returns {React.JSX.Element | null} The fill-in-the-blank component JSX
 */
export function FillInTheBlank({
  activityId,
  mode,
  template,
  blanks,
  reasoningSteps,
  guidedSupport,
  wordBank,
  onSubmit,
  onComplete,
}: FillInTheBlankProps) {
  const [state, setState] = useState<FitBState>({
    answers: {},
    wordBankAssignments: {},
    currentBlankIndex: 0,
    feedbackShown: {},
    submitted: false,
    attempts: {},
    hintsUsed: {},
    revealed: {},
  });

  const templateParts = parseTemplate(template);
  const blankIds = templateParts.filter(p => p.type === 'blank').map(p => p.blankId!);
  const currentBlankId = blankIds[state.currentBlankIndex];
  const currentBlank = blanks.find(b => b.id === currentBlankId);

  const handleAnswer = (blankId: string, answer: string) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [blankId]: answer },
      feedbackShown: {
        ...prev.feedbackShown,
        [blankId]: guidedSupport ? false : true,
      },
    }));
  };

  const handleCheck = () => {
    if (!currentBlankId) return;
    setState(previous => ({
      ...previous,
      feedbackShown: { ...previous.feedbackShown, [currentBlankId]: true },
      attempts: {
        ...previous.attempts,
        [currentBlankId]: (previous.attempts[currentBlankId] ?? 0) + 1,
      },
    }));
  };

  const handleHint = () => {
    if (!currentBlankId || !guidedSupport) return;
    setState(previous => ({
      ...previous,
      hintsUsed: {
        ...previous.hintsUsed,
        [currentBlankId]: Math.min(
          guidedSupport.hints.length,
          (previous.hintsUsed[currentBlankId] ?? 0) + 1,
        ),
      },
    }));
  };

  const handleReveal = () => {
    if (!currentBlankId) return;
    setState(previous => ({
      ...previous,
      revealed: { ...previous.revealed, [currentBlankId]: true },
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

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    if (destination.droppableId === 'word-bank' && source.droppableId !== 'word-bank') {
      setState(prev => {
        const newAssignments = { ...prev.wordBankAssignments };
        delete newAssignments[source.droppableId];
        return { ...prev, wordBankAssignments: newAssignments };
      });
    } else if (destination.droppableId !== 'word-bank' && source.droppableId === 'word-bank') {
      const item = wordBank?.find(w => w.id === draggableId);
      if (item) {
        setState(prev => ({
          ...prev,
          answers: { ...prev.answers, [destination.droppableId]: item.text },
          wordBankAssignments: { ...prev.wordBankAssignments, [destination.droppableId]: item.id },
        }));
      }
    } else if (destination.droppableId !== source.droppableId) {
      const item = wordBank?.find(w => w.id === draggableId);
      if (item) {
        setState(prev => ({
          ...prev,
          answers: { ...prev.answers, [source.droppableId]: '', [destination.droppableId]: item.text },
          wordBankAssignments: (() => {
            const newAssignments = { ...prev.wordBankAssignments };
            delete newAssignments[source.droppableId];
            newAssignments[destination.droppableId] = item.id;
            return newAssignments;
          })(),
        }));
      }
    }
  };

  const handleClearWordBank = (blankId: string) => {
    setState(prev => {
      const newAssignments = { ...prev.wordBankAssignments };
      delete newAssignments[blankId];
      return {
        ...prev,
        answers: { ...prev.answers, [blankId]: '' },
        wordBankAssignments: newAssignments,
      };
    });
  };

  const handlePracticeSubmit = async () => {
    if (state.submitted) return;
    const answers: Record<string, unknown> = {};
    const parts = blankIds.map((id, index) => {
      const blank = blanks.find(b => b.id === id)!;
      const answer = state.answers[id] || '';
      const usedWordBank = !!state.wordBankAssignments[id];
      if (mode === 'practice') {
        answers[id] = { answer, usedWordBank };
        return {
          partId: id,
          partIndex: index,
          rawAnswer: answer,
          maxScore: 1,
          usedWordBank,
          hintsUsed: state.hintsUsed[id] ?? 0,
          revealStepsSeen: state.revealed[id] ? 1 : 0,
        };
      }
      const correct = isAnswerCorrect(blank, answer);
      answers[id] = { answer, isCorrect: correct, usedWordBank };
      return {
        partId: id,
        partIndex: index,
        rawAnswer: answer,
        isCorrect: correct,
        score: correct ? 1 : 0,
        maxScore: 1,
        usedWordBank,
        hintsUsed: state.hintsUsed[id] ?? 0,
        revealStepsSeen: state.revealed[id] ? 1 : 0,
      };
    });

    const correctCount = parts.filter(p => p.isCorrect === true).length;
    const score = mode === 'practice'
      ? undefined
      : blankIds.length > 0 ? Math.round((correctCount / blankIds.length) * 100) : 0;
    const wordBankUsedCount = Object.keys(state.wordBankAssignments).length;

    const envelope = buildPracticeSubmissionEnvelope({
      activityId,
      mode: mode === 'practice' ? 'independent_practice' : mode === 'guided' ? 'guided_practice' : mode,
      status: 'submitted',
      attemptNumber: 1,
      answers,
      parts,
      analytics: mode === 'practice'
        ? { totalBlanks: blankIds.length, wordBankUsedCount }
        : { score, totalBlanks: blankIds.length, correctCount, wordBankUsedCount },
    });

    setState(previous => ({ ...previous, submitted: true, submitError: undefined }));
    try {
      await onSubmit?.(envelope);
      onComplete?.();
    } catch {
      setState(previous => ({
        ...previous,
        submitted: false,
        submitError: 'Your response was not saved. Submit it again.',
      }));
    }
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
          {reasoningSteps && (
            <ol className="space-y-3" aria-label="Worked reasoning">
              {reasoningSteps.map((step, index) => (
                <li key={`${step.description}-${index}`} className="rounded-md border p-3">
                  <p className="font-medium">{step.description}</p>
                  {step.expression && <p className="mt-1 font-mono">{step.expression}</p>}
                </li>
              ))}
            </ol>
          )}
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
              label={`Blank ${state.currentBlankIndex + 1} of ${blankIds.length} — fill in the blank in: ${truncateForLabel(template)}`}
              required
            />
          )}
          {guidedSupport && !feedbackShown && (
            <button
              type="button"
              onClick={handleCheck}
              disabled={!currentAnswer}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
            >
              Check
            </button>
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
                  onClick={handlePracticeSubmit}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Finish
                </button>
              )}
            </div>
          )}

          {feedbackShown && !correct && !guidedSupport && (
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
                  onClick={handlePracticeSubmit}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Finish
                </button>
              )}
            </div>
          )}
          {feedbackShown && !correct && guidedSupport && (
            <div className="space-y-3">
              <p className="text-red-600 font-medium">Try again.</p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleHint}
                  disabled={(state.hintsUsed[currentBlankId] ?? 0) >= guidedSupport.hints.length}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md disabled:opacity-50"
                >
                  Show Hint
                </button>
                <button
                  type="button"
                  onClick={handleReveal}
                  disabled={(state.attempts[currentBlankId] ?? 0) < guidedSupport.revealAfterAttempts}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md disabled:opacity-50"
                >
                  Reveal Answer
                </button>
              </div>
              {(state.hintsUsed[currentBlankId] ?? 0) > 0 && (
                <div aria-live="polite" className="space-y-1">
                  {guidedSupport.hints
                    .slice(0, state.hintsUsed[currentBlankId])
                    .map(hint => <p key={hint}>{hint}</p>)}
                </div>
              )}
              {state.revealed[currentBlankId] && (
                <div className="space-y-2">
                  <p className="text-foreground font-medium">
                    Correct answer: {currentBlank?.correctAnswer}
                  </p>
                  <button
                    type="button"
                    onClick={handlePracticeSubmit}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                  >
                    Finish
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        {state.submitError && <p role="alert" className="text-sm text-destructive">{state.submitError}</p>}
      </div>
    );
  }

  if (mode === 'practice') {
    const allAnswered = blankIds.every(id => state.answers[id] !== undefined);

    if (wordBank && wordBank.length > 0) {
      const unusedWordBankItems = wordBank.filter(item => !Object.values(state.wordBankAssignments).includes(item.id));

      return (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="space-y-8 p-4">
            <h2 className="text-xl font-bold">Fill in the Blank</h2>

            {/* Always-present polite live region for drag/word-bank feedback (a11y) */}
            <div role="status" aria-live="polite" className="sr-only">
              {state.feedbackShown[blankIds[0]] ? 'Word bank assignment updated.' : ''}
            </div>

            {unusedWordBankItems.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Word Bank</p>
                <Droppable droppableId="word-bank" direction="horizontal">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      aria-label="Word bank. Use Tab to focus items, Enter to pick up, arrow keys to move, Enter to drop."
                      className="flex flex-wrap gap-2"
                    >
                      {unusedWordBankItems.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={provided.draggableProps.style as React.CSSProperties}
                              aria-label={`Assign "${item.text}" to a blank. Press Enter to select, then arrow keys to choose a blank, Enter again to confirm.`}
                              className={`px-3 py-1 bg-white border border-gray-300 rounded cursor-move focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                            >
                              {item.text}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )}

            <div className="space-y-4">
              <p className="text-lg leading-relaxed">
                {templateParts.map((part, index) => {
                  if (part.type === 'text') {
                    return <span key={index}>{part.value}</span>;
                  }
                  const answer = state.answers[part.blankId!];
                  const usedWordBank = !!state.wordBankAssignments[part.blankId!];
                  return (
                    <Droppable key={index} droppableId={part.blankId!} direction="horizontal">
                      {(provided, snapshot) => (
                        <span
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          aria-label={`Blank ${part.blankId}. Drop zone for draggable items.`}
                          className={`inline-block px-2 py-1 rounded border mx-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                            snapshot.isDraggingOver
                              ? 'bg-blue-200 border-blue-400'
                              : answer
                              ? 'bg-blue-100 border-blue-300'
                              : 'bg-gray-50 border-gray-300 border-dashed'
                          }`}
                        >
                          {answer || '____'}
                          {provided.placeholder}
                          {usedWordBank && answer && (
                            <button
                              onClick={() => handleClearWordBank(part.blankId!)}
                              aria-label={`Remove ${answer} from blank ${part.blankId}`}
                              className="ml-1 text-xs text-gray-500 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                            >
                              ×
                            </button>
                          )}
                        </span>
                      )}
                    </Droppable>
                  );
                })}
              </p>

              <div className="space-y-4 mt-4">
                {blankIds.map((id, index) => {
                  const blank = blanks.find(b => b.id === id)!;
                  const blankLabel = `Blank ${index + 1} of ${blankIds.length} — fill in the blank in: ${truncateForLabel(template)}`;
                  return (
                    <div key={id} className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        Blank {index + 1}
                        {state.wordBankAssignments[id] && (
                          <span className="ml-2 text-xs text-blue-600">(from word bank)</span>
                        )}
                      </p>
                      <MathInputField
                        value={state.answers[id] || ''}
                        onChange={(value) => handleAnswer(id, value)}
                        label={blankLabel}
                        correctAnswer={blank.correctAnswer}
                        required
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            <button
              type="submit"
              onClick={handlePracticeSubmit}
              disabled={!allAnswered || state.submitted}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
            >
              Submit All Answers
            </button>
            {state.submitError && <p role="alert" className="text-sm text-destructive">{state.submitError}</p>}
          </div>
        </DragDropContext>
      );
    }

    return (
      <div className="space-y-8 p-4">
        <h2 className="text-xl font-bold">Fill in the Blank</h2>
        {/* Always-present polite live region for match/mismatch feedback (a11y) */}
        <div role="status" aria-live="polite" className="sr-only">
          {Object.values(state.feedbackShown).some(Boolean) ? 'Answer recorded.' : ''}
        </div>
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
              const blankLabel = `Blank ${index + 1} of ${blankIds.length} — fill in the blank in: ${truncateForLabel(template)}`;
              return (
                <div key={id} className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Blank {index + 1}
                  </p>
                  <MathInputField
                    value={state.answers[id] || ''}
                    onChange={(value) => handleAnswer(id, value)}
                    label={blankLabel}
                    correctAnswer={blank.correctAnswer}
                    required
                  />
                </div>
              );
            })}
          </div>
        </div>
        <button
          type="submit"
          onClick={handlePracticeSubmit}
          disabled={!allAnswered || state.submitted}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
        >
          Submit All Answers
        </button>
        {state.submitError && <p role="alert" className="text-sm text-destructive">{state.submitError}</p>}
      </div>
    );
  }

  return null;
}
