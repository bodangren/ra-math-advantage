import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DiscoursePrompt } from '@/components/textbook/DiscoursePrompt';

describe('DiscoursePrompt', () => {
  describe('basic rendering', () => {
    it('renders the prompt text', () => {
      render(<DiscoursePrompt prompt="Think about how quadratic functions relate to parabolas." />);
      expect(screen.getByText('Think about how quadratic functions relate to parabolas.')).toBeInTheDocument();
    });

    it('renders with default title', () => {
      render(<DiscoursePrompt prompt="Test prompt" />);
      expect(screen.getByText(/Think About It/i)).toBeInTheDocument();
    });

    it('renders with custom title', () => {
      render(
        <DiscoursePrompt
          prompt="Test prompt"
          title="Discussion Question"
        />
      );
      expect(screen.getByText('Discussion Question')).toBeInTheDocument();
    });
  });

  describe('expandable area', () => {
    it('renders expandable area when provided', () => {
      render(
        <DiscoursePrompt
          prompt="Test prompt"
          expandableArea={<p>Student response area</p>}
        />
      );

      // Expand to show the content
      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByText('Student response area')).toBeInTheDocument();
    });

    it('does not render expandable area when not provided', () => {
      render(<DiscoursePrompt prompt="Test prompt" />);
      // Should not have expandable content
      expect(screen.queryByText(/Your response/i)).not.toBeInTheDocument();
    });

    it('is collapsed by default when expandable', () => {
      render(
        <DiscoursePrompt
          prompt="Test prompt"
          expandableArea={<p>Hidden content</p>}
        />
      );

      const content = screen.queryByText('Hidden content');
      expect(content).not.toBeInTheDocument();
    });

    it('expands when clicked', () => {
      render(
        <DiscoursePrompt
          prompt="Test prompt"
          expandableArea={<p>Hidden content</p>}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByText('Hidden content')).toBeInTheDocument();
    });

    it('collapses when clicked again', () => {
      render(
        <DiscoursePrompt
          prompt="Test prompt"
          expandableArea={<p>Hidden content</p>}
        />
      );

      const button = screen.getByRole('button');

      // Click to expand
      fireEvent.click(button);
      expect(screen.getByText('Hidden content')).toBeInTheDocument();

      // Click to collapse
      fireEvent.click(button);
      expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
    });

    it('updates button text based on expanded state', () => {
      render(
        <DiscoursePrompt
          prompt="Test prompt"
          expandableArea={<p>Content</p>}
        />
      );

      const button = screen.getByRole('button');

      // Initially collapsed
      expect(button).toHaveTextContent(/Show/i);

      // Click to expand
      fireEvent.click(button);
      expect(button).toHaveTextContent(/Hide/i);
    });
  });

  describe('visual styling', () => {
    it('has visually distinct styling', () => {
      const { container } = render(
        <DiscoursePrompt prompt="Test prompt" />
      );

      const promptContainer = container.firstChild as HTMLElement;
      expect(promptContainer.className.length).toBeGreaterThan(0);
      // Should have styling classes
      expect(promptContainer.className).toMatch(/(bg-|border-|p-|m-)/);
    });

    it('uses distinct color scheme', () => {
      const { container } = render(
        <DiscoursePrompt prompt="Test prompt" />
      );

      const promptContainer = container.firstChild as HTMLElement;
      // Should have accent or distinct color classes
      expect(promptContainer.className).toMatch(/(accent|primary|secondary)/);
    });

    it('has proper spacing', () => {
      const { container } = render(
        <DiscoursePrompt prompt="Test prompt" />
      );

      const promptContainer = container.firstChild as HTMLElement;
      // Should have padding and margin
      expect(promptContainer.className).toMatch(/p-\d/);
      expect(promptContainer.className).toMatch(/m(y|b)?-\d/);
    });
  });

  describe('icon', () => {
    it('renders an icon', () => {
      const { container } = render(
        <DiscoursePrompt prompt="Test prompt" />
      );

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper heading structure for title', () => {
      render(<DiscoursePrompt prompt="Test prompt" />);
      const heading = screen.getByRole('heading', { level: 4 });
      expect(heading).toBeInTheDocument();
    });

    it('button is keyboard accessible', () => {
      render(
        <DiscoursePrompt
          prompt="Test prompt"
          expandableArea={<p>Content</p>}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('button has proper aria attributes', () => {
      render(
        <DiscoursePrompt
          prompt="Test prompt"
          expandableArea={<p>Content</p>}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('updates aria-expanded when expanded', () => {
      render(
        <DiscoursePrompt
          prompt="Test prompt"
          expandableArea={<p>Content</p>}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('edge cases', () => {
    it('renders with empty prompt', () => {
      const { container } = render(<DiscoursePrompt prompt="" />);
      // Should render the component even with empty prompt
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText(/Think About It/i)).toBeInTheDocument();
    });

    it('renders with long prompt', () => {
      const longPrompt = 'This is a very long discourse prompt that should wrap properly and encourage students to think deeply about the mathematical concepts being presented. It should maintain readability and visual appeal even when extended.';
      render(<DiscoursePrompt prompt={longPrompt} />);
      expect(screen.getByText(longPrompt)).toBeInTheDocument();
    });

    it('renders with multiline prompt', () => {
      const multilinePrompt = 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.';
      render(<DiscoursePrompt prompt={multilinePrompt} />);

      expect(screen.getByText(/First paragraph/)).toBeInTheDocument();
      expect(screen.getByText(/Second paragraph/)).toBeInTheDocument();
      expect(screen.getByText(/Third paragraph/)).toBeInTheDocument();
    });

    it('renders with complex expandable content', () => {
      render(
        <DiscoursePrompt
          prompt="Test prompt"
          expandableArea={
            <div>
              <p>Paragraph 1</p>
              <ul><li>Item 1</li><li>Item 2</li></ul>
            </div>
          }
        />
      );

      // Content is collapsed by default
      expect(screen.queryByText('Paragraph 1')).not.toBeInTheDocument();

      // Expand to show the content
      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });
  });
});
