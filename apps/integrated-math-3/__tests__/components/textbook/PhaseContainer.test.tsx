import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PhaseContainer } from '@/components/textbook/PhaseContainer';
import { PHASE_TYPES, type PhaseType } from '@math-platform/activity-runtime/phase-types';

describe('PhaseContainer', () => {
  describe('renders all 10 phase types', () => {
    PHASE_TYPES.forEach((phaseType: PhaseType) => {
      it(`renders without error for phaseType="${phaseType}"`, () => {
        const { container } = render(
          <PhaseContainer phaseType={phaseType}>
            <p>Phase content for {phaseType}</p>
          </PhaseContainer>
        );
        expect(container.firstChild).toBeInTheDocument();
        expect(screen.getByText(`Phase content for ${phaseType}`)).toBeInTheDocument();
      });
    });
  });

  describe('distinct visual treatment per phaseType', () => {
    it('applies a background class', () => {
      const { container } = render(
        <PhaseContainer phaseType="explore">
          <p>content</p>
        </PhaseContainer>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toMatch(/bg-/);
    });

    it('applies different background for different phaseTypes', () => {
      const { container: c1 } = render(
        <PhaseContainer phaseType="explore"><p>a</p></PhaseContainer>
      );
      const { container: c2 } = render(
        <PhaseContainer phaseType="assessment"><p>b</p></PhaseContainer>
      );
      const cls1 = (c1.firstChild as HTMLElement).className;
      const cls2 = (c2.firstChild as HTMLElement).className;
      expect(cls1).not.toBe(cls2);
    });

    it('includes a phase label for accessibility', () => {
      render(
        <PhaseContainer phaseType="explore">
          <p>content</p>
        </PhaseContainer>
      );
      // Should show the phase label (e.g. "Explore")
      expect(screen.getByText('Explore')).toBeInTheDocument();
    });

    it('shows correct label for each phaseType', () => {
      const expected: Record<PhaseType, string> = {
        explore: 'Explore',
        vocabulary: 'Vocabulary',
        learn: 'Learn',
        key_concept: 'Key Concept',
        worked_example: 'Example',
        guided_practice: 'Guided Practice',
        independent_practice: 'Practice',
        assessment: 'Assessment',
        discourse: 'Think About It',
        reflection: 'Reflection',
      };

      PHASE_TYPES.forEach((phaseType: PhaseType) => {
        const { unmount } = render(
          <PhaseContainer phaseType={phaseType}>
            <p>content</p>
          </PhaseContainer>
        );
        expect(screen.getByText(expected[phaseType])).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('children rendering', () => {
    it('renders children', () => {
      render(
        <PhaseContainer phaseType="learn">
          <h2>Section Title</h2>
          <p>Section body</p>
        </PhaseContainer>
      );
      expect(screen.getByText('Section Title')).toBeInTheDocument();
      expect(screen.getByText('Section body')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('uses a section element', () => {
      const { container } = render(
        <PhaseContainer phaseType="learn">
          <p>content</p>
        </PhaseContainer>
      );
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('has an aria-label describing the phase type', () => {
      const { container } = render(
        <PhaseContainer phaseType="worked_example">
          <p>content</p>
        </PhaseContainer>
      );
      const section = container.querySelector('section');
      expect(section).toHaveAttribute('aria-label');
    });
  });
});
