'use client';

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiscriminantAnalyzer } from '@/components/activities/discriminant/DiscriminantAnalyzer';

const defaultProps = {
  activityId: 'test-activity',
  mode: 'teaching' as const,
  onSubmit: vi.fn(),
  onComplete: vi.fn(),
};

describe('DiscriminantAnalyzer', () => {
  describe('teaching mode', () => {
    it('renders the equation', () => {
      render(
        <DiscriminantAnalyzer
          {...defaultProps}
          equation="x^2 + 5x + 6"
        />
      );

      expect(screen.getByText(/x\^2\s*\+\s*5x\s*\+\s*6/i)).toBeInTheDocument();
    });

    it('displays labeled coefficients a, b, c', () => {
      render(
        <DiscriminantAnalyzer
          {...defaultProps}
          equation="2x^2 + 3x - 2"
          coefficients={{ a: 2, b: 3, c: -2 }}
        />
      );

      expect(screen.getByText(/a\s*=\s*2/i)).toBeInTheDocument();
      expect(screen.getByText(/b\s*=\s*3/i)).toBeInTheDocument();
      expect(screen.getByText(/c\s*=\s*-2/i)).toBeInTheDocument();
    });

    it('shows the discriminant formula', () => {
      render(
        <DiscriminantAnalyzer
          {...defaultProps}
          equation="x^2 + 5x + 6"
        />
      );

      expect(screen.getByText(/b²\s*-\s*4ac/i)).toBeInTheDocument();
    });

    it('computes and displays the discriminant value', () => {
      render(
        <DiscriminantAnalyzer
          {...defaultProps}
          equation="x^2 + 5x + 6"
          coefficients={{ a: 1, b: 5, c: 6 }}
        />
      );

      expect(screen.getByText(/\(5\)²\s*-\s*4\(1\)\(6\)\s*=\s*25\s*-\s*24\s*=\s*1/)).toBeInTheDocument();
    });

    it('classifies as "two distinct real roots" when discriminant > 0', () => {
      render(
        <DiscriminantAnalyzer
          {...defaultProps}
          equation="x^2 + 5x + 6"
          coefficients={{ a: 1, b: 5, c: 6 }}
        />
      );

      expect(screen.getByText(/two\s+distinct\s+real\s+roots/i)).toBeInTheDocument();
    });

    it('classifies as "one repeated real root" when discriminant = 0', () => {
      render(
        <DiscriminantAnalyzer
          {...defaultProps}
          equation="x^2 + 2x + 1"
          coefficients={{ a: 1, b: 2, c: 1 }}
        />
      );

      expect(screen.getByText(/one\s+repeated\s+real\s+root/i)).toBeInTheDocument();
    });

    it('classifies as "two complex roots" when discriminant < 0', () => {
      render(
        <DiscriminantAnalyzer
          {...defaultProps}
          equation="x^2 + 2x + 5"
          coefficients={{ a: 1, b: 2, c: 5 }}
        />
      );

      expect(screen.getByText(/two\s+complex\s+roots/i)).toBeInTheDocument();
    });
  });

  describe('guided mode', () => {
    it('shows one step at a time', () => {
      render(
        <DiscriminantAnalyzer
          {...defaultProps}
          mode="guided"
          equation="x^2 + 5x + 6"
          coefficients={{ a: 1, b: 5, c: 6 }}
        />
      );

      const stepIndicator = screen.getByText(/\d+\s+of\s+\d+/i);
      expect(stepIndicator).toBeInTheDocument();
    });

    it('has input fields for coefficient identification', () => {
      render(
        <DiscriminantAnalyzer
          {...defaultProps}
          mode="guided"
          equation="2x^2 + 3x - 2"
        />
      );

      const textboxes = screen.getAllByRole('textbox');
      expect(textboxes.length).toBeGreaterThan(0);
    });

    it('has next button to advance steps', () => {
      render(
        <DiscriminantAnalyzer
          {...defaultProps}
          mode="guided"
          equation="x^2 + 5x + 6"
        />
      );

      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });
  });

  describe('practice mode', () => {
    it('shows equation without solution', () => {
      render(
        <DiscriminantAnalyzer
          {...defaultProps}
          mode="practice"
          equation="x^2 + 5x + 6"
        />
      );

      expect(screen.getByText(/x\^2\s*\+\s*5x\s*\+\s*6/i)).toBeInTheDocument();
    });

    it('has input field for discriminant value', () => {
      render(
        <DiscriminantAnalyzer
          {...defaultProps}
          mode="practice"
          equation="x^2 + 5x + 6"
        />
      );

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('has submit button', () => {
      render(
        <DiscriminantAnalyzer
          {...defaultProps}
          mode="practice"
          equation="x^2 + 5x + 6"
        />
      );

      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });
  });
});
