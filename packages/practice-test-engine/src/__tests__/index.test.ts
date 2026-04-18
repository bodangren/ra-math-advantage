import { describe, it, expect } from 'vitest';
import {
  filterQuestionsByLessonIds,
  drawRandomQuestions,
  shuffleAnswers,
  isAnswerCorrect,
  calculateScore,
  calculatePercentage,
  type PracticeTestQuestion,
} from '../index';

const mockQuestion: PracticeTestQuestion = {
  id: 'q1',
  lessonId: 'lesson-1',
  lessonTitle: 'Lesson One',
  prompt: 'What is 2 + 2?',
  correctAnswer: '4',
  distractors: ['3', '5', '6'],
  explanation: '2 + 2 equals 4',
  objectiveTags: ['arithmetic'],
};

const mockQuestions: PracticeTestQuestion[] = [
  mockQuestion,
  {
    id: 'q2',
    lessonId: 'lesson-1',
    lessonTitle: 'Lesson One',
    prompt: 'What is 3 + 3?',
    correctAnswer: '6',
    distractors: ['5', '7', '8'],
    explanation: '3 + 3 equals 6',
    objectiveTags: ['arithmetic'],
  },
  {
    id: 'q3',
    lessonId: 'lesson-2',
    lessonTitle: 'Lesson Two',
    prompt: 'What is 4 + 4?',
    correctAnswer: '8',
    distractors: ['7', '9', '10'],
    explanation: '4 + 4 equals 8',
    objectiveTags: ['arithmetic'],
  },
];

describe('filterQuestionsByLessonIds', () => {
  it('returns only questions matching the given lesson IDs', () => {
    const result = filterQuestionsByLessonIds(mockQuestions, ['lesson-1']);
    expect(result).toHaveLength(2);
    expect(result.every((q) => q.lessonId === 'lesson-1')).toBe(true);
  });

  it('returns empty array when no lesson IDs match', () => {
    const result = filterQuestionsByLessonIds(mockQuestions, ['nonexistent']);
    expect(result).toHaveLength(0);
  });

  it('returns all questions when all lesson IDs are provided', () => {
    const result = filterQuestionsByLessonIds(mockQuestions, ['lesson-1', 'lesson-2']);
    expect(result).toHaveLength(3);
  });
});

describe('drawRandomQuestions', () => {
  it('returns empty array when count is 0', () => {
    const result = drawRandomQuestions(mockQuestions, 0);
    expect(result).toHaveLength(0);
  });

  it('returns empty array when questions array is empty', () => {
    const result = drawRandomQuestions([], 5);
    expect(result).toHaveLength(0);
  });

  it('returns all questions when count exceeds available', () => {
    const result = drawRandomQuestions(mockQuestions, 100);
    expect(result).toHaveLength(3);
  });

  it('returns exactly count questions when sufficient exist', () => {
    const result = drawRandomQuestions(mockQuestions, 2);
    expect(result).toHaveLength(2);
  });

  it('returns the same questions (just shuffled)', () => {
    const result = drawRandomQuestions(mockQuestions, 3);
    const ids = result.map((q) => q.id).sort();
    expect(ids).toEqual(['q1', 'q2', 'q3']);
  });
});

describe('shuffleAnswers', () => {
  it('returns an object with correctIndex and choices', () => {
    const result = shuffleAnswers(mockQuestion);
    expect(result).toHaveProperty('correctIndex');
    expect(result).toHaveProperty('choices');
  });

  it('places the correct answer in the choices array', () => {
    const result = shuffleAnswers(mockQuestion);
    expect(result.choices).toContain('4');
  });

  it('has correctIndex pointing to the correct answer in choices', () => {
    const result = shuffleAnswers(mockQuestion);
    expect(result.choices[result.correctIndex]).toBe('4');
  });

  it('has choices array containing all distractors plus correct answer', () => {
    const result = shuffleAnswers(mockQuestion);
    expect(result.choices).toHaveLength(4);
    expect(result.choices).toContain('3');
    expect(result.choices).toContain('5');
    expect(result.choices).toContain('6');
  });

  it('produces varying order across multiple calls (Fisher-Yates)', () => {
    const results = Array.from({ length: 10 }, () => shuffleAnswers(mockQuestion).choices.join(','));
    const uniqueResults = new Set(results);
    expect(uniqueResults.size).toBeGreaterThan(1);
  });
});

describe('isAnswerCorrect', () => {
  it('returns true when selected answer matches correct answer', () => {
    const shuffled = shuffleAnswers(mockQuestion);
    expect(isAnswerCorrect(shuffled, '4')).toBe(true);
  });

  it('returns false when selected answer does not match', () => {
    const shuffled = shuffleAnswers(mockQuestion);
    expect(isAnswerCorrect(shuffled, '3')).toBe(false);
  });

  it('returns false when selected answer is not at correct index', () => {
    const shuffled = shuffleAnswers(mockQuestion);
    const wrongAnswer = shuffled.choices[(shuffled.correctIndex + 1) % shuffled.choices.length];
    if (wrongAnswer !== '4') {
      expect(isAnswerCorrect(shuffled, wrongAnswer)).toBe(false);
    }
  });
});

describe('calculateScore', () => {
  it('returns 0 for empty answers array', () => {
    expect(calculateScore([])).toBe(0);
  });

  it('counts only correct answers', () => {
    const answers = [
      { questionId: 'q1', selectedAnswer: '4', isCorrect: true },
      { questionId: 'q2', selectedAnswer: '5', isCorrect: false },
      { questionId: 'q3', selectedAnswer: '8', isCorrect: true },
    ];
    expect(calculateScore(answers)).toBe(2);
  });
});

describe('calculatePercentage', () => {
  it('returns 0 when total is 0', () => {
    expect(calculatePercentage(0, 0)).toBe(0);
  });

  it('calculates correct percentage', () => {
    expect(calculatePercentage(7, 10)).toBe(70);
  });

  it('rounds to nearest integer', () => {
    expect(calculatePercentage(1, 3)).toBe(33);
    expect(calculatePercentage(2, 3)).toBe(67);
  });
});