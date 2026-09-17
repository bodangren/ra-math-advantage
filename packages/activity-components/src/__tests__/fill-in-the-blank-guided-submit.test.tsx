import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FillInTheBlank } from '../components/blanks/FillInTheBlank';

const activity = {
  activityId: 'guided-fill-in-test',
  mode: 'guided' as const,
  template: 'First {{blank:first}} and then {{blank:second}}.',
  blanks: [
    { id: 'first', correctAnswer: '2' },
    { id: 'second', correctAnswer: '4' },
  ],
};

type SubmittedPart = {
  partId: string;
  partIndex: number;
  rawAnswer: string;
  isCorrect: boolean;
  score: number;
  maxScore: number;
  usedWordBank: boolean;
};

type SubmittedEnvelope = {
  mode: string;
  parts: SubmittedPart[];
  answers: Record<string, { answer: string; isCorrect: boolean; usedWordBank: boolean }>;
};

async function answerCurrentBlank(answer: string) {
  const user = userEvent.setup();
  const input = screen.getByRole('textbox');
  await user.type(input, answer);
  return user;
}

describe('FillInTheBlank guided submission', () => {
  it('submits a correct final answer through the practice handler', async () => {
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    render(<FillInTheBlank {...activity} onSubmit={onSubmit} onComplete={onComplete} />);

    const user = await answerCurrentBlank('2');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.type(screen.getByRole('textbox'), '4');
    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
    const envelope = onSubmit.mock.calls[0]?.[0] as SubmittedEnvelope;
    expect(envelope.mode).toBe('guided_practice');
    expect(envelope.answers).toEqual({
      first: { answer: '2', isCorrect: true, usedWordBank: false },
      second: { answer: '4', isCorrect: true, usedWordBank: false },
    });
    expect(envelope.parts.map(part => ({
      partId: part.partId,
      rawAnswer: part.rawAnswer,
      isCorrect: part.isCorrect,
      score: part.score,
      maxScore: part.maxScore,
    }))).toEqual([
      { partId: 'first', rawAnswer: '2', isCorrect: true, score: 1, maxScore: 1 },
      { partId: 'second', rawAnswer: '4', isCorrect: true, score: 1, maxScore: 1 },
    ]);
  });

  it('submits an incorrect final answer through the practice handler', async () => {
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    render(<FillInTheBlank {...activity} onSubmit={onSubmit} onComplete={onComplete} />);

    const user = await answerCurrentBlank('2');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.type(screen.getByRole('textbox'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
    const envelope = onSubmit.mock.calls[0]?.[0] as SubmittedEnvelope;
    expect(envelope.mode).toBe('guided_practice');
    expect(envelope.answers).toEqual({
      first: { answer: '2', isCorrect: true, usedWordBank: false },
      second: { answer: 'wrong', isCorrect: false, usedWordBank: false },
    });
    expect(envelope.parts.map(part => ({
      partId: part.partId,
      rawAnswer: part.rawAnswer,
      isCorrect: part.isCorrect,
      score: part.score,
      maxScore: part.maxScore,
    }))).toEqual([
      { partId: 'first', rawAnswer: '2', isCorrect: true, score: 1, maxScore: 1 },
      { partId: 'second', rawAnswer: 'wrong', isCorrect: false, score: 0, maxScore: 1 },
    ]);
  });

  it('does not submit or complete when Next advances a non-final blank', async () => {
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    render(<FillInTheBlank {...activity} onSubmit={onSubmit} onComplete={onComplete} />);

    const user = await answerCurrentBlank('2');
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getByRole('textbox')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });
});
