import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LessonPageLayout, type PhaseNavItem } from '@/components/textbook/LessonPageLayout';

const samplePhases: PhaseNavItem[] = [
  { phaseType: 'explore', label: 'Explore', completed: true, isCurrent: false },
  { phaseType: 'learn', label: 'Learn', completed: false, isCurrent: true },
  { phaseType: 'worked_example', label: 'Example', completed: false, isCurrent: false },
];

describe('LessonPageLayout', () => {
  describe('header rendering', () => {
    it('renders the lesson title', () => {
      render(
        <LessonPageLayout
          lessonTitle="Introduction to Linear Functions"
          moduleLabel="Module 1"
          lessonNumber={1}
          phases={samplePhases}
        >
          <div>content</div>
        </LessonPageLayout>
      );
      expect(screen.getByText('Introduction to Linear Functions')).toBeInTheDocument();
    });

    it('renders the module label', () => {
      render(
        <LessonPageLayout
          lessonTitle="Introduction to Linear Functions"
          moduleLabel="Module 1"
          lessonNumber={1}
          phases={samplePhases}
        >
          <div>content</div>
        </LessonPageLayout>
      );
      expect(screen.getByText('Module 1')).toBeInTheDocument();
    });

    it('renders the lesson number', () => {
      render(
        <LessonPageLayout
          lessonTitle="Introduction to Linear Functions"
          moduleLabel="Module 1"
          lessonNumber={3}
          phases={samplePhases}
        >
          <div>content</div>
        </LessonPageLayout>
      );
      expect(screen.getByText(/Lesson 3/)).toBeInTheDocument();
    });

    it('renders optional goals when provided', () => {
      render(
        <LessonPageLayout
          lessonTitle="Linear Functions"
          moduleLabel="Module 1"
          lessonNumber={1}
          goals="Understand slope and intercept"
          phases={samplePhases}
        >
          <div>content</div>
        </LessonPageLayout>
      );
      expect(screen.getByText('Understand slope and intercept')).toBeInTheDocument();
    });

    it('does not render goals section when not provided', () => {
      render(
        <LessonPageLayout
          lessonTitle="Linear Functions"
          moduleLabel="Module 1"
          lessonNumber={1}
          phases={samplePhases}
        >
          <div>content</div>
        </LessonPageLayout>
      );
      expect(screen.queryByText(/Goals/i)).not.toBeInTheDocument();
    });
  });

  describe('sidebar navigation', () => {
    it('renders all phase nav items', () => {
      render(
        <LessonPageLayout
          lessonTitle="Linear Functions"
          moduleLabel="Module 1"
          lessonNumber={1}
          phases={samplePhases}
        >
          <div>content</div>
        </LessonPageLayout>
      );
      expect(screen.getByText('Explore')).toBeInTheDocument();
      expect(screen.getByText('Learn')).toBeInTheDocument();
      expect(screen.getByText('Example')).toBeInTheDocument();
    });

    it('visually distinguishes the current phase', () => {
      const { container } = render(
        <LessonPageLayout
          lessonTitle="Linear Functions"
          moduleLabel="Module 1"
          lessonNumber={1}
          phases={samplePhases}
        >
          <div>content</div>
        </LessonPageLayout>
      );
      // The current phase item should have a distinct class
      const currentItem = container.querySelector('[data-current="true"]');
      expect(currentItem).toBeInTheDocument();
    });

    it('marks completed phases', () => {
      const { container } = render(
        <LessonPageLayout
          lessonTitle="Linear Functions"
          moduleLabel="Module 1"
          lessonNumber={1}
          phases={samplePhases}
        >
          <div>content</div>
        </LessonPageLayout>
      );
      const completedItems = container.querySelectorAll('[data-completed="true"]');
      expect(completedItems.length).toBe(1);
    });
  });

  describe('mobile sidebar toggle', () => {
    it('renders a menu toggle button', () => {
      render(
        <LessonPageLayout
          lessonTitle="Linear Functions"
          moduleLabel="Module 1"
          lessonNumber={1}
          phases={samplePhases}
        >
          <div>content</div>
        </LessonPageLayout>
      );
      const toggle = screen.getByRole('button', { name: /menu|navigation|phases/i });
      expect(toggle).toBeInTheDocument();
    });

    it('toggles sidebar visibility on mobile button click', () => {
      const { container } = render(
        <LessonPageLayout
          lessonTitle="Linear Functions"
          moduleLabel="Module 1"
          lessonNumber={1}
          phases={samplePhases}
        >
          <div>content</div>
        </LessonPageLayout>
      );
      const toggle = screen.getByRole('button', { name: /menu|navigation|phases/i });
      fireEvent.click(toggle);
      // Sidebar should have an open state class
      const sidebar = container.querySelector('[data-sidebar]');
      expect(sidebar).toBeInTheDocument();
    });
  });

  describe('progress bar', () => {
    it('renders a progress bar', () => {
      const { container } = render(
        <LessonPageLayout
          lessonTitle="Linear Functions"
          moduleLabel="Module 1"
          lessonNumber={1}
          phases={samplePhases}
        >
          <div>content</div>
        </LessonPageLayout>
      );
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('progress bar reflects completed phase count', () => {
      const { container } = render(
        <LessonPageLayout
          lessonTitle="Linear Functions"
          moduleLabel="Module 1"
          lessonNumber={1}
          phases={samplePhases}
        >
          <div>content</div>
        </LessonPageLayout>
      );
      const progressBar = container.querySelector('[role="progressbar"]');
      // 1 of 3 phases complete → 33%
      expect(progressBar).toHaveAttribute('aria-valuenow', '33');
    });

    it('shows 100% when all phases are completed', () => {
      const allComplete: PhaseNavItem[] = [
        { phaseType: 'explore', label: 'Explore', completed: true, isCurrent: false },
        { phaseType: 'learn', label: 'Learn', completed: true, isCurrent: false },
      ];
      const { container } = render(
        <LessonPageLayout
          lessonTitle="Linear Functions"
          moduleLabel="Module 1"
          lessonNumber={1}
          phases={allComplete}
        >
          <div>content</div>
        </LessonPageLayout>
      );
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });
  });

  describe('main content', () => {
    it('renders children in the main content area', () => {
      render(
        <LessonPageLayout
          lessonTitle="Linear Functions"
          moduleLabel="Module 1"
          lessonNumber={1}
          phases={samplePhases}
        >
          <p>Main lesson content</p>
        </LessonPageLayout>
      );
      expect(screen.getByText('Main lesson content')).toBeInTheDocument();
    });

    it('has a constrained max-width for readability', () => {
      const { container } = render(
        <LessonPageLayout
          lessonTitle="Linear Functions"
          moduleLabel="Module 1"
          lessonNumber={1}
          phases={samplePhases}
        >
          <div>content</div>
        </LessonPageLayout>
      );
      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
      expect(main?.className).toMatch(/max-w-/);
    });
  });

  describe('accessibility', () => {
    it('has a main landmark', () => {
      render(
        <LessonPageLayout
          lessonTitle="Linear Functions"
          moduleLabel="Module 1"
          lessonNumber={1}
          phases={samplePhases}
        >
          <div>content</div>
        </LessonPageLayout>
      );
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('has a navigation landmark for phases', () => {
      render(
        <LessonPageLayout
          lessonTitle="Linear Functions"
          moduleLabel="Module 1"
          lessonNumber={1}
          phases={samplePhases}
        >
          <div>content</div>
        </LessonPageLayout>
      );
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });
});
