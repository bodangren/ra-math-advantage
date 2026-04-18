import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StepRevealContainer } from '@/components/textbook/StepRevealContainer';

describe('StepRevealContainer', () => {
  describe('teaching mode', () => {
    it('renders all steps visible when mode is teaching', () => {
      render(
        <StepRevealContainer mode="teaching" steps={[
          { content: 'Step 1 content' },
          { content: 'Step 2 content' },
          { content: 'Step 3 content' }
        ]} />
      );

      expect(screen.getByText('Step 1 content')).toBeInTheDocument();
      expect(screen.getByText('Step 2 content')).toBeInTheDocument();
      expect(screen.getByText('Step 3 content')).toBeInTheDocument();
    });

    it('does not show reveal button in teaching mode', () => {
      render(
        <StepRevealContainer mode="teaching" steps={[
          { content: 'Step 1 content' }
        ]} />
      );

      expect(screen.queryByText(/Show Next Step/i)).not.toBeInTheDocument();
    });

    it('renders step numbers in teaching mode', () => {
      render(
        <StepRevealContainer mode="teaching" steps={[
          { content: 'First' },
          { content: 'Second' },
          { content: 'Third' }
        ]} />
      );

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('guided mode', () => {
    it('renders only first step initially in guided mode', () => {
      render(
        <StepRevealContainer mode="guided" steps={[
          { content: 'Step 1' },
          { content: 'Step 2' },
          { content: 'Step 3' }
        ]} />
      );

      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.queryByText('Step 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Step 3')).not.toBeInTheDocument();
    });

    it('shows reveal button in guided mode', () => {
      render(
        <StepRevealContainer mode="guided" steps={[
          { content: 'Step 1' },
          { content: 'Step 2' }
        ]} />
      );

      expect(screen.getByText(/Show Next Step/i)).toBeInTheDocument();
    });

    it('reveals next step when button is clicked', async () => {
      render(
        <StepRevealContainer mode="guided" steps={[
          { content: 'Step 1' },
          { content: 'Step 2' },
          { content: 'Step 3' }
        ]} />
      );

      const button = screen.getByText(/Show Next Step/i);
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Step 2')).toBeInTheDocument();
      });
    });

    it('reveals steps one at a time', async () => {
      render(
        <StepRevealContainer mode="guided" steps={[
          { content: 'Step 1' },
          { content: 'Step 2' },
          { content: 'Step 3' }
        ]} />
      );

      // Initially only step 1 is visible
      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.queryByText('Step 2')).not.toBeInTheDocument();

      // Click to reveal step 2
      const button = screen.getByText(/Show Next Step/i);
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Step 2')).toBeInTheDocument();
      });
      expect(screen.queryByText('Step 3')).not.toBeInTheDocument();

      // Click to reveal step 3
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Step 3')).toBeInTheDocument();
      });
    });

    it('hides button after all steps are revealed', async () => {
      render(
        <StepRevealContainer mode="guided" steps={[
          { content: 'Step 1' },
          { content: 'Step 2' }
        ]} />
      );

      const button = screen.getByText(/Show Next Step/i);

      // Reveal step 2
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.queryByText(/Show Next Step/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('practice mode', () => {
    it('behaves same as guided mode in practice mode', () => {
      render(
        <StepRevealContainer mode="practice" steps={[
          { content: 'Step 1' },
          { content: 'Step 2' }
        ]} />
      );

      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.queryByText('Step 2')).not.toBeInTheDocument();
      expect(screen.getByText(/Show Next Step/i)).toBeInTheDocument();
    });
  });

  describe('animation', () => {
    it('applies animation classes when steps are revealed', async () => {
      render(
        <StepRevealContainer mode="guided" steps={[
          { content: 'Step 1' },
          { content: 'Step 2' }
        ]} />
      );

      const button = screen.getByText(/Show Next Step/i);
      fireEvent.click(button);

      await waitFor(() => {
        const step2 = screen.getByText('Step 2');
        expect(step2).toBeInTheDocument();
        // Check for animation-related classes
        expect(step2.closest('[class*="animate-"]') || step2.closest('[class*="transition-"]')).toBeTruthy();
      });
    });
  });

  describe('keyboard accessibility', () => {
    it('is keyboard navigable', () => {
      render(
        <StepRevealContainer mode="guided" steps={[
          { content: 'Step 1' },
          { content: 'Step 2' }
        ]} />
      );

      const button = screen.getByText(/Show Next Step/i);
      expect(button).toHaveAttribute('type', 'button');
    });

    it('can be activated with Enter key', async () => {
      render(
        <StepRevealContainer mode="guided" steps={[
          { content: 'Step 1' },
          { content: 'Step 2' }
        ]} />
      );

      const button = screen.getByText(/Show Next Step/i);
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Step 2')).toBeInTheDocument();
      });
    });

    it('can be activated with Space key', async () => {
      render(
        <StepRevealContainer mode="guided" steps={[
          { content: 'Step 1' },
          { content: 'Step 2' }
        ]} />
      );

      const button = screen.getByText(/Show Next Step/i);
      button.focus();
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });

      await waitFor(() => {
        expect(screen.getByText('Step 2')).toBeInTheDocument();
      });
    });
  });

  describe('edge cases', () => {
    it('renders with single step', () => {
      render(
        <StepRevealContainer mode="guided" steps={[
          { content: 'Only step' }
        ]} />
      );

      expect(screen.getByText('Only step')).toBeInTheDocument();
      expect(screen.queryByText(/Show Next Step/i)).not.toBeInTheDocument();
    });

    it('renders with empty steps array', () => {
      const { container } = render(
        <StepRevealContainer mode="guided" steps={[]} />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders with steps containing complex content', () => {
      render(
        <StepRevealContainer mode="teaching" steps={[
          { content: <div><p>Paragraph 1</p><p>Paragraph 2</p></div> }
        ]} />
      );

      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
    });
  });
});
