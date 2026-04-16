import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardProgressBar } from '@/components/student/CardProgressBar';

describe('CardProgressBar', () => {
  describe('displays correct count', () => {
    it('renders current index and total count', () => {
      render(<CardProgressBar currentIndex={3} totalCount={10} />);

      const counter = screen.getByTestId('card-progress-counter');
      expect(counter).toHaveTextContent('4 / 10');
    });

    it('handles first card (index 0)', () => {
      render(<CardProgressBar currentIndex={0} totalCount={5} />);

      const counter = screen.getByTestId('card-progress-counter');
      expect(counter).toHaveTextContent('1 / 5');
    });

    it('handles last card', () => {
      render(<CardProgressBar currentIndex={9} totalCount={10} />);

      const counter = screen.getByTestId('card-progress-counter');
      expect(counter).toHaveTextContent('10 / 10');
    });
  });

  describe('accessible progress bar', () => {
    it('has correct aria-valuenow', () => {
      render(<CardProgressBar currentIndex={4} totalCount={8} />);

      const progressBar = screen.getByTestId('card-progress-bar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '5');
    });

    it('has correct aria-valuemin', () => {
      render(<CardProgressBar currentIndex={0} totalCount={10} />);

      const progressBar = screen.getByTestId('card-progress-bar');
      expect(progressBar).toHaveAttribute('aria-valuemin', '1');
    });

    it('has correct aria-valuemax', () => {
      render(<CardProgressBar currentIndex={0} totalCount={15} />);

      const progressBar = screen.getByTestId('card-progress-bar');
      expect(progressBar).toHaveAttribute('aria-valuemax', '15');
    });

    it('has role="progressbar"', () => {
      render(<CardProgressBar currentIndex={0} totalCount={5} />);

      const progressBar = screen.getByTestId('card-progress-bar');
      expect(progressBar).toHaveAttribute('role', 'progressbar');
    });

    it('has aria-label with descriptive text', () => {
      render(<CardProgressBar currentIndex={2} totalCount={7} />);

      const progressBar = screen.getByTestId('card-progress-bar');
      expect(progressBar).toHaveAttribute('aria-label', 'Card 3 of 7');
    });
  });

  describe('responsive layout', () => {
    it('renders in a div container', () => {
      const { container } = render(<CardProgressBar currentIndex={0} totalCount={5} />);

      expect(container.firstChild).toBeInTheDocument();
    });
  });
});