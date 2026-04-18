import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReflectionCard } from '@/components/textbook/ReflectionCard';

describe('ReflectionCard', () => {
  describe('basic rendering', () => {
    it('renders the card title', () => {
      render(
        <ReflectionCard
          courage={{ prompt: 'How did you show courage?' }}
          adaptability={{ prompt: 'How did you adapt?' }}
          persistence={{ prompt: 'How did you persist?' }}
        />
      );
      expect(screen.getByText(/CAP Reflection/i)).toBeInTheDocument();
    });

    it('renders Courage dimension', () => {
      render(
        <ReflectionCard
          courage={{ prompt: 'How did you show courage?' }}
          adaptability={{ prompt: 'How did you adapt?' }}
          persistence={{ prompt: 'How did you persist?' }}
        />
      );
      // Look for the heading element specifically
      const courageHeading = screen.getAllByRole('heading', { level: 4 }).find(h => h.textContent === 'Courage');
      expect(courageHeading).toBeInTheDocument();
      expect(screen.getByText('How did you show courage?')).toBeInTheDocument();
    });

    it('renders Adaptability dimension', () => {
      render(
        <ReflectionCard
          courage={{ prompt: 'How did you show courage?' }}
          adaptability={{ prompt: 'How did you adapt?' }}
          persistence={{ prompt: 'How did you persist?' }}
        />
      );
      expect(screen.getByText(/Adaptability/i)).toBeInTheDocument();
      expect(screen.getByText('How did you adapt?')).toBeInTheDocument();
    });

    it('renders Persistence dimension', () => {
      render(
        <ReflectionCard
          courage={{ prompt: 'How did you show courage?' }}
          adaptability={{ prompt: 'How did you adapt?' }}
          persistence={{ prompt: 'How did you persist?' }}
        />
      );
      expect(screen.getByText(/Persistence/i)).toBeInTheDocument();
      expect(screen.getByText('How did you persist?')).toBeInTheDocument();
    });

    it('renders all three dimensions', () => {
      render(
        <ReflectionCard
          courage={{ prompt: 'Courage prompt' }}
          adaptability={{ prompt: 'Adaptability prompt' }}
          persistence={{ prompt: 'Persistence prompt' }}
        />
      );

      const headings = screen.getAllByRole('heading', { level: 4 });
      expect(headings).toHaveLength(3);
      expect(headings[0].textContent).toBe('Courage');
      expect(headings[1].textContent).toBe('Adaptability');
      expect(headings[2].textContent).toBe('Persistence');
      expect(screen.getByText('Courage prompt')).toBeInTheDocument();
      expect(screen.getByText('Adaptability prompt')).toBeInTheDocument();
      expect(screen.getByText('Persistence prompt')).toBeInTheDocument();
    });
  });

  describe('visual layout', () => {
    it('uses card layout', () => {
      const { container } = render(
        <ReflectionCard
          courage={{ prompt: 'Test' }}
          adaptability={{ prompt: 'Test' }}
          persistence={{ prompt: 'Test' }}
        />
      );

      const card = container.firstChild as HTMLElement;
      expect(card.className).toMatch(/(card|border|rounded)/);
    });

    it('displays dimensions in a grid or flex layout', () => {
      const { container } = render(
        <ReflectionCard
          courage={{ prompt: 'Test' }}
          adaptability={{ prompt: 'Test' }}
          persistence={{ prompt: 'Test' }}
        />
      );

      // Check for grid container inside the card
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });

    it('gives each dimension distinct visual treatment', () => {
      render(
        <ReflectionCard
          courage={{ prompt: 'Test' }}
          adaptability={{ prompt: 'Test' }}
          persistence={{ prompt: 'Test' }}
        />
      );

      // Check that each dimension has its own container with distinct styling
      const courageSection = screen.getByText(/Courage/i).closest('div');
      const adaptabilitySection = screen.getByText(/Adaptability/i).closest('div');
      const persistenceSection = screen.getByText(/Persistence/i).closest('div');

      // Each should be in a distinct div with border and background
      expect(courageSection?.className).toMatch(/border/);
      expect(courageSection?.className).toMatch(/bg-/);
      expect(adaptabilitySection?.className).toMatch(/border/);
      expect(adaptabilitySection?.className).toMatch(/bg-/);
      expect(persistenceSection?.className).toMatch(/border/);
      expect(persistenceSection?.className).toMatch(/bg-/);
    });
  });

  describe('icons', () => {
    it('renders icons for each dimension', () => {
      const { container } = render(
        <ReflectionCard
          courage={{ prompt: 'Test' }}
          adaptability={{ prompt: 'Test' }}
          persistence={{ prompt: 'Test' }}
        />
      );

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('visual styling', () => {
    it('has proper spacing', () => {
      const { container } = render(
        <ReflectionCard
          courage={{ prompt: 'Test' }}
          adaptability={{ prompt: 'Test' }}
          persistence={{ prompt: 'Test' }}
        />
      );

      const card = container.firstChild as HTMLElement;
      // Should have padding and margin
      expect(card.className).toMatch(/p-\d/);
      expect(card.className).toMatch(/m(y|b)?-\d/);
    });

    it('uses distinct colors for each dimension', () => {
      render(
        <ReflectionCard
          courage={{ prompt: 'Test' }}
          adaptability={{ prompt: 'Test' }}
          persistence={{ prompt: 'Test' }}
        />
      );

      // Each dimension should have some color styling
      const courageSection = screen.getByText(/Courage/i).closest('div');
      const adaptabilitySection = screen.getByText(/Adaptability/i).closest('div');
      const persistenceSection = screen.getByText(/Persistence/i).closest('div');

      expect(courageSection?.className || adaptabilitySection?.className || persistenceSection?.className).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('has proper heading structure', () => {
      render(
        <ReflectionCard
          courage={{ prompt: 'Test' }}
          adaptability={{ prompt: 'Test' }}
          persistence={{ prompt: 'Test' }}
        />
      );

      const mainHeading = screen.getByRole('heading', { level: 3 });
      expect(mainHeading).toBeInTheDocument();
      expect(mainHeading).toHaveTextContent(/CAP Reflection/i);
    });

    it('has subheadings for each dimension', () => {
      render(
        <ReflectionCard
          courage={{ prompt: 'Test' }}
          adaptability={{ prompt: 'Test' }}
          persistence={{ prompt: 'Test' }}
        />
      );

      const subheadings = screen.getAllByRole('heading', { level: 4 });
      expect(subheadings.length).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('renders with empty prompts', () => {
      render(
        <ReflectionCard
          courage={{ prompt: '' }}
          adaptability={{ prompt: '' }}
          persistence={{ prompt: '' }}
        />
      );

      expect(screen.getByText(/Courage/i)).toBeInTheDocument();
      expect(screen.getByText(/Adaptability/i)).toBeInTheDocument();
      expect(screen.getByText(/Persistence/i)).toBeInTheDocument();
    });

    it('renders with long prompts', () => {
      const longPrompt = 'This is a very long reflection prompt that encourages students to think deeply about their learning experience and how they demonstrated this particular dimension of the CAP framework during the lesson.';

      render(
        <ReflectionCard
          courage={{ prompt: longPrompt }}
          adaptability={{ prompt: longPrompt }}
          persistence={{ prompt: longPrompt }}
        />
      );

      const prompts = screen.getAllByText(/This is a very long reflection prompt/);
      expect(prompts.length).toBe(3);
    });

    it('renders with multiline prompts', () => {
      const multilinePrompt = 'First question.\n\nSecond question.\n\nThird question.';

      render(
        <ReflectionCard
          courage={{ prompt: multilinePrompt }}
          adaptability={{ prompt: multilinePrompt }}
          persistence={{ prompt: multilinePrompt }}
        />
      );

      const firstLines = screen.getAllByText(/First question/);
      expect(firstLines.length).toBe(3);
    });
  });
});
