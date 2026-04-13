import { describe, it, expect } from 'vitest';
import {
  ExampleReviewHarness,
  useExampleReviewHarnessState,
  PracticeReviewHarness,
  usePracticeReviewHarnessState,
  ActivityReviewHarness,
  useActivityReviewHarnessState,
} from '@/components/dev/review-harness';

describe('review-harness exports', () => {
  it('exports ExampleReviewHarness', () => {
    expect(ExampleReviewHarness).toBeDefined();
  });

  it('exports useExampleReviewHarnessState', () => {
    expect(useExampleReviewHarnessState).toBeDefined();
  });

  it('exports PracticeReviewHarness', () => {
    expect(PracticeReviewHarness).toBeDefined();
  });

  it('exports usePracticeReviewHarnessState', () => {
    expect(usePracticeReviewHarnessState).toBeDefined();
  });

  it('exports ActivityReviewHarness', () => {
    expect(ActivityReviewHarness).toBeDefined();
  });

  it('exports useActivityReviewHarnessState', () => {
    expect(useActivityReviewHarnessState).toBeDefined();
  });
});
